import math
import numpy as np
from PIL import Image
import io

class BovineIrisNormalizer:
    """
    Daugman Rubber-Sheet Normalization.
    Transforms the segmented annular iris region from Cartesian coordinates (x, y)
    to a fixed-dimension dimensionless pseudo-polar coordinate system (r, theta).
    Output: 2D array of normalized radial strips (typically 64 radial samples x 256 angular samples).
    """
    def __init__(self, radial_res: int = 64, angular_res: int = 256):
        self.radial_res = radial_res
        self.angular_res = angular_res

    def normalize(self, eye_crop_bytes: bytes, pupil_params: dict, iris_params: dict) -> np.ndarray:
        """
        Unwraps the annular iris zone into a rectangular normalized strip.
        """
        try:
            pil_img = Image.open(io.BytesIO(eye_crop_bytes)).convert("L")
            img_arr = np.array(pil_img, dtype=np.float32)
        except Exception:
            return np.zeros((self.radial_res, self.angular_res), dtype=np.float32)

        h, w = img_arr.shape

        cx_p = pupil_params.get("center_x", w / 2.0)
        cy_p = pupil_params.get("center_y", h / 2.0)
        rx_p = pupil_params.get("radius_x", 20.0)
        ry_p = pupil_params.get("radius_y", 15.0)

        cx_i = iris_params.get("center_x", w / 2.0)
        cy_i = iris_params.get("center_y", h / 2.0)
        r_i = iris_params.get("radius", 45.0)

        # Precompute angular steps theta in [0, 2*pi)
        thetas = np.linspace(0, 2 * math.pi, self.angular_res, endpoint=False)
        r_steps = np.linspace(0, 1.0, self.radial_res)

        # For each angle theta, compute inner pupil boundary radius and outer iris boundary radius
        cos_t = np.cos(thetas)
        sin_t = np.sin(thetas)

        # Elliptical pupil radius at angle theta: r(theta) = rx * ry / sqrt((ry*cos)^2 + (rx*sin)^2)
        pupil_radii = (rx_p * ry_p) / np.sqrt((ry_p * cos_t) ** 2 + (rx_p * sin_t) ** 2 + 1e-6)

        # Output normalized strip
        normalized_strip = np.zeros((self.radial_res, self.angular_res), dtype=np.float32)

        for r_idx, r_norm in enumerate(r_steps):
            # Linear interpolation between pupil and limbus boundary
            # X = (1 - r) * X_pupil(theta) + r * X_iris(theta)
            x_p = cx_p + pupil_radii * cos_t
            y_p = cy_p + pupil_radii * sin_t

            x_i = cx_i + r_i * cos_t
            y_i = cy_i + r_i * sin_t

            xp = (1.0 - r_norm) * x_p + r_norm * x_i
            yp = (1.0 - r_norm) * y_p + r_norm * y_i

            # Clamp coordinates to image boundaries
            xp_int = np.clip(np.round(xp).astype(int), 0, w - 1)
            yp_int = np.clip(np.round(yp).astype(int), 0, h - 1)

            normalized_strip[r_idx, :] = img_arr[yp_int, xp_int]

        # Contrast normalization (zero mean, unit variance)
        mean_val = np.mean(normalized_strip)
        std_val = np.std(normalized_strip)
        if std_val > 1e-3:
            normalized_strip = (normalized_strip - mean_val) / std_val

        return normalized_strip
