import os
import sys
import io
import json
import asyncio
import unittest
from PIL import Image, ImageDraw
from fastapi import UploadFile

# Add server directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

import database
from main import (
    identity_register,
    identity_verify,
    identity_update_biometric,
    identity_get_demo_animals,
    identity_check_duplicate,
    identity_get_record,
    iris_service
)
from iris.iris_config import (
    STATUS_VERIFIED,
    STATUS_POSSIBLE_MATCH,
    STATUS_LOW_QUALITY,
    STATUS_MODEL_NOT_LOADED
)
from iris.iris_quality import assess_image_quality
from iris.iris_detector import BovineEyeDetector
from iris.bpa_repository import BPARepository

def create_synthetic_eye_image(width=300, height=300, dark_pupil=True):
    """Generates a synthetic high-contrast image simulating a bovine eye."""
    img = Image.new("RGB", (width, height), color=(180, 160, 140))
    draw = ImageDraw.Draw(img)

    cx, cy = width // 2, height // 2
    # Sclera / Outer circle
    draw.ellipse([cx - 90, cy - 70, cx + 90, cy + 70], fill=(220, 215, 205), outline=(100, 80, 60), width=2)
    # Iris circle
    draw.ellipse([cx - 65, cy - 55, cx + 65, cy + 55], fill=(90, 60, 40), outline=(40, 30, 20), width=2)
    # Bovine transverse oval pupil
    if dark_pupil:
        draw.ellipse([cx - 32, cy - 18, cx + 32, cy + 18], fill=(15, 12, 10))
    # Highlights / reflections
    draw.ellipse([cx - 15, cy - 25, cx - 5, cy - 15], fill=(255, 255, 255))

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    return buf.getvalue()

def create_blurry_image(width=100, height=100):
    """Generates an undersized, low-contrast, blurred image for quality rejection tests."""
    img = Image.new("RGB", (width, height), color=(128, 128, 128))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=20)
    return buf.getvalue()

