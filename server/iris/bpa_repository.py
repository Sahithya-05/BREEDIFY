"""
BPA (Bharat Pashudhan / Pashu Aadhaar) Identity Abstraction Layer.

IMPORTANT NOTICES:
1. BPA/Pashu Aadhaar provides the official animal identity through its 12-digit ear-tag numbering system.
2. Breedify's iris biometrics layer is an ADDITIONAL physical verification mechanism.
3. This is a PROPOSED FUTURE INTEGRATION prototype.
4. Breedify does NOT currently have live BPA integration; mock/demo records are used for prototype demonstration.
5. Bharat Pashudhan does NOT currently use iris recognition.
"""

MOCK_BPA_RECORDS = [
    {
        "bpa_tag_id": "123456789012",
        "animal_type": "Cattle",
        "breed": "Gir Cow",
        "registered_owner": "Ramesh Patel",
        "village": "Anand, Gujarat",
        "initial_registration_stage": "Calf",
        "initial_age_months": 3,
        "current_age_months": 24,
        "is_mock": True,
        "badge_label": "Mock BPA Record · Prototype Data",
        "note": "Registered as a 3-month-old calf. Eligible for lifecycle biometric re-enrollment."
    },
    {
        "bpa_tag_id": "234567890123",
        "animal_type": "Buffalo",
        "breed": "Murrah Buffalo",
        "registered_owner": "Harpreet Singh",
        "village": "Rohtak, Haryana",
        "initial_registration_stage": "Juvenile",
        "initial_age_months": 14,
        "current_age_months": 36,
        "is_mock": True,
        "badge_label": "Mock BPA Record · Prototype Data",
        "note": "Registered as juvenile. Standard verification record."
    },
    {
        "bpa_tag_id": "345678901234",
        "animal_type": "Cattle",
        "breed": "Sahiwal Cow",
        "registered_owner": "Gurdeep Dhillon",
        "village": "Ludhiana, Punjab",
        "initial_registration_stage": "Calf",
        "initial_age_months": 2,
        "current_age_months": 18,
        "is_mock": True,
        "badge_label": "Mock BPA Record · Prototype Data",
        "note": "Enrolled at calf stage (2 months). Demonstrates longitudinal tracking."
    },
    {
        "bpa_tag_id": "987654321098",
        "animal_type": "Cattle",
        "breed": "Kankrej Cow",
        "registered_owner": "Devji Rabari",
        "village": "Banaskantha, Gujarat",
        "initial_registration_stage": "Adult",
        "initial_age_months": 36,
        "current_age_months": 48,
        "is_mock": True,
        "badge_label": "Mock BPA Record · Prototype Data",
        "note": "Enrolled at adult stage. Routine physical verification."
    }
]

class BPARepository:
    """
    Mock repository simulating integration with the Bharat Pashudhan (BPA) national database.
    In a production deployment, this would interface with authenticated government DAHD APIs.
    """
    @staticmethod
    def get_animal_by_tag(bpa_tag_id: str) -> dict | None:
        clean_id = bpa_tag_id.replace(" ", "").strip()
        for rec in MOCK_BPA_RECORDS:
            if rec["bpa_tag_id"] == clean_id:
                return rec
        return None

    @staticmethod
    def list_demo_animals() -> list:
        return MOCK_BPA_RECORDS

    @staticmethod
    def validate_bpa_format(bpa_tag_id: str) -> bool:
        """
        Validates official 12-digit numeric animal identification ear tag format.
        """
        clean_id = bpa_tag_id.replace(" ", "").strip()
        return len(clean_id) == 12 and clean_id.isdigit()
