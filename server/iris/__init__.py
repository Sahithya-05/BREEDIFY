"""
Bovine Iris Biometric Layer Package
Additive individual animal physical verification module.
"""
from .iris_config import (
    IRIS_DEMO_MODE,
    STATUS_VERIFIED,
    STATUS_POSSIBLE_MATCH,
    STATUS_NO_MATCH,
    STATUS_UNCERTAIN,
    STATUS_LOW_QUALITY,
    STATUS_MODEL_NOT_LOADED,
    STATUS_DEMO
)
from .iris_service import IrisBiometricService
from .bpa_repository import BPARepository

__all__ = [
    "IrisBiometricService",
    "BPARepository",
    "IRIS_DEMO_MODE",
    "STATUS_VERIFIED",
    "STATUS_POSSIBLE_MATCH",
    "STATUS_NO_MATCH",
    "STATUS_UNCERTAIN",
    "STATUS_LOW_QUALITY",
    "STATUS_MODEL_NOT_LOADED",
    "STATUS_DEMO"
]