class TestIrisBiometricLayer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        database.init_db()
        cls.good_eye_bytes = create_synthetic_eye_image()
        cls.bad_eye_bytes = create_blurry_image()

    def test_01_bpa_format_and_mock_repository(self):
        """Test BPA 12-digit tag validation and mock repository records."""
        self.assertTrue(BPARepository.validate_bpa_format("123456789012"))
        self.assertFalse(BPARepository.validate_bpa_format("12345"))
        self.assertFalse(BPARepository.validate_bpa_format("12345ABC9012"))

        demos = BPARepository.list_demo_animals()
        self.assertGreaterEqual(len(demos), 4)
        tag_1 = BPARepository.get_animal_by_tag("123456789012")
        self.assertIsNotNone(tag_1)
        self.assertEqual(tag_1["initial_registration_stage"], "Calf")
        self.assertTrue(tag_1["is_mock"])

    def test_02_quality_assessment(self):
        """Test pre-processing image quality checks."""
        # Good eye image
        good_q = assess_image_quality(self.good_eye_bytes)
        self.assertTrue(good_q["is_acceptable"])
        self.assertGreater(good_q["quality_score"], 0.40)
        self.assertEqual(len(good_q["issues"]), 0)

        # Bad / blurry image
        bad_q = assess_image_quality(self.bad_eye_bytes)
        self.assertFalse(bad_q["is_acceptable"])
        self.assertGreater(len(bad_q["issues"]), 0)

    def test_03_no_fake_ai_when_demo_disabled(self):
        """Test that system strictly returns MODEL_NOT_LOADED when demo mode is false and weights are absent."""
        import iris.iris_config as config
        original_demo = config.IRIS_DEMO_MODE
        try:
            config.IRIS_DEMO_MODE = False
            detector = BovineEyeDetector()
            detector.is_model_loaded = False
            res = detector.detect_eye(self.good_eye_bytes)
            self.assertFalse(res["success"])
            self.assertEqual(res["status"], STATUS_MODEL_NOT_LOADED)
            self.assertIn("not loaded", res["message"].lower())
        finally:
            config.IRIS_DEMO_MODE = original_demo

    def test_04_calf_eligibility_rule(self):
        """Test that only animals enrolled as calves can undergo biometric lifecycle re-enrollment."""
        # Enrolled adult animal: 234567890123 was registered as Juvenile
        res = iris_service.update_biometric_lifecycle(
            bpa_tag_id="234567890123",
            current_age_months=40,
            new_growth_stage="Adult",
            eye_image_bytes=self.good_eye_bytes
        )
        self.assertFalse(res["success"])
        self.assertEqual(res["status"], "NOT_CALF_ORIGIN")
        self.assertIn("intended for animals originally enrolled during the calf stage", res["message"])

    def test_05_biometric_registration_and_v1_template(self):
        """Test registering a new calf and verifying template V1 creation."""
        new_tag = "555566667777"
        conn = database.get_db()
        c = conn.cursor()
        c.execute("DELETE FROM biometric_templates WHERE animal_identity_id IN (SELECT id FROM animal_identities WHERE bpa_tag_id = ?)", (new_tag,))
        c.execute("DELETE FROM animal_identities WHERE bpa_tag_id = ?", (new_tag,))
        conn.commit()
        conn.close()

        res = iris_service.register_animal(
            bpa_tag_id=new_tag,
            animal_type="Cattle",
            breed="Tharparkar",
            age_months=4,
            growth_stage="Calf",
            eye_image_bytes=self.good_eye_bytes
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["template_version"], "V1")
        self.assertEqual(res["registration_stage"], "Calf")

        # Verify privacy: Raw template bitstream is NOT exposed in response
        self.assertNotIn("iris_template", res)
        self.assertNotIn("template_b64", res)

        # Check database record
        details = iris_service.get_animal_identity(new_tag)
        self.assertTrue(details["found"])
        self.assertEqual(len(details["biometric_templates"]), 1)
        self.assertEqual(details["biometric_templates"][0]["template_version_identifier"], "V1")
        self.assertTrue(details["biometric_update_allowed"])

    def test_06_calf_to_adult_lifecycle_update_retains_history(self):
        """Test that updating a calf biometric adds V2/V3 and retains all previous templates."""
        test_tag = "123456789012" # Seed calf animal with V1 and V2
        res = iris_service.update_biometric_lifecycle(
            bpa_tag_id=test_tag,
            current_age_months=30,
            new_growth_stage="Adult",
            eye_image_bytes=self.good_eye_bytes,
            force_update=True
        )
        self.assertTrue(res["success"])
        self.assertEqual(res["growth_stage"], "Adult")
        self.assertEqual(res["current_age_months"], 30)

        # Check that previous templates were preserved
        history = res["lifecycle_history"]
        versions = [h["template_version_identifier"] for h in history]
        self.assertIn("V1", versions)
        self.assertIn("V2", versions)
        self.assertGreaterEqual(res["retained_templates_count"], 3)

    def test_07_multi_template_verification(self):
        """Test multi-template verification against enrolled templates."""
        res = iris_service.verify_animal(
            bpa_tag_id="123456789012",
            eye_image_bytes=self.good_eye_bytes
        )
        self.assertTrue(res["success"])
        self.assertIn(res["decision"], [STATUS_VERIFIED, STATUS_POSSIBLE_MATCH])
        self.assertIsNotNone(res["best_match"])
        self.assertGreaterEqual(len(res["version_breakdown"]), 2)

    def test_08_low_quality_rejection(self):
        """Test that a low quality image triggers LOW_QUALITY status."""
        res = iris_service.verify_animal(
            bpa_tag_id="123456789012",
            eye_image_bytes=self.bad_eye_bytes
        )
        self.assertFalse(res["success"])
        self.assertEqual(res["decision"], STATUS_LOW_QUALITY)

    def test_09_fastapi_endpoints_direct_invocation(self):
        """Test API endpoints via direct invocation with mock UploadFile."""
        # 1. GET /api/identity/demo/animals
        demos = identity_get_demo_animals()
        self.assertGreaterEqual(len(demos), 4)

        # 2. GET /api/identity/{bpa_tag_id}
        rec = identity_get_record("123456789012")
        self.assertTrue(rec["found"])
        self.assertEqual(rec["animal"]["bpa_tag_id"], "123456789012")

        # 3. POST /api/identity/verify
        upload_good = UploadFile(filename="eye.jpg", file=io.BytesIO(self.good_eye_bytes))
        ver_res = asyncio.run(identity_verify(bpaTagId="123456789012", eyeImage=upload_good))
        self.assertTrue(ver_res["success"])
        self.assertIn(ver_res["decision"], [STATUS_VERIFIED, STATUS_POSSIBLE_MATCH])

        # 4. POST /api/identity/check-duplicate
        upload_dup = UploadFile(filename="eye_dup.jpg", file=io.BytesIO(self.good_eye_bytes))
        dup_res = asyncio.run(identity_check_duplicate(eyeImage=upload_dup))
        self.assertTrue(dup_res["success"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
