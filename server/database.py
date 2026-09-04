import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), 'bovine.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        location TEXT,
        role TEXT NOT NULL,
        preferred_language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Breeds Knowledge Base
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS breeds (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        species TEXT NOT NULL, -- cattle or buffalo
        origin TEXT NOT NULL,
        avg_milk_yield TEXT NOT NULL,
        lactation_period TEXT NOT NULL,
        cost_range TEXT NOT NULL,
        ideal_temp_range TEXT NOT NULL,
        feeding_notes TEXT NOT NULL,
        lifespan TEXT NOT NULL,
        description TEXT,
        key_features TEXT, -- JSON string
        disease_risks TEXT, -- JSON string
        image_url TEXT
    )
    ''')

    # Animals Digital Passports
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS animals (
        id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        tag_number TEXT,
        sex TEXT NOT NULL, -- female, male
        predicted_breed_id TEXT,
        confirmed_breed_id TEXT,
        last_scan_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Scans Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY,
        animal_id TEXT,
        user_id TEXT NOT NULL,
        full_body_image_url TEXT,
        face_image_url TEXT,
        predicted_breed TEXT NOT NULL,
        confidence REAL NOT NULL,
        is_new_or_unknown INTEGER DEFAULT 0,
        nearest_matches TEXT, -- JSON array
        pregnancy_status TEXT NOT NULL, -- Pregnant, Not Pregnant, Uncertain, NA
        prediction_status TEXT DEFAULT 'ai_only', -- ai_only, pending_review, vet_confirmed, vet_corrected
        review_notes TEXT,
        latitude REAL,
        longitude REAL,
        location_tag TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Ensure migrations for existing DB instances
    for col, col_type in [
        ("latitude", "REAL"),
        ("longitude", "REAL"),
        ("location_tag", "TEXT"),
        ("estimated_age_range", "TEXT"),
        ("age_indicators", "TEXT"),
        ("age_narrative", "TEXT")
    ]:
        try:
            cursor.execute(f"ALTER TABLE scans ADD COLUMN {col} {col_type}")
        except Exception:
            pass

    # Feedback / Review Queue
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        scan_id TEXT NOT NULL,
        submitted_by TEXT NOT NULL,
        verdict TEXT NOT NULL, -- correct, incorrect
        suggested_breed TEXT,
        note TEXT,
        reviewed_by TEXT,
        review_status TEXT DEFAULT 'pending', -- pending, resolved
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Insurance Providers
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS insurance_providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        covered_species TEXT NOT NULL, -- cattle, buffalo, both
        region TEXT NOT NULL,
        coverage_amount TEXT NOT NULL,
        premium_rate TEXT NOT NULL,
        contact TEXT NOT NULL
    )
    ''')

    # Schemes & Loans
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS schemes (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL, -- loan, subsidy
        name TEXT NOT NULL,
        offered_by TEXT NOT NULL,
        eligibility TEXT NOT NULL,
        amount_range TEXT NOT NULL,
        link TEXT NOT NULL
    )
    ''')

    # Mandi Prices
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mandi_prices (
        id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        district TEXT NOT NULL,
        item TEXT NOT NULL,
        price_per_unit TEXT NOT NULL,
        date TEXT NOT NULL
    )
    ''')

    # Animal Identities (BPA / Pashu Aadhaar Verification Layer)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS animal_identities (
        id TEXT PRIMARY KEY,
        bpa_tag_id TEXT UNIQUE NOT NULL,
        animal_type TEXT NOT NULL, -- Cattle, Buffalo
        breed TEXT NOT NULL,
        registration_age_months INTEGER NOT NULL,
        registration_stage TEXT NOT NULL, -- Calf, Juvenile, Adult
        current_age_months INTEGER NOT NULL,
        biometric_enrollment_status TEXT DEFAULT 'enrolled',
        is_demo INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Biometric Templates (Encrypted/Encoded Representation with Multi-Version Lifecycle)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS biometric_templates (
        id TEXT PRIMARY KEY,
        animal_identity_id TEXT NOT NULL,
        template_version INTEGER NOT NULL,
        eye_side TEXT DEFAULT 'right',
        animal_age_months INTEGER NOT NULL,
        growth_stage TEXT NOT NULL, -- Calf, Juvenile, Adult
        iris_template TEXT NOT NULL, -- Base64 encoded iris code bitstream
        feature_vector TEXT, -- JSON float array for rapid cosine distance
        template_version_identifier TEXT NOT NULL, -- V1, V2, V3...
        quality_score REAL NOT NULL,
        verification_status TEXT DEFAULT 'verified',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_identity_id) REFERENCES animal_identities (id)
    )
    ''')

    conn.commit()

    # Seed Breeds Data if Empty
    cursor.execute("SELECT COUNT(*) FROM breeds")
    if cursor.fetchone()[0] == 0:
        seed_data(conn)

    # Seed Demo Iris Records if Empty
    cursor.execute("SELECT COUNT(*) FROM animal_identities")
    if cursor.fetchone()[0] == 0:
        seed_iris_demo_data(conn)

    conn.close()

def seed_data(conn):
    cursor = conn.cursor()
    
    breeds = [
        # Cattle
        ("gir", "Gir", "cattle", "Gujarat (Kathiawar / Junagadh)", "12 - 18 Liters / day", "300 days", "₹65,000 - ₹1,20,000", "15°C - 45°C (High heat tolerance)", "Green fodder (Napier grass, Sorghum), Mineral mixture, 3kg concentrates", "12-15 yrs (10-12 productive years)", 
         "World-renowned A2 milk indigenous breed with high butterfat content (4.5-5%).",
         json.dumps(["Rounded convex forehead", "Long pendulous floppy ears", "Deep red to speckled white coat"]),
         json.dumps(["Mastitis", "Tick-borne fever", "Foot-and-Mouth Disease"]),
         "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80"),
        
        ("sahiwal", "Sahiwal", "cattle", "Punjab & Rajasthan", "14 - 20 Liters / day", "305 days", "₹70,000 - ₹1,35,000", "10°C - 42°C (Heat & drought resilient)", "Leguminous fodder, Silage, Wheat straw, 4kg dairy meal daily", "14-16 yrs (10-13 productive years)",
         "Highest milk producing indigenous cattle breed in South Asia with heavy dewlap and calm demeanor.",
         json.dumps(["Heavy reddish brown build", "Loose skin & heavy dewlap", "Stout horns"]),
         json.dumps(["Bloat", "Mastitis", "Anaplasmosis"]),
         "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80"),
        
        ("red_sindhi", "Red Sindhi", "cattle", "Northern & Western India", "10 - 15 Liters / day", "290 days", "₹55,000 - ₹95,000", "12°C - 44°C", "Green Maize, Berseem, Concentrates 3.5kg", "13-15 yrs",
         "Deep red compact dairy breed highly adaptable to humid and tropical climates.",
         json.dumps(["Deep dark red coat", "Compact muscular body", "Short thick horns"]),
         json.dumps(["Tick fever", "Milk fever"]),
         "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"),

        ("tharparkar", "Tharparkar", "cattle", "Thar Desert, Rajasthan", "8 - 14 Liters / day", "285 days", "₹50,000 - ₹90,000", "5°C - 48°C (Extreme desert tolerance)", "Dry fodder, Mustard cake, Shrubs & local grasses", "14-16 yrs",
         "Dual purpose desert breed known for turning white in extreme summer sun.",
         json.dumps(["White to light grey coat", "Lyre shaped curved horns", "Medium build"]),
         json.dumps(["Foot Rot", "Lumpy Skin Disease"]),
         "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80"),

        ("kankrej", "Kankrej", "cattle", "Rann of Kutch & North Gujarat", "8 - 13 Liters / day", "290 days", "₹60,000 - ₹1,10,000", "15°C - 46°C", "Coarse fodder, Agricultural byproducts, Green sorghum", "15-18 yrs",
         "One of the heaviest Indian breeds famous for its peculiar fast gait ('Sawai Chal').",
         json.dumps(["Massive lyre-shaped horns", "Silver grey to iron grey coat", "Prominent hump"]),
         json.dumps(["Joint stiffness", "Parasitic infection"]),
         "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80"),

        ("ongole", "Ongole", "cattle", "Prakasam & Guntur, Andhra Pradesh", "6 - 12 Liters / day", "280 days", "₹65,000 - ₹1,40,000", "18°C - 45°C", "Paddy straw, Green maize, Protein oil cakes", "16-18 yrs",
         "World-class heavy draught & milk breed resistant to tropical diseases and ticks.",
         json.dumps(["Glossy white coat", "Large muscular hump", "Short stumpy horns"]),
         json.dumps(["Black quarter", "Anthrax"]),
         "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=600&q=80"),

        ("hallikar", "Hallikar", "cattle", "Southern Karnataka (Mysuru/Hassan)", "4 - 8 Liters / day", "270 days", "₹45,000 - ₹85,000", "16°C - 40°C", "Dry ragi straw, Green fodder, Mineral blocks", "14-16 yrs",
         "Premier draught breed of South India with characteristic backward sweeping sharp horns.",
         json.dumps(["Long vertical backward horns", "Compact grey coat", "Agile athletic frame"]),
         json.dumps(["Horn cancer", "Foot injuries"]),
         "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"),

        ("hariana", "Hariana", "cattle", "Rohtak, Hisar, Haryana", "7 - 12 Liters / day", "280 days", "₹45,000 - ₹80,000", "8°C - 44°C", "Wheat straw, Bajra, Green clover, Cottonseed cake", "14-15 yrs",
         "Popular dual-purpose breed widely reared across North Indian plains.",
         json.dumps(["White to light grey coat", "Small upright face & ears", "Short horns"]),
         json.dumps(["Mastitis", "Subclinical ketosis"]),
         "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80"),

        ("kangayam", "Kangayam", "cattle", "Tiruppur & Erode, Tamil Nadu", "3 - 7 Liters / day", "260 days", "₹50,000 - ₹95,000", "18°C - 42°C", "Dry grass, Sorghum, Coconut cake", "15-18 yrs",
         "Resilient South Indian draught breed adapted to dry red soils and tough terrain.",
         json.dumps(["Grey coat with black markings", "Short sharp horns", "Strong legs"]),
         json.dumps(["Tick infestation"]),
         "https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=600&q=80"),

        # Buffaloes
        ("murrah", "Murrah", "buffalo", "Rohtak & Hisar, Haryana", "14 - 22 Liters / day", "305 days", "₹90,000 - ₹1,80,000", "8°C - 42°C (Needs wallowing pond/water sprays)", "Green berseem, Mustard cake, Wheat straw, 5kg high-protein dairy feed", "16-20 yrs (12-14 productive years)",
         "Undisputed 'Black Gold' of Indian dairy sector. World's highest milk producing buffalo breed with 7-8% butterfat.",
         json.dumps(["Jet black body color", "Tightly curled ring horns", "Short white switch tail"]),
         json.dumps(["Subclinical Mastitis", "Haemorrhagic Septicaemia (HS)", "Prolapse"]),
         "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"),

        ("nili_ravi", "Nili-Ravi", "buffalo", "Sutlej & Ravi River Belts, Punjab", "12 - 18 Liters / day", "300 days", "₹85,000 - ₹1,55,000", "8°C - 40°C", "Green clover, Silage, Concentrates 4.5kg", "15-18 yrs",
         "Famous 'Panj Kalyan' (five white markings) buffalo known for high fat milk & docility.",
         json.dumps(["Wall eyes (white iris)", "White star on forehead", "White markings on muzzle & legs"]),
         json.dumps(["Uterine torsion", "Parasitic gastroenteritis"]),
         "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"),

        ("jaffarabadi", "Jaffarabadi", "buffalo", "Gir Forest & Kathiawar, Gujarat", "14 - 20 Liters / day", "305 days", "₹95,000 - ₹1,70,000", "12°C - 45°C", "Sugarcane tops, Napier grass, Cottonseed cake", "16-19 yrs",
         "Massive heavy buffalo breed yielding very rich milk (8-10% fat).",
         json.dumps(["Heavy drooping broad horns", "Massive wide forehead", "Deep heavy ribcage"]),
         json.dumps(["Calving difficulty", "Udder edema"]),
         "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"),

        ("surti", "Surti", "buffalo", "Kheda & Vadodara, Gujarat", "9 - 14 Liters / day", "290 days", "₹65,000 - ₹1,10,000", "15°C - 42°C", "Green forage, Grain mixture 3kg, Mineral salt", "15-17 yrs",
         "Medium sized economical buffalo breed with sickle-shaped horns.",
         json.dumps(["Sickle shaped horns", "Two white collars on neck", "Straight back"]),
         json.dumps(["Mastitis"]),
         "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"),

        ("mehsana", "Mehsana", "buffalo", "Mehsana & Banaskantha, Gujarat", "11 - 17 Liters / day", "300 days", "₹75,000 - ₹1,30,000", "14°C - 44°C", "Green maize, Sorghum, Cottonseed meal", "16-18 yrs",
         "High yielding dairy breed derived from Murrah and Surti crossbreeding.",
         json.dumps(["Long body frame", "Semi-curled horns", "Black coat color"]),
         json.dumps(["Repeat breeding", "Metritis"]),
         "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80"),

        ("banni", "Banni", "buffalo", "Kutch Desert Rann, Gujarat", "10 - 16 Liters / day", "295 days", "₹80,000 - ₹1,45,000", "5°C - 48°C (Extreme climate resilience)", "Night grazing on native halophytic grasses, Acacia pods", "16-20 yrs",
         "Famous night-grazing desert buffalo capable of walking up to 15km daily.",
         json.dumps(["Coiled inverted horns", "Robust black coat", "High endurance feet"]),
         json.dumps(["Dehydration", "Heat stress"]),
         "https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80")
    ]

    cursor.executemany('''
    INSERT INTO breeds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', breeds)

    # Insurance Providers
    insurance = [
        ("ins_1", "National Insurance - Pashudhan Bima", "both", "Pan India", "Up to ₹1,50,000 per animal", "2.5% - 4.5% p.a. (80% Govt Subsidy)", "+91 1800-345-0330"),
        ("ins_2", "HDFC ERGO Cattle Insurance", "both", "North & West India", "Up to ₹1,20,000 per animal", "3.0% p.a.", "+91 1800-266-6444"),
        ("ins_3", "SBI General Livestock Protect", "both", "South & Central India", "Up to ₹1,00,000 per animal", "3.2% p.a.", "+91 1800-102-1111"),
        ("ins_4", "ICICI Lombard Pashu Kavach", "both", "Pan India", "Up to ₹1,80,000 per animal", "3.5% p.a.", "+91 1800-266-7780")
    ]
    cursor.executemany("INSERT INTO insurance_providers VALUES (?, ?, ?, ?, ?, ?, ?)", insurance)

    # Schemes
    schemes = [
        ("sch_1", "subsidy", "Rashtriya Gokul Mission - Breed Improvement Grant", "Ministry of Fisheries, Animal Husbandry & Dairying", "Farmers owning indigenous cattle (Gir, Sahiwal, Murrah)", "50% capital subsidy up to ₹50 Lakhs for mini dairy farms", "https://dahd.nic.in/rashtriya-gokul-mission"),
        ("sch_2", "loan", "Pashu Kisan Credit Card (PKCC)", "NABARD & State Banks", "Small & Marginal Farmers owning 1-5 animals", "Collateral-free loan up to ₹1.6 Lakh @ 4% interest rate", "https://nabard.org/pkcc"),
        ("sch_3", "subsidy", "National Livestock Mission (NLM) Fodder Subsidy", "Department of Animal Husbandry", "Registered farmers / FLW dairy co-ops", "50% subsidy up to ₹10 Lakhs for fodder processing units", "https://nlm.udyamimitra.in"),
        ("sch_4", "loan", "Dairy Processing & Infrastructure Development Fund (DIDF)", "NDDB / NABARD", "Dairy Cooperatives & FPOs", "Concessional loan @ 6.5% for bulk milk chillers and testing kit", "https://didf.nddb.coop")
    ]
    cursor.executemany("INSERT INTO schemes VALUES (?, ?, ?, ?, ?, ?, ?)", schemes)

    # Mandi Prices
    mandi = [
        ("m1", "Haryana", "Karnal", "Murrah Buffalo Milk (7% Fat)", "₹62 / Liter", "2026-09-03"),
        ("m2", "Gujarat", "Anand", "Gir Cow Milk (A2 Quality)", "₹68 / Liter", "2026-09-03"),
        ("m3", "Punjab", "Ludhiana", "Sahiwal Cow Milk (4.5% Fat)", "₹58 / Liter", "2026-09-03"),
        ("m4", "Andhra Pradesh", "Guntur", "Ongole Cow Milk", "₹54 / Liter", "2026-09-03"),
        ("m5", "Tamil Nadu", "Erode", "Local Cow Milk", "₹52 / Liter", "2026-09-03")
    ]
    cursor.executemany("INSERT INTO mandi_prices VALUES (?, ?, ?, ?, ?, ?)", mandi)

    # Default Demo Users
    users = [
        ("user_farmer_1", "Ramesh Patel", "+919876543210", "Anand, Gujarat", "farmer", "hi"),
        ("user_flw_1", "Sunita Sharma", "+919876543211", "Rohtak, Haryana", "flw", "en"),
        ("user_vet_1", "Dr. Vikram Singh", "+919876543212", "Ludhiana, Punjab", "vet", "en")
    ]
    cursor.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", users)

    conn.commit()

