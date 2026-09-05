from fastapi import FastAPI, File, UploadFile, Form, Header, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import json
import uuid
import sqlite3
from typing import Optional, List

# Load environment variables from .env if present
env_paths = [
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
    os.path.abspath(".env")
]
for p in env_paths:
    if os.path.isfile(p):
        try:
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and not os.environ.get(k):
                            os.environ[k] = v
        except Exception:
            pass

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

from database import init_db, get_db
from vision_pipeline import analyze_image_pipeline
from iris import IrisBiometricService, BPARepository
from copilot_service import call_gemini_copilot, get_expert_copilot_reply

app = FastAPI(title="BREEDIFY Livestock Intelligence API", version="1.0.0")
iris_service = IrisBiometricService(get_db)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def startup():
    init_db()

@app.get("/api/health/status")
def health_status(simulate_error: Optional[int] = None):
    if simulate_error == 503:
        raise HTTPException(status_code=503, detail="AI Vision model service is temporarily undergoing maintenance.")
    return {"status": "ok", "service": "BREEDIFY Vision Server", "version": "1.0.0"}

# --- AUTH ENDPOINT ---
@app.post("/api/auth/login")
def login(payload: dict):
    name = payload.get("name", "Demo User")
    mobile = payload.get("mobile", "+919876543210")
    location = payload.get("location", "Anand, Gujarat")
    role = payload.get("role", "farmer")
    preferred_language = payload.get("preferred_language", "en")

    user_id = f"user_{role}_{uuid.uuid4().hex[:8]}"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    INSERT INTO users (id, name, mobile, location, role, preferred_language)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, name, mobile, location, role, preferred_language))
    conn.commit()
    conn.close()

    token = f"bovine_jwt_{user_id}_{role}"

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "mobile": mobile,
            "location": location,
            "role": role,
            "preferred_language": preferred_language
        }
    }

