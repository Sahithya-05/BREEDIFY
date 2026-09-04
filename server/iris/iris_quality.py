import math
import numpy as np
from PIL import Image
import io
from .iris_config import (
    MIN_IMAGE_WIDTH,
    MIN_IMAGE_HEIGHT,
    MIN_SHARPNESS_LAPLACIAN_VAR,
    MIN_MEAN_BRIGHTNESS,
    MAX_MEAN_BRIGHTNESS,
    MIN_CONTRAST_STD
)

def assess_image_quality(image_input) -> dict:
    """
    Performs comprehensive pre-segmentation biometric quality checks:
    - Resolution check
    - Sharpness / blur assessment
    - Illumination / brightness assessment
    - Contrast distribution
    Returns quality dictionary with score (0.0 to 1.0), is_acceptable (bool), and diagnostic reasons.
    """
    if isinstance(image_input, (bytes, bytearray)):
        try:
            pil_img = Image.open(io.BytesIO(image_input)).convert("L")
        except Exception:
            return {
                "is_acceptable": False,
                "quality_score": 0.0,
                "issues": ["Invalid or corrupted image format."],
                "details": {}
            }
    elif isinstance(image_input, Image.Image):
        pil_img = image_input.convert("L")
    elif isinstance(image_input, np.ndarray):
        if len(image_input.shape) == 3:
            pil_img = Image.fromarray(image_input).convert("L")
        else:
            pil_img = Image.fromarray(image_input)
    else:
        return {
            "is_acceptable": False,
            "quality_score": 0.0,
            "issues": ["Unsupported image input type."],
            "details": {}
        }

    width, height = pil_img.size
    issues = []
    
    # 1. Resolution Check
    if width < MIN_IMAGE_WIDTH or height < MIN_IMAGE_HEIGHT:
        issues.append(f"Image resolution too low ({width}x{height}). Minimum required is {MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT}.")

    # Convert to grayscale numpy array for statistical quality analysis
    gray = np.array(pil_img, dtype=np.float32)
    
    # 2. Brightness Check
    mean_brightness = float(np.mean(gray))
    if mean_brightness < MIN_MEAN_BRIGHTNESS:
        issues.append(f"Image is underexposed/too dark (mean brightness: {mean_brightness:.1f}). Ensure sufficient lighting.")
    elif mean_brightness > MAX_MEAN_BRIGHTNESS:
        issues.append(f"Image is overexposed/glare detected (mean brightness: {mean_brightness:.1f}). Reduce direct glare.")

    # 3. Contrast Check
    std_contrast = float(np.std(gray))
    if std_contrast < MIN_CONTRAST_STD:
        issues.append(f"Image contrast is too low (std dev: {std_contrast:.1f}). Difficult to separate pupil from iris.")

    # 4. Sharpness Check via discrete 2D Laplacian operator
    # Kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    pad = np.pad(gray, 1, mode='edge')
    laplacian = (
        pad[:-2, 1:-1] + pad[2:, 1:-1] +
        pad[1:-1, :-2] + pad[1:-1, 2:] -
        4.0 * pad[1:-1, 1:-1]
    )
    sharpness_var = float(np.var(laplacian))

    if sharpness_var < MIN_SHARPNESS_LAPLACIAN_VAR:
        issues.append(f"Image is blurred/out of focus (sharpness score: {sharpness_var:.1f}). Keep camera steady.")

    # Compute continuous quality score [0.0 - 1.0]
    score_res = min(1.0, (width * height) / (400 * 400))
    score_bright = 1.0 - min(1.0, abs(mean_brightness - 128) / 128.0)
    score_contrast = min(1.0, std_contrast / 50.0)
    score_sharp = min(1.0, sharpness_var / 120.0)

    quality_score = round(
        0.20 * score_res +
        0.25 * score_bright +
        0.25 * score_contrast +
        0.30 * score_sharp,
        3
    )

    is_acceptable = len(issues) == 0 and quality_score >= 0.40

    return {
        "is_acceptable": is_acceptable,
        "quality_score": quality_score,
        "issues": issues,
        "details": {
            "width": width,
            "height": height,
            "mean_brightness": round(mean_brightness, 1),
            "contrast_std": round(std_contrast, 1),
            "sharpness_var": round(sharpness_var, 1)
        }
    }
