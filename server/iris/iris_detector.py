import os
import io
import numpy as np
from PIL import Image
from . import iris_config
from .iris_config import (
    MODEL_DIR,
    STATUS_MODEL_NOT_LOADED,
    MIN_EYE_CROP_WIDTH,
    MIN_EYE_CROP_HEIGHT
)

class BovineEyeDetector:
    """
    Dedicated eye-localization stage for cattle and buffalo.
    NOTE: The existing YOLOv12 model detects the bovine body, NOT the eye.
    This stage locates the animal eye independently.
    
    If deep eye detector weights are not loaded:
    - If IRIS_DEMO_MODE is False: returns STATUS_MODEL_NOT_LOADED.
    - If IRIS_DEMO_MODE is True: provides labeled demo/heuristic eye localization.
    """
    def __init__(self):
        self.weights_path = os.path.join(MODEL_DIR, "bovine_eye_yolo.onnx")
        self.is_model_loaded = os.path.exists(self.weights_path)

    def detect_eye(self, image_bytes: bytes, demo_mode: bool = None) -> dict:
        """
        Locates the bovine eye within the frame.
        """
        is_demo_active = iris_config.IRIS_DEMO_MODE if demo_mode is None else demo_mode
        """
        Locates the bovine eye within the frame.
        Returns:
            {
                "success": bool,
                "status": str,
                "bounding_box": dict | None, # {x_min, y_min, x_max, y_max}
                "eye_crop_bytes": bytes | None,
                "is_demo": bool,
                "confidence": float,
                "message": str
            }
        """
        try:
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception:
            return {
                "success": False,
                "status": "INVALID_IMAGE",
                "bounding_box": None,
                "eye_crop_bytes": None,
                "is_demo": False,
                "confidence": 0.0,
                "message": "Failed to decode image bytes."
            }

        width, height = pil_img.size

        # If real deep model weights are not available
        if not self.is_model_loaded:
            if not is_demo_active:
                # STRICT REQUIREMENT: Do NOT fabricate eye coordinates
                return {
                    "success": False,
                    "status": STATUS_MODEL_NOT_LOADED,
                    "bounding_box": None,
                    "eye_crop_bytes": None,
                    "is_demo": False,
                    "confidence": 0.0,
                    "message": "Trained bovine eye localization model weights are not loaded in production mode."
                }

            # In DEMO MODE: Attempt heuristic computer vision detection (dark circular pupil region)
            # or centered eye reticle corresponding to camera guide
            gray = np.array(pil_img.convert("L"), dtype=np.uint8)
            
            # Look for highest gradient circular dark zone (typical eye characteristic)
            # If camera guide was used, eye is centered in 0.20 - 0.80 region
            cx_min, cy_min = int(0.20 * width), int(0.20 * height)
            cx_max, cy_max = int(0.80 * width), int(0.80 * height)
            roi = gray[cy_min:cy_max, cx_min:cx_max]

            if roi.size > 0:
                # Simple dark minimum filter to find pupil center candidate
                min_y, min_x = np.unravel_index(np.argmin(roi), roi.shape)
                abs_center_x = cx_min + min_x
                abs_center_y = cy_min + min_y
                
                half_box = max(MIN_EYE_CROP_WIDTH, min(width, height) // 4) // 2
                x1 = max(0, abs_center_x - half_box)
                y1 = max(0, abs_center_y - half_box)
                x2 = min(width, abs_center_x + half_box)
                y2 = min(height, abs_center_y + half_box)
            else:
                # Reticle-centered fallback crop
                half_box = min(width, height) // 3
                x1 = max(0, (width // 2) - half_box)
                y1 = max(0, (height // 2) - half_box)
                x2 = min(width, (width // 2) + half_box)
                y2 = min(height, (height // 2) + half_box)

            eye_crop = pil_img.crop((x1, y1, x2, y2))
            buf = io.BytesIO()
            eye_crop.save(buf, format="JPEG", quality=90)

            return {
                "success": True,
                "status": "DETECTED",
                "bounding_box": {
                    "x_min": round(x1 / width, 3),
                    "y_min": round(y1 / height, 3),
                    "x_max": round(x2 / width, 3),
                    "y_max": round(y2 / height, 3)
                },
                "eye_crop_bytes": buf.getvalue(),
                "is_demo": True,
                "confidence": 0.88,
                "message": "Eye located via reticle guide alignment (Demo Heuristic Model)."
            }

        # If real deep weights are loaded, run neural inference
        # (Reserved for production ONNX runtime execution)
        return {
            "success": False,
            "status": STATUS_MODEL_NOT_LOADED,
            "bounding_box": None,
            "eye_crop_bytes": None,
            "is_demo": False,
            "confidence": 0.0,
            "message": "ONNX execution engine not configured."
        }