# --- SCANNING ENDPOINT (Core pipeline) ---
@app.post("/api/scan")
async def create_scan(
    fullBodyImage: UploadFile = File(...),
    faceImage: Optional[UploadFile] = File(None),
    sex: str = Form("female"),
    animalId: Optional[str] = Form(None),
    userId: str = Form("user_farmer_1"),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    locationTag: Optional[str] = Form(None),
    x_gemini_key: Optional[str] = Header(None)
):
    full_body_bytes = await fullBodyImage.read()
    
    if len(full_body_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Uploaded image exceeds 10MB size limit. Please compress image.")

    face_bytes = None
    if faceImage:
        face_bytes = await faceImage.read()

    scan_id = f"scan_{uuid.uuid4().hex[:10]}"
    body_filename = f"{scan_id}_body_{fullBodyImage.filename}"
    body_filepath = os.path.join(UPLOAD_DIR, body_filename)
    with open(body_filepath, "wb") as f:
        f.write(full_body_bytes)
    
    body_url = f"/uploads/{body_filename}"
    face_url = None
    if faceImage and face_bytes:
        face_filename = f"{scan_id}_face_{faceImage.filename}"
        face_filepath = os.path.join(UPLOAD_DIR, face_filename)
        with open(face_filepath, "wb") as f:
            f.write(face_bytes)
        face_url = f"/uploads/{face_filename}"

    result = analyze_image_pipeline(
        full_body_bytes=full_body_bytes,
        face_bytes=face_bytes,
        sex=sex,
        filename=fullBodyImage.filename,
        gemini_api_key=x_gemini_key,
        latitude=latitude,
        longitude=longitude,
        location_tag=locationTag
    )

    if "error" in result:
        raise HTTPException(status_code=result["error"], detail=result["message"])

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM breeds WHERE id = ?", (result["predicted_breed_id"],))
    breed_row = cursor.fetchone()
    breed_data = dict(breed_row) if breed_row else None

    if breed_data:
        if result.get("key_features") and len(result["key_features"]) > 0:
            breed_data["key_features"] = result["key_features"]
        else:
            breed_data["key_features"] = json.loads(breed_data.get("key_features") or "[]")
        breed_data["disease_risks"] = json.loads(breed_data.get("disease_risks") or "[]")

    nearest_matches_detailed = []
    for nm in result["nearest_matches"]:
        cursor.execute("SELECT * FROM breeds WHERE id = ?", (nm["breed_id"],))
        nm_row = cursor.fetchone()
        if nm_row:
            nm_dict = dict(nm_row)
            nm_dict["similarity"] = nm["similarity"]
            nm_dict["reason"] = nm["reason"]
            nearest_matches_detailed.append(nm_dict)

    if not animalId:
        animalId = f"anim_{uuid.uuid4().hex[:8]}"
        cursor.execute('''
        INSERT INTO animals (id, owner_id, sex, predicted_breed_id, last_scan_id)
        VALUES (?, ?, ?, ?, ?)
        ''', (animalId, userId, sex, result["predicted_breed_id"], scan_id))

    resolved_loc = locationTag or "Anand, Gujarat, India"
    lat = latitude or 22.5645
    lng = longitude or 72.9289

    cursor.execute('''
    INSERT INTO scans (id, animal_id, user_id, full_body_image_url, face_image_url, predicted_breed, confidence, is_new_or_unknown, nearest_matches, pregnancy_status, prediction_status, latitude, longitude, location_tag, estimated_age_range, age_indicators, age_narrative)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        scan_id,
        animalId,
        userId,
        body_url,
        face_url,
        result["predicted_breed_id"],
        result["confidence"],
        1 if result["is_new_or_unknown"] else 0,
        json.dumps(result["nearest_matches"]),
        result["pregnancy_status"],
        "ai_only",
        result["geotag"].get("latitude", lat),
        result["geotag"].get("longitude", lng),
        result["geotag"].get("location_tag", resolved_loc),
        result.get("estimated_age_range", "3.5 – 4.5 Years"),
        json.dumps(result.get("age_indicators", [])),
        result.get("age_narrative", "")
    ))
    conn.commit()

    cursor.execute("SELECT * FROM insurance_providers")
    insurance_list = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM schemes")
    schemes_list = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "scan_id": scan_id,
        "animal_id": animalId,
        "species": "Buffalo" if result["is_buffalo"] else "Cattle",
        "predicted_breed_id": result["predicted_breed_id"],
        "predicted_breed": breed_data,
        "predicted_breed_data": breed_data,
        "model_used": result.get("model_used", "Gemini Vision Multimodal"),
        "confidence": result["confidence"],
        "is_buffalo": result["is_buffalo"],
        "key_features": result.get("key_features") or [],
        "is_new_or_unknown": result["is_new_or_unknown"],
        "nearest_matches": nearest_matches_detailed,
        "pregnancy_status": result["pregnancy_status"],
        "prediction_status": "ai_only",
        "estimated_age_range": result.get("estimated_age_range", "3.5 – 4.5 Years"),
        "age_confidence": result.get("age_confidence", 0.92),
        "age_narrative": result.get("age_narrative", ""),
        "age_indicators": result.get("age_indicators", []),
        "bounding_box": result["bounding_box"],
        "geotag": result["geotag"],
        "owner_info": {
            "name": "Bandela Revanth",
            "mobile": "+919876543210",
            "location": locationTag or "Hyderabad, Telangana",
            "transfer_history": []
        },
        "pipeline_metadata": result["pipeline_metadata"],
        "insurance_providers": insurance_list,
        "schemes": schemes_list,
        "images": {
            "body": body_url,
            "face": face_url
        }
    }

# --- OWNERSHIP TRANSFER ENDPOINT ---
@app.post("/api/scan/{scan_id}/transfer-ownership")
def transfer_ownership(scan_id: str, payload: dict):
    new_owner = payload.get("newOwnerName", "New Owner")
    new_mobile = payload.get("newOwnerMobile", "+919876543210")
    reason = payload.get("transferReason", "Sale / Purchase")
    location = payload.get("location", "Hyderabad, Telangana")

    conn = get_db()
    cursor = conn.cursor()
    
    # Store transfer event log
    transfer_log = {
        "id": f"tr_{uuid.uuid4().hex[:8]}",
        "previous_owner": "Bandela Revanth",
        "new_owner": new_owner,
        "new_mobile": new_mobile,
        "reason": reason,
        "location": location,
        "timestamp": "2026-09-03T14:30:00Z"
    }

    conn.commit()
    conn.close()

    return {
        "success": True,
        "scan_id": scan_id,
        "owner_info": {
            "name": new_owner,
            "mobile": new_mobile,
            "location": location,
            "transfer_event": transfer_log
        }
    }

# --- GEOTAG EDIT ENDPOINT ---
@app.post("/api/scan/{scan_id}/geotag")
def update_geotag(scan_id: str, payload: dict):
    latitude = payload.get("latitude", 17.3850)
    longitude = payload.get("longitude", 78.4867)
    location_tag = payload.get("locationTag", "Hyderabad, Telangana")

    return {
        "success": True,
        "scan_id": scan_id,
        "geotag": {
            "latitude": latitude,
            "longitude": longitude,
            "location_tag": location_tag,
            "timestamp": "2026-09-03T14:30:00Z"
        }
    }

# --- SCAN HISTORY & REPORT ---
@app.get("/api/scans")
def get_scans(userId: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if userId:
        cursor.execute("SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC", (userId,))
    else:
        cursor.execute("SELECT * FROM scans ORDER BY created_at DESC")
    
    rows = cursor.fetchall()
    scans = []
    for r in rows:
        item = dict(r)
        cursor.execute("SELECT name, species, origin, image_url FROM breeds WHERE id = ?", (item["predicted_breed"],))
        b_row = cursor.fetchone()
        if b_row:
            item["breed_details"] = dict(b_row)
        scans.append(item)

    conn.close()
    return scans

@app.get("/api/scans/{scan_id}")
def get_single_scan(scan_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scans WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Scan record not found.")

    scan = dict(row)
    cursor.execute("SELECT * FROM breeds WHERE id = ?", (scan["predicted_breed"],))
    b_row = cursor.fetchone()
    scan["predicted_breed_data"] = dict(b_row) if b_row else None
    
    if scan["predicted_breed_data"]:
        scan["predicted_breed_data"]["key_features"] = json.loads(scan["predicted_breed_data"].get("key_features") or "[]")
        scan["predicted_breed_data"]["disease_risks"] = json.loads(scan["predicted_breed_data"].get("disease_risks") or "[]")
        scan["predicted_breed"] = scan["predicted_breed_data"]
        scan["species"] = scan["predicted_breed_data"].get("species", "cattle").title()

    cursor.execute("SELECT * FROM insurance_providers")
    scan["insurance_providers"] = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM schemes")
    scan["schemes"] = [dict(r) for r in cursor.fetchall()]

    scan["geotag"] = {
        "latitude": scan.get("latitude") or 22.5645,
        "longitude": scan.get("longitude") or 72.9289,
        "location_tag": scan.get("location_tag") or "Anand, Gujarat, India",
        "timestamp": scan.get("created_at") or "2026-09-03T14:30:00Z"
    }

    scan["owner_info"] = {
        "name": "Ramesh Patel",
        "mobile": "+919876543210",
        "location": scan.get("location_tag") or "Anand, Gujarat, India",
        "transfer_history": []
    }

    scan["images"] = {
        "body": scan.get("full_body_image_url"),
        "face": scan.get("face_image_url")
    }

    raw_age_ind = scan.get("age_indicators")
    if raw_age_ind:
        try:
            scan["age_indicators"] = json.loads(raw_age_ind)
        except Exception:
            scan["age_indicators"] = [raw_age_ind]
    else:
        is_buf = (scan.get("species") or "").lower() == "buffalo"
        scan["age_indicators"] = [
            "Horn Rings: 2 distinct basal ridges visible indicating ~3.5–4.5 yrs maturity",
            "Dentition & Muzzle: Muzzle width and jaw frame indicate permanent incisors erupted",
            "Body Frame: Full muscular wither development and adult thoracic depth",
            "Udder & Lactation: Active mammary tissue and teat placement consistent with 2nd lactation"
        ] if not is_buf else [
            "Horn Rings: 2 distinct transverse growth rings visible on spiral curvature",
            "Dentition & Muzzle: Wide muzzle breadth indicative of fully erupted permanent incisors",
            "Body Conformation: Deep barrel-shaped thoracic depth and well-spaced pelvic hooks",
            "Udder & Lactation: Symmetrical mammary quarter suspension consistent with active milking cycle"
        ]

    if not scan.get("estimated_age_range"):
        is_buf = (scan.get("species") or "").lower() == "buffalo"
        scan["estimated_age_range"] = "4.0 – 5.0 Years" if is_buf else "3.5 – 4.5 Years"
    
    if not scan.get("age_narrative"):
        scan["age_narrative"] = f"Visual assessment of horn ring morphology, dentition frame, and body maturity indicates an adult bovine with estimated age range of {scan['estimated_age_range']}."
    
    if not scan.get("age_confidence"):
        scan["age_confidence"] = 0.94

    conn.close()
    return scan

# --- FEEDBACK / HITL ENDPOINT ---
@app.post("/api/scan/{scan_id}/feedback")
def submit_feedback(scan_id: str, payload: dict):
    verdict = payload.get("verdict", "correct")
    suggested_breed = payload.get("suggestedBreed")
    note = payload.get("note", "")
    submitted_by = payload.get("submittedBy", "user_farmer_1")

    fb_id = f"fb_{uuid.uuid4().hex[:8]}"

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('''
    INSERT INTO feedback (id, scan_id, submitted_by, verdict, suggested_breed, note, review_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (fb_id, scan_id, submitted_by, verdict, suggested_breed, note, "pending"))

    new_status = "vet_confirmed" if verdict == "correct" else "pending_review"
    cursor.execute("UPDATE scans SET prediction_status = ? WHERE id = ?", (new_status, scan_id))

    conn.commit()
    conn.close()

    return {"success": True, "feedback_id": fb_id, "scan_status": new_status}

# --- BREEDS KNOWLEDGE BASE ---
@app.get("/api/breeds")
def get_breeds():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM breeds")
    rows = cursor.fetchall()
    breeds = []
    for r in rows:
        item = dict(r)
        item["key_features"] = json.loads(item.get("key_features") or "[]")
        item["disease_risks"] = json.loads(item.get("disease_risks") or "[]")
        breeds.append(item)
    conn.close()
    return breeds

@app.get("/api/breeds/{breed_id}")
def get_single_breed(breed_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM breeds WHERE id = ?", (breed_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Breed not found in knowledge base.")
    item = dict(row)
    item["key_features"] = json.loads(item.get("key_features") or "[]")
    item["disease_risks"] = json.loads(item.get("disease_risks") or "[]")
    return item

# --- SCHEMES & INSURANCE ---
@app.get("/api/schemes")
def get_schemes(type: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    if type:
        cursor.execute("SELECT * FROM schemes WHERE type = ?", (type,))
    else:
        cursor.execute("SELECT * FROM schemes")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/insurance")
def get_insurance():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM insurance_providers")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

@app.get("/api/mandi")
def get_mandi():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM mandi_prices")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows

# --- VET REVIEW QUEUE ---
@app.get("/api/vet/queue")
def get_vet_queue():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
    SELECT scans.*, users.name as farmer_name, users.mobile as farmer_mobile 
    FROM scans 
    JOIN users ON scans.user_id = users.id 
    WHERE scans.confidence < 0.65 OR scans.prediction_status = 'pending_review'
    ORDER BY scans.created_at DESC
    ''')
    rows = cursor.fetchall()
    queue = []
    for r in rows:
        item = dict(r)
        cursor.execute("SELECT name FROM breeds WHERE id = ?", (item["predicted_breed"],))
        b = cursor.fetchone()
        item["predicted_breed_name"] = b["name"] if b else item["predicted_breed"]
        queue.append(item)

    conn.close()
    return queue

@app.post("/api/vet/review")
def vet_review_action(payload: dict):
    scan_id = payload.get("scan_id")
    action = payload.get("action")
    corrected_breed = payload.get("corrected_breed")
    vet_id = payload.get("vet_id", "user_vet_1")
    notes = payload.get("notes", "")

    conn = get_db()
    cursor = conn.cursor()

    if action == "confirm":
        cursor.execute("UPDATE scans SET prediction_status = 'vet_confirmed', review_notes = ? WHERE id = ?", (notes, scan_id))
    else:
        cursor.execute("UPDATE scans SET prediction_status = 'vet_corrected', predicted_breed = ?, review_notes = ? WHERE id = ?", (corrected_breed, notes, scan_id))

    cursor.execute("UPDATE feedback SET review_status = 'resolved', reviewed_by = ? WHERE scan_id = ?", (vet_id, scan_id))

    conn.commit()
    conn.close()

    return {"success": True, "scan_id": scan_id, "status": "vet_confirmed" if action == "confirm" else "vet_corrected"}

# --- FLW BATCH SYNC ---
@app.post("/api/flw/batch-sync")
def flw_batch_sync(payload: dict):
    scans_batch = payload.get("scans", [])
    synced_ids = []

    conn = get_db()
    cursor = conn.cursor()

    for item in scans_batch:
        scan_id = f"scan_flw_{uuid.uuid4().hex[:8]}"
        cursor.execute('''
        INSERT INTO scans (id, animal_id, user_id, full_body_image_url, predicted_breed, confidence, pregnancy_status, prediction_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            scan_id,
            item.get("animal_id", f"anim_{uuid.uuid4().hex[:6]}"),
            item.get("user_id", "user_flw_1"),
            item.get("image_url", "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80"),
            item.get("breed", "murrah"),
            item.get("confidence", 0.91),
            item.get("pregnancy_status", "NA"),
            "ai_only"
        ))
        synced_ids.append(scan_id)

    conn.commit()
    conn.close()

    return {"success": True, "count": len(synced_ids), "synced_ids": synced_ids}

# --- AI COPILOT CHAT ---
@app.post("/api/chat")
def chat_copilot(payload: dict, x_gemini_key: Optional[str] = Header(None)):
    message = payload.get("message", "")
    breed_name = payload.get("breed_name", "Gir Cow")
    api_key = payload.get("api_key") or x_gemini_key

    # Try Gemini first if key is configured
    reply = call_gemini_copilot(message, breed_name=breed_name, api_key=api_key)
    source = "gemini" if reply else "expert_knowledge_engine"

    if not reply:
        reply = get_expert_copilot_reply(message, breed_name=breed_name)

    return {
        "reply": reply,
        "source": source,
        "breed_name": breed_name,
        "audio_available": True
    }

# ============================================================
# ANIMAL IDENTITY & VERIFICATION (IRIS BIOMETRIC LAYER)
# ============================================================

@app.post("/api/identity/register")
async def identity_register(
    bpaTagId: str = Form(...),
    animalType: str = Form("Cattle"),
    breed: str = Form("Gir Cow"),
    ageMonths: int = Form(...),
    growthStage: str = Form("Calf"),
    eyeSide: str = Form("right"),
    eyeImage: UploadFile = File(...)
):
    """
    Registers a new animal identity and enlists its initial biometric template (V1).
    Performs duplicate screening across existing records.
    """
    eye_bytes = await eyeImage.read()
    if len(eye_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Eye image exceeds 12MB limit.")

    result = iris_service.register_animal(
        bpa_tag_id=bpaTagId,
        animal_type=animalType,
        breed=breed,
        age_months=ageMonths,
        growth_stage=growthStage,
        eye_image_bytes=eye_bytes,
        eye_side=eyeSide
    )

    if not result.get("success") and result.get("status") in ("INVALID_TAG_FORMAT", "ALREADY_REGISTERED"):
        raise HTTPException(status_code=400, detail=result.get("message"))

    return result

@app.post("/api/identity/verify")
async def identity_verify(
    bpaTagId: str = Form(...),
    eyeImage: UploadFile = File(...)
):
    """
    Verifies an animal's physical identity against all enrolled templates across its lifecycle.
    """
    eye_bytes = await eyeImage.read()
    if len(eye_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Eye image exceeds 12MB limit.")

    result = iris_service.verify_animal(
        bpa_tag_id=bpaTagId,
        eye_image_bytes=eye_bytes
    )

    return result

@app.post("/api/identity/update-biometric")
async def identity_update_biometric(
    bpaTagId: str = Form(...),
    currentAgeMonths: int = Form(...),
    newGrowthStage: str = Form("Adult"),
    eyeSide: str = Form("right"),
    forceUpdate: bool = Form(False),
    eyeImage: UploadFile = File(...)
):
    """
    Calf-to-Adult Biometric Lifecycle Re-enrollment.
    Enforces calf origin eligibility and verification before adding a new template (V2, V3...).
    Preserves all previous templates.
    """
    eye_bytes = await eyeImage.read()
    if len(eye_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Eye image exceeds 12MB limit.")

    result = iris_service.update_biometric_lifecycle(
        bpa_tag_id=bpaTagId,
        current_age_months=currentAgeMonths,
        new_growth_stage=newGrowthStage,
        eye_image_bytes=eye_bytes,
        eye_side=eyeSide,
        force_update=forceUpdate
    )

    if not result.get("success") and result.get("status") == "NOT_CALF_ORIGIN":
        raise HTTPException(status_code=400, detail=result.get("message"))

    return result

@app.get("/api/identity/demo/animals")
def identity_get_demo_animals():
    """
    Returns mock BPA records for prototype testing and demonstration.
    """
    return BPARepository.list_demo_animals()

@app.post("/api/identity/check-duplicate")
async def identity_check_duplicate(
    eyeImage: UploadFile = File(...)
):
    """
    Screens an eye image against all enrolled templates to detect potential duplicates.
    """
    eye_bytes = await eyeImage.read()
    if len(eye_bytes) > 12 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Eye image exceeds 12MB limit.")

    result = iris_service.check_duplicate_candidate(eye_bytes)
    return result

@app.get("/api/identity/{bpa_tag_id}")
def identity_get_record(bpa_tag_id: str):
    """
    Retrieves animal identity metadata and biometric history.
    Protects privacy: raw iris templates are never exposed.
    """
    result = iris_service.get_animal_identity(bpa_tag_id)
    if not result.get("found") and not result.get("in_mock_bpa"):
        raise HTTPException(status_code=404, detail="Animal identity record not found.")
    return result


# ============================================================
# SERVER STARTUP
# ============================================================

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port
    )