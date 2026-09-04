import base64
import numpy as np
from .iris_config import (
    HAMMING_VERIFIED_THRESHOLD,
    HAMMING_POSSIBLE_THRESHOLD,
    SIMILARITY_VERIFIED_THRESHOLD,
    SIMILARITY_POSSIBLE_THRESHOLD,
    STATUS_VERIFIED,
    STATUS_POSSIBLE_MATCH,
    STATUS_NO_MATCH,
    STATUS_UNCERTAIN
)

class BovineIrisMatcher:
    """
    Biometric template comparison and Multi-Template Decision Engine.
    Computes both Fractional Hamming Distance (on packed bit codes)
    and Cosine Similarity (on feature vectors), with rotational shifting
    to account for natural head tilt and cyclotorsion.
    
    Supports multi-template comparison across the animal's lifecycle:
    V1 (Calf), V2 (Juvenile), V3 (Adult)...
    """

    @staticmethod
    def compute_hamming_distance(b64_template_a: str, b64_template_b: str, shift_range: int = 4) -> float:
        """
        Fractional Hamming Distance between two base64-encoded Iris Codes.
        Hamming distance ranges from 0.0 (identical) to 0.5 (uncorrelated/random).
        """
        try:
            bytes_a = base64.b64decode(b64_template_a)
            bytes_b = base64.b64decode(b64_template_b)
        except Exception:
            return 1.0

        len_cmp = min(len(bytes_a), len(bytes_b))
        if len_cmp == 0:
            return 1.0

        arr_a = np.frombuffer(bytes_a[:len_cmp], dtype=np.uint8)
        arr_b = np.frombuffer(bytes_b[:len_cmp], dtype=np.uint8)

        # Unpack bits for circular shift comparison
        bits_a = np.unpackbits(arr_a)
        bits_b = np.unpackbits(arr_b)
        total_bits = len(bits_a)

        # Evaluate minimum distance across shifts
        min_distance = 1.0
        for s in range(-shift_range, shift_range + 1):
            shifted_b = np.roll(bits_b, s)
            diff_bits = np.count_nonzero(bits_a != shifted_b)
            dist = float(diff_bits) / float(total_bits)
            if dist < min_distance:
                min_distance = dist

        return round(min_distance, 4)

    @staticmethod
    def compute_cosine_similarity(vec_a: list, vec_b: list) -> float:
        """
        Cosine similarity between two continuous feature vectors: dot(a, b) / (|a| * |b|)
        """
        if not vec_a or not vec_b or len(vec_a) != len(vec_b):
            return 0.0

        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)

        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)

        if norm_a < 1e-6 or norm_b < 1e-6:
            return 0.0

        dot = np.dot(a, b)
        cos_sim = float(dot / (norm_a * norm_b))
        return round(max(0.0, min(1.0, (cos_sim + 1.0) / 2.0)), 4)

    def match_against_single_template(self, query_template: dict, enrolled_template: dict) -> dict:
        """
        Compares query template against a single enrolled template.
        """
        q_b64 = query_template.get("template_b64", "")
        e_b64 = enrolled_template.get("iris_template", "")

        q_vec = query_template.get("feature_vector", [])
        e_vec = enrolled_template.get("feature_vector", [])

        hamming = self.compute_hamming_distance(q_b64, e_b64)
        cos_sim = self.compute_cosine_similarity(q_vec, e_vec) if (q_vec and e_vec) else (1.0 - min(1.0, hamming * 2.0))

        # Decision rule combining Hamming distance and feature similarity
        if hamming <= HAMMING_VERIFIED_THRESHOLD or cos_sim >= SIMILARITY_VERIFIED_THRESHOLD:
            status = STATUS_VERIFIED
        elif hamming <= HAMMING_POSSIBLE_THRESHOLD or cos_sim >= SIMILARITY_POSSIBLE_THRESHOLD:
            status = STATUS_POSSIBLE_MATCH
        else:
            status = STATUS_NO_MATCH

        return {
            "status": status,
            "hamming_distance": hamming,
            "similarity_score": round(cos_sim, 3),
            "template_version": enrolled_template.get("template_version_identifier", "V1"),
            "growth_stage": enrolled_template.get("growth_stage", "Calf"),
            "animal_age_months": enrolled_template.get("animal_age_months", 0)
        }

    def match_against_enrolled_templates(self, query_template: dict, enrolled_templates: list) -> dict:
        """
        Multi-Template Matching Engine.
        Compares query against ALL enrolled templates (V1, V2, V3...) across the animal's lifecycle.
        Does NOT require query to match only the newest template.
        Returns the best matching template and complete version breakdown.
        """
        if not enrolled_templates:
            return {
                "decision": STATUS_NO_MATCH,
                "best_match": None,
                "version_comparisons": [],
                "reason": "No enrolled biometric templates found for this animal."
            }

        comparisons = []
        for templ in enrolled_templates:
            res = self.match_against_single_template(query_template, templ)
            comparisons.append(res)

        # Find best match (lowest Hamming distance, highest similarity)
        best_match = min(comparisons, key=lambda x: x["hamming_distance"])

        # Determine overall decision
        if any(c["status"] == STATUS_VERIFIED for c in comparisons):
            overall_decision = STATUS_VERIFIED
        elif any(c["status"] == STATUS_POSSIBLE_MATCH for c in comparisons):
            overall_decision = STATUS_POSSIBLE_MATCH
        else:
            overall_decision = STATUS_NO_MATCH

        return {
            "decision": overall_decision,
            "best_match": best_match,
            "version_comparisons": comparisons,
            "reason": f"Compared against {len(enrolled_templates)} lifecycle biometric template(s)."
        }