def seed_iris_demo_data(conn):
    cursor = conn.cursor()
    import base64
    import random

    # Animal 1: Registered as Calf at 3 months, now 24 months with V1 and V2
    anim1_id = "anim_id_demo_gir_01"
    cursor.execute('''
    INSERT OR IGNORE INTO animal_identities (
        id, bpa_tag_id, animal_type, breed, registration_age_months,
        registration_stage, current_age_months, biometric_enrollment_status, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (anim1_id, "123456789012", "Cattle", "Gir Cow", 3, "Calf", 24, "updated", 1))

    # Base bit pattern for Animal 1
    random.seed(42)
    base_bytes_1 = bytes(random.randint(0, 255) for _ in range(128))
    b64_t1 = base64.b64encode(base_bytes_1).decode('utf-8')
    feat_vec_1 = json.dumps([round(random.uniform(-1.0, 1.0), 3) for _ in range(64)])

    # V1 Template (Calf - 3 months)
    cursor.execute('''
    INSERT OR IGNORE INTO biometric_templates (
        id, animal_identity_id, template_version, eye_side, animal_age_months,
        growth_stage, iris_template, feature_vector, template_version_identifier,
        quality_score, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("bt_demo_gir_v1", anim1_id, 1, "right", 3, "Calf", b64_t1, feat_vec_1, "V1", 0.88, "enrolled"))

    # Slight biological variation for V2 (Juvenile - 12 months)
    v2_list = list(base_bytes_1)
    for idx in random.sample(range(128), 12):
        v2_list[idx] ^= 0x55
    b64_t2 = base64.b64encode(bytes(v2_list)).decode('utf-8')
    feat_vec_2 = json.dumps([round(random.uniform(-1.0, 1.0), 3) for _ in range(64)])

    # V2 Template (Juvenile - 12 months)
    cursor.execute('''
    INSERT OR IGNORE INTO biometric_templates (
        id, animal_identity_id, template_version, eye_side, animal_age_months,
        growth_stage, iris_template, feature_vector, template_version_identifier,
        quality_score, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("bt_demo_gir_v2", anim1_id, 2, "right", 12, "Juvenile", b64_t2, feat_vec_2, "V2", 0.91, "verified"))

    # Animal 2: Murrah Buffalo (Registered as Juvenile at 14 months)
    anim2_id = "anim_id_demo_murrah_02"
    cursor.execute('''
    INSERT OR IGNORE INTO animal_identities (
        id, bpa_tag_id, animal_type, breed, registration_age_months,
        registration_stage, current_age_months, biometric_enrollment_status, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (anim2_id, "234567890123", "Buffalo", "Murrah Buffalo", 14, "Juvenile", 36, "enrolled", 1))

    random.seed(99)
    base_bytes_2 = bytes(random.randint(0, 255) for _ in range(128))
    b64_buf = base64.b64encode(base_bytes_2).decode('utf-8')
    feat_vec_buf = json.dumps([round(random.uniform(-1.0, 1.0), 3) for _ in range(64)])

    cursor.execute('''
    INSERT OR IGNORE INTO biometric_templates (
        id, animal_identity_id, template_version, eye_side, animal_age_months,
        growth_stage, iris_template, feature_vector, template_version_identifier,
        quality_score, verification_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ("bt_demo_murrah_v1", anim2_id, 1, "right", 14, "Juvenile", b64_buf, feat_vec_buf, "V1", 0.85, "enrolled"))

    conn.commit()

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully.")
