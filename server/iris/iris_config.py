import os

# Biometric Engine Configuration
# IRIS_DEMO_MODE: When True (default for hackathon prototype), allows mock/demo verification
# and demonstration templates with clear "Demo Animal" / "Mock BPA Record" labeling.
# When False and real trained deep weights are absent, system strictly returns MODEL_NOT_LOADED.
IRIS_DEMO_MODE = os.environ.get("IRIS_DEMO_MODE", "true").lower() in ("true", "1", "yes")

# Model weights directory (reserved for production deep model weights)
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# Image Quality Check Thresholds
MIN_IMAGE_WIDTH = 150
MIN_IMAGE_HEIGHT = 150
MIN_EYE_CROP_WIDTH = 80
MIN_EYE_CROP_HEIGHT = 80

# Sharpness threshold via Laplacian variance (higher = sharper)
MIN_SHARPNESS_LAPLACIAN_VAR = 35.0

# Brightness range (0 to 255 mean pixel intensity)
MIN_MEAN_BRIGHTNESS = 30.0
MAX_MEAN_BRIGHTNESS = 235.0

# Contrast range (standard deviation of pixel intensity)
MIN_CONTRAST_STD = 18.0

# Maximum tolerable occlusion percentage for valid iris segmentation
MAX_OCCLUSION_RATIO = 0.45

# Similarity / Distance Thresholds (Hamming Distance: lower = more similar)
# Daugman style: < 0.33 is high-confidence match; 0.33 - 0.39 is possible match; > 0.39 is non-match
HAMMING_VERIFIED_THRESHOLD = 0.33
HAMMING_POSSIBLE_THRESHOLD = 0.39

# Cosine / Correlation Similarity (higher = more similar: 0.0 to 1.0)
SIMILARITY_VERIFIED_THRESHOLD = 0.82
SIMILARITY_POSSIBLE_THRESHOLD = 0.68

# Decision States
STATUS_VERIFIED = "VERIFIED"
STATUS_POSSIBLE_MATCH = "POSSIBLE_MATCH"
STATUS_NO_MATCH = "NO_MATCH"
STATUS_UNCERTAIN = "UNCERTAIN"
STATUS_LOW_QUALITY = "LOW_QUALITY"
STATUS_MODEL_NOT_LOADED = "MODEL_NOT_LOADED"
STATUS_DEMO = "DEMO"

# Scientific Disclaimer
LIFECYCLE_SCIENTIFIC_STATEMENT = (
    "Animals enrolled at the calf stage can undergo biometric re-enrollment as they mature, "
    "allowing the system to maintain verified biometric templates throughout the animal's lifecycle."
)

BPA_INTEGRATION_STATEMENT = (
    "BPA provides the official animal identity through its tag-based identification system. "
    "Breedify proposes iris biometrics as an additional physical-identity verification layer. "
    "Live BPA integration requires authorized access to Ministry of Fisheries, Animal Husbandry & Dairying (DAHD) APIs."
)
