import uuid
import json
import sqlite3
from typing import Optional, List, Dict, Any

from .iris_config import (
    IRIS_DEMO_MODE,
    STATUS_VERIFIED,
    STATUS_POSSIBLE_MATCH,
    STATUS_NO_MATCH,
    STATUS_UNCERTAIN,
    STATUS_LOW_QUALITY,
    STATUS_MODEL_NOT_LOADED,
    LIFECYCLE_SCIENTIFIC_STATEMENT,
    BPA_INTEGRATION_STATEMENT
)
from .iris_quality import assess_image_quality
from .iris_detector import BovineEyeDetector
from .iris_segmenter import BovineIrisSegmenter
from .iris_normalizer import BovineIrisNormalizer
from .iris_encoder import BovineIrisEncoder
from .iris_matcher import BovineIrisMatcher
from .bpa_repository import BPARepository

class IrisBiometricService:
    """
    Central orchestration service for the Bovine Iris Biometric Layer.
    Adheres strictly to the single pipeline architecture: both camera captures
    and uploaded eye images enter this exact same pipeline.
    """
    def __init__(self, get_db_func):
        self.get_db = get_db_func
        self.detector = BovineEyeDetector()
        self.segmenter = BovineIrisSegmenter()
        self.normalizer = BovineIrisNormalizer()
        self.encoder = BovineIrisEncoder()
        self.matcher = BovineIrisMatcher()

    def process_eye_pipeline(self, eye_image_bytes: bytes) -> dict:
        """
        Runs the canonical 6-stage iris processing pipeline:
        1. Image Validation & Quality Check
        2. Eye Detection & Localization
        3. Iris & Pupil Segmentation
        4. Polar Rubber-Sheet Normalization
        5. Feature Extraction & Biometric Encoding
        6. Template Packaging
        """
        # Step 1: Quality Check
        quality = assess_image_quality(eye_image_bytes)
        if not quality["is_acceptable"]:
            return {
                "success": False,
                "status": STATUS_LOW_QUALITY,
                "message": "Eye image quality is insufficient. Please capture a clearer, steadier image.",
                "quality": quality,
                "template": None
            }

        # Step 2: Eye Detection
        det_result = self.detector.detect_eye(eye_image_bytes)
        if not det_result["success"]:
            return {
                "success": False,
                "status": det_result["status"],
                "message": det_result.get("message", "No bovine eye detected in frame."),
                "quality": quality,
                "template": None
            }

        crop_bytes = det_result["eye_crop_bytes"] or eye_image_bytes

        # Step 3: Iris Segmentation
        seg_result = self.segmenter.segment(crop_bytes)
        if not seg_result["success"]:
            return {
                "success": False,
                "status": seg_result["status"],
                "message": "Iris boundary segmentation failed. Please adjust angle and lighting.",
                "quality": quality,
                "template": None
            }

        # Step 4: Normalization
        norm_strip = self.normalizer.normalize(
            crop_bytes,
            seg_result["pupil_params"],
            seg_result["iris_params"]
        )

        # Step 5: Feature Encoding
        enc_result = self.encoder.encode(norm_strip)

        # Template packaging
        combined_quality = round((quality["quality_score"] + seg_result["segmentation_quality"]) / 2.0, 3)

        template_payload = {
            "template_b64": enc_result["template_b64"],
            "template_hash": enc_result["template_hash"],
            "feature_vector": enc_result["feature_vector"],
            "quality_score": combined_quality,
            "pupil_params": seg_result["pupil_params"],
            "iris_params": seg_result["iris_params"],
            "eye_bbox": det_result["bounding_box"],
            "is_demo": det_result["is_demo"] or seg_result["is_demo"]
        }

        return {
            "success": True,
            "status": "PROCESSED",
            "message": "Biometric iris template successfully extracted.",
            "quality": quality,
            "template": template_payload
        }

    def register_animal(
        self,
        bpa_tag_id: str,
        animal_type: str,
        breed: str,
        age_months: int,
        growth_stage: str,
        eye_image_bytes: bytes,
        eye_side: str = "right"
    ) -> dict:
        """
        Registers a new animal identity and enlists its initial biometric template (V1).
        Performs pre-registration duplicate checking across the existing database.
        """
        clean_tag = bpa_tag_id.replace(" ", "").strip()
        if not BPARepository.validate_bpa_format(clean_tag):
            return {
                "success": False,
                "status": "INVALID_TAG_FORMAT",
                "message": "BPA Tag ID must be a valid 12-digit numeric identifier."
            }

        # Process Eye Image
        pipeline_res = self.process_eye_pipeline(eye_image_bytes)
        if not pipeline_res["success"]:
            return pipeline_res

        template_data = pipeline_res["template"]

        conn = self.get_db()
        cursor = conn.cursor()

        # Check if animal tag already registered
        cursor.execute("SELECT id FROM animal_identities WHERE bpa_tag_id = ?", (clean_tag,))
        existing_animal = cursor.fetchone()
        if existing_animal:
            conn.close()
            return {
                "success": False,
                "status": "ALREADY_REGISTERED",
                "message": f"Animal with BPA Tag ID {clean_tag} is already registered in the system."
            }

        # Screen for potential duplicates against all existing animals
        cursor.execute("""
            SELECT bt.iris_template, bt.feature_vector, bt.template_version_identifier, ai.bpa_tag_id, ai.breed
            FROM biometric_templates bt
            JOIN animal_identities ai ON bt.animal_identity_id = ai.id
        """)
        enrolled_rows = cursor.fetchall()

        potential_duplicate = None
        for row in enrolled_rows:
            e_dict = dict(row)
            if e_dict["feature_vector"]:
                try:
                    e_dict["feature_vector"] = json.loads(e_dict["feature_vector"])
                except Exception:
                    e_dict["feature_vector"] = []

            match_res = self.matcher.match_against_single_template(template_data, e_dict)
            if match_res["status"] in (STATUS_VERIFIED, STATUS_POSSIBLE_MATCH):
                potential_duplicate = {
                    "matched_bpa_tag_id": e_dict["bpa_tag_id"],
                    "matched_breed": e_dict["breed"],
                    "matched_version": e_dict["template_version_identifier"],
                    "similarity_score": match_res["similarity_score"],
                    "hamming_distance": match_res["hamming_distance"]
                }
                break

        # Register Animal Record
        animal_id = f"anim_id_{uuid.uuid4().hex[:8]}"
        stage_clean = growth_stage.capitalize()
        is_demo_val = 1 if (IRIS_DEMO_MODE or template_data["is_demo"]) else 0

        cursor.execute("""
            INSERT INTO animal_identities (
                id, bpa_tag_id, animal_type, breed, registration_age_months,
                registration_stage, current_age_months, biometric_enrollment_status, is_demo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            animal_id,
            clean_tag,
            animal_type.capitalize(),
            breed,
            age_months,
            stage_clean,
            age_months,
            "enrolled",
            is_demo_val
        ))

        # Register Biometric Template V1
        template_id = f"bt_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO biometric_templates (
                id, animal_identity_id, template_version, eye_side, animal_age_months,
                growth_stage, iris_template, feature_vector, template_version_identifier,
                quality_score, verification_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            template_id,
            animal_id,
            1,
            eye_side,
            age_months,
            stage_clean,
            template_data["template_b64"], # Stored securely
            json.dumps(template_data["feature_vector"]),
            "V1",
            template_data["quality_score"],
            "enrolled"
        ))

        conn.commit()
        conn.close()

        response = {
            "success": True,
            "status": "REGISTERED",
            "bpa_tag_id": clean_tag,
            "animal_id": animal_id,
            "template_version": "V1",
            "registration_stage": stage_clean,
            "age_months": age_months,
            "quality_score": template_data["quality_score"],
            "eye_bbox": template_data["eye_bbox"],
            "is_demo": bool(is_demo_val),
            "scientific_note": LIFECYCLE_SCIENTIFIC_STATEMENT,
            "bpa_notice": BPA_INTEGRATION_STATEMENT
        }

        if potential_duplicate:
            response["potential_duplicate_warning"] = {
                "message": "Possible existing animal detected with similar iris signature. Manual verification recommended.",
                "details": potential_duplicate
            }

        return response

    def verify_animal(self, bpa_tag_id: str, eye_image_bytes: bytes) -> dict:
        """
        Verifies an animal's physical identity against all enrolled biometric templates.
        Multi-template matching compares against V1, V2, V3... across its lifecycle.
        """
        clean_tag = bpa_tag_id.replace(" ", "").strip()
        conn = self.get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM animal_identities WHERE bpa_tag_id = ?", (clean_tag,))
        animal_row = cursor.fetchone()
        if not animal_row:
            conn.close()
            return {
                "success": False,
                "status": STATUS_NO_MATCH,
                "decision": STATUS_NO_MATCH,
                "message": f"No animal registered with BPA Tag ID {clean_tag}. Please verify the tag number.",
                "bpa_tag_id": clean_tag
            }

        animal = dict(animal_row)

        # Retrieve enrolled biometric templates (excluding raw templates from frontend exposure)
        cursor.execute("""
            SELECT id, template_version, template_version_identifier, eye_side,
                   animal_age_months, growth_stage, quality_score, verification_status,
                   iris_template, feature_vector, created_at
            FROM biometric_templates
            WHERE animal_identity_id = ?
            ORDER BY template_version ASC
        """, (animal["id"],))
        enrolled_templates = [dict(r) for r in cursor.fetchall()]
        conn.close()

        if not enrolled_templates:
            return {
                "success": False,
                "status": "NO_TEMPLATES",
                "decision": STATUS_UNCERTAIN,
                "message": f"Animal {clean_tag} is registered but has no enrolled biometric templates.",
                "bpa_tag_id": clean_tag
            }

        # Parse feature vectors
        for t in enrolled_templates:
            if t.get("feature_vector"):
                try:
                    t["feature_vector"] = json.loads(t["feature_vector"])
                except Exception:
                    t["feature_vector"] = []

        # Run Eye Pipeline on query image
        pipeline_res = self.process_eye_pipeline(eye_image_bytes)
        if not pipeline_res["success"]:
            return {
                "success": False,
                "status": pipeline_res["status"],
                "decision": pipeline_res["status"],
                "message": pipeline_res["message"],
                "bpa_tag_id": clean_tag,
                "quality": pipeline_res.get("quality")
            }

        query_template = pipeline_res["template"]

        # Run Multi-Template Comparison
        match_result = self.matcher.match_against_enrolled_templates(query_template, enrolled_templates)

        decision = match_result["decision"]
        best_match = match_result["best_match"]

        # Build clean response (NO RAW TEMPLATES EXPOSED)
        safe_comparisons = []
        for c in match_result["version_comparisons"]:
            safe_comparisons.append({
                "template_version": c["template_version"],
                "growth_stage": c["growth_stage"],
                "animal_age_months": c["animal_age_months"],
                "status": c["status"],
                "similarity_score": c["similarity_score"],
                "hamming_distance": c["hamming_distance"]
            })

        return {
            "success": True,
            "status": decision,
            "decision": decision,
            "bpa_tag_id": clean_tag,
            "animal_details": {
                "animal_type": animal["animal_type"],
                "breed": animal["breed"],
                "registration_stage": animal["registration_stage"],
                "current_age_months": animal["current_age_months"],
                "total_enrolled_templates": len(enrolled_templates)
            },
            "best_match": {
                "template_version": best_match["template_version"] if best_match else None,
                "growth_stage": best_match["growth_stage"] if best_match else None,
                "similarity_score": best_match["similarity_score"] if best_match else 0.0,
                "hamming_distance": best_match["hamming_distance"] if best_match else 1.0,
                "matched_stage": best_match["growth_stage"] if best_match else None
            } if best_match else None,
            "version_breakdown": safe_comparisons,
            "query_quality_score": query_template["quality_score"],
            "eye_bbox": query_template["eye_bbox"],
            "is_demo": bool(animal.get("is_demo", 1) or query_template["is_demo"]),
            "bpa_notice": BPA_INTEGRATION_STATEMENT
        }

    def update_biometric_lifecycle(
        self,
        bpa_tag_id: str,
        current_age_months: int,
        new_growth_stage: str,
        eye_image_bytes: bytes,
        eye_side: str = "right",
        force_update: bool = False
    ) -> dict:
        """
        CALF-TO-ADULT BIOMETRIC LIFECYCLE RE-ENROLLMENT.
        Enforces:
        1. Animal must have been initially registered during CALF stage.
        2. Verifies identity against existing templates prior to updating.
        3. Appends new template version (e.g. V2, V3) WITHOUT DELETING previous templates.
        """
        clean_tag = bpa_tag_id.replace(" ", "").strip()
        conn = self.get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM animal_identities WHERE bpa_tag_id = ?", (clean_tag,))
        animal_row = cursor.fetchone()
        if not animal_row:
            conn.close()
            return {
                "success": False,
                "status": "ANIMAL_NOT_FOUND",
                "message": f"Animal with BPA Tag ID {clean_tag} not found."
            }

        animal = dict(animal_row)

        # ── CALF ELIGIBILITY RULE (Specification #11) ──
        if animal["registration_stage"].lower() != "calf":
            conn.close()
            return {
                "success": False,
                "status": "NOT_CALF_ORIGIN",
                "message": (
                    f"Biometric updates are intended for animals originally enrolled during the calf stage. "
                    f"This animal was registered as an {animal['registration_stage']}."
                ),
                "registration_stage": animal["registration_stage"]
            }

        # Retrieve existing templates
        cursor.execute("""
            SELECT * FROM biometric_templates
            WHERE animal_identity_id = ?
            ORDER BY template_version ASC
        """, (animal["id"],))
        existing_templates = [dict(r) for r in cursor.fetchall()]

        for t in existing_templates:
            if t.get("feature_vector"):
                try:
                    t["feature_vector"] = json.loads(t["feature_vector"])
                except Exception:
                    t["feature_vector"] = []

        # Process new eye image
        pipeline_res = self.process_eye_pipeline(eye_image_bytes)
        if not pipeline_res["success"]:
            conn.close()
            return pipeline_res

        new_template_data = pipeline_res["template"]

        # Verify query against existing templates to confirm identity before updating
        match_result = self.matcher.match_against_enrolled_templates(new_template_data, existing_templates)
        verification_passed = match_result["decision"] in (STATUS_VERIFIED, STATUS_POSSIBLE_MATCH)

        if not verification_passed and not force_update:
            conn.close()
            return {
                "success": False,
                "status": "VERIFICATION_FAILED_FOR_UPDATE",
                "message": "New biometric image could not be verified against the animal's enrolled calf template(s). Re-capture recommended.",
                "verification_decision": match_result["decision"],
                "best_match": match_result["best_match"],
                "comparisons": match_result["version_comparisons"]
            }

        # Determine next template version
        next_version_num = len(existing_templates) + 1
        version_identifier = f"V{next_version_num}"
        stage_clean = new_growth_stage.capitalize()

        # Insert new biometric template (RETAINING ALL PREVIOUS TEMPLATES)
        template_id = f"bt_{uuid.uuid4().hex[:8]}"
        cursor.execute("""
            INSERT INTO biometric_templates (
                id, animal_identity_id, template_version, eye_side, animal_age_months,
                growth_stage, iris_template, feature_vector, template_version_identifier,
                quality_score, verification_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            template_id,
            animal["id"],
            next_version_num,
            eye_side,
            current_age_months,
            stage_clean,
            new_template_data["template_b64"],
            json.dumps(new_template_data["feature_vector"]),
            version_identifier,
            new_template_data["quality_score"],
            "verified"
        ))

        # Update animal current age
        cursor.execute("""
            UPDATE animal_identities
            SET current_age_months = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (current_age_months, animal["id"]))

        conn.commit()

        # Fetch full updated lifecycle history
        cursor.execute("""
            SELECT template_version_identifier, growth_stage, animal_age_months,
                   quality_score, verification_status, created_at
            FROM biometric_templates
            WHERE animal_identity_id = ?
            ORDER BY template_version ASC
        """, (animal["id"],))
        updated_history = [dict(r) for r in cursor.fetchall()]
        conn.close()

        return {
            "success": True,
            "status": "UPDATED",
            "bpa_tag_id": clean_tag,
            "new_template_version": version_identifier,
            "growth_stage": stage_clean,
            "current_age_months": current_age_months,
            "quality_score": new_template_data["quality_score"],
            "lifecycle_history": updated_history,
            "retained_templates_count": len(updated_history),
            "scientific_statement": LIFECYCLE_SCIENTIFIC_STATEMENT
        }

    def get_animal_identity(self, bpa_tag_id: str) -> dict:
        """
        Fetches animal details and biometric lifecycle history.
        Privacy-by-design: Raw iris templates are NEVER included in the response.
        """
        clean_tag = bpa_tag_id.replace(" ", "").strip()
        conn = self.get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM animal_identities WHERE bpa_tag_id = ?", (clean_tag,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            # Check mock repository for pre-populated demo info
            demo_rec = BPARepository.get_animal_by_tag(clean_tag)
            if demo_rec:
                return {
                    "found": False,
                    "in_mock_bpa": True,
                    "mock_bpa_record": demo_rec,
                    "message": "Animal exists in mock BPA repository but has not yet enrolled biometric templates."
                }
            return {"found": False, "in_mock_bpa": False, "message": "Animal not found."}

        animal = dict(row)

        cursor.execute("""
            SELECT id, template_version, template_version_identifier, eye_side,
                   animal_age_months, growth_stage, quality_score, verification_status, created_at
            FROM biometric_templates
            WHERE animal_identity_id = ?
            ORDER BY template_version ASC
        """, (animal["id"],))
        templates = [dict(r) for r in cursor.fetchall()]
        conn.close()

        # Check calf update eligibility
        can_update = (animal["registration_stage"].lower() == "calf")

        return {
            "found": True,
            "animal": animal,
            "biometric_templates": templates,
            "biometric_update_allowed": can_update,
            "is_demo": bool(animal.get("is_demo", 1)),
            "bpa_notice": BPA_INTEGRATION_STATEMENT,
            "scientific_statement": LIFECYCLE_SCIENTIFIC_STATEMENT
        }

    def check_duplicate_candidate(self, eye_image_bytes: bytes) -> dict:
        """
        Screens an eye image against all enrolled templates in the database.
        Returns potential matches if similarity exceeds threshold.
        """
        pipeline_res = self.process_eye_pipeline(eye_image_bytes)
        if not pipeline_res["success"]:
            return pipeline_res

        query_template = pipeline_res["template"]

        conn = self.get_db()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT bt.iris_template, bt.feature_vector, bt.template_version_identifier,
                   ai.bpa_tag_id, ai.animal_type, ai.breed, ai.registration_stage
            FROM biometric_templates bt
            JOIN animal_identities ai ON bt.animal_identity_id = ai.id
        """)
        all_templates = cursor.fetchall()
        conn.close()

        matches = []
        for r in all_templates:
            rec = dict(r)
            if rec.get("feature_vector"):
                try:
                    rec["feature_vector"] = json.loads(rec["feature_vector"])
                except Exception:
                    rec["feature_vector"] = []

            cmp_res = self.matcher.match_against_single_template(query_template, rec)
            if cmp_res["status"] in (STATUS_VERIFIED, STATUS_POSSIBLE_MATCH):
                matches.append({
                    "bpa_tag_id": rec["bpa_tag_id"],
                    "animal_type": rec["animal_type"],
                    "breed": rec["breed"],
                    "version": rec["template_version_identifier"],
                    "similarity_score": cmp_res["similarity_score"],
                    "hamming_distance": cmp_res["hamming_distance"],
                    "match_confidence": cmp_res["status"]
                })

        return {
            "success": True,
            "has_potential_duplicate": len(matches) > 0,
            "matches": matches,
            "message": "Potential duplicate detection complete. Manual verification recommended if matches are found." if matches else "No potential duplicates detected."
        }
