import os
import json
import urllib.request
import urllib.error
import requests

def get_gemini_api_key(api_key: str = None) -> str:
    if api_key and isinstance(api_key, str) and len(api_key.strip()) >= 15 and api_key.strip() not in ("null", "undefined"):
        return api_key.strip()
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key and len(key) >= 15 and key not in ("null", "undefined"):
        return key
    # Try reading from .env file
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
                            if k == "GEMINI_API_KEY" and len(v) >= 15:
                                os.environ["GEMINI_API_KEY"] = v
                                return v
            except Exception:
                pass
    return ""

def call_gemini_copilot(message: str, breed_name: str = "Gir Cow", api_key: str = None) -> str:
    key = get_gemini_api_key(api_key)
    if not key:
        return None

    prompt = (
        f"You are BREEDIFY AI Agent, an expert Indian veterinary doctor and livestock dairy farming specialist from ICAR-NDRI. "
        f"The animal in discussion is a {breed_name}. "
        f"Answer this farmer's query clearly, concisely, and practically with actionable advice: '{message}'. "
        f"Use clean markdown with bullet points and bold highlights. Include dosages, timings, or rupee amounts where relevant. "
        f"If the farmer asks in Hindi, Gujarati, or Telugu, respond primarily in that language with English terms in parentheses."
    )

    payload = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800
        }
    }

    models = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-flash-latest", "gemini-3.7-flash"]
    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
            resp = requests.post(url, json=payload, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                reply = data["candidates"][0]["content"]["parts"][0]["text"]
                if reply and len(reply.strip()) > 10:
                    return reply.strip()
        except Exception as e:
            print(f"[Gemini AI Agent {model} Attempt]: {e}")
            continue

    return None

def get_expert_copilot_reply(raw_message: str, breed_name: str = "Gir Cow") -> str:
    text = raw_message.lower().strip()
    def t(kws):
        return any(k in text for k in kws)

    # 1. GREETINGS
    if t(['hi', 'hello', 'hey', 'namaste', 'pranam', 'ram ram', 'vanakkam', 'namaskara', 'नमस्ते', 'प्रणाम', 'राम राम', 'నమస్కారం']):
        return f"""Namaste Kisan Bandhu! 🙏 I am your **BREEDIFY AI Agent**, specialized in veterinary medicine, dairy herd management, and agricultural schemes for your **{breed_name}**.

You can ask me about:
• 🥛 **Milk Yield & Butterfat Optimization** (Bypass fat, rumen buffers, feeding ratios)
• 🌿 **Scientific Fodder & Silage Rations** (Legume-cereal mix, mineral supplementation)
• 🩺 **Veterinary Emergencies & Diseases** (Bloat, Mastitis, Fever, Diarrhea, FMD, LSD)
• 🐄 **Reproduction & AI Timing** (AM-PM rule, silent heat detection, pregnancy care)
• 💰 **Financial Schemes & Insurance** (PKCC loans, 50% Gokul subsidies, claims)

How may I assist your livestock today?"""

    # 2. MILK YIELD & FAT / SNF
    if t(['milk', 'yield', 'fat', 'snf', 'butterfat', 'production', 'दूध', 'फैट', 'पशु का दूध', 'పాలు', 'వెన్న']):
        return f"""### 🥛 Protocol to Boost Milk Yield & Butterfat in {breed_name}:

1. **Bypass Fat Supplementation**: Add **50–100g of rumen-protected bypass fat** (fractionated palm triglycerides) per animal daily during peak lactation. Increases milk fat by **0.4% to 0.8%**.
2. **Roughage Balancing**: Maintain a ratio of **60% green succulent fodder (Napier/Maize/Berseem) : 40% chopped dry straw**. Rumination of dry roughage produces acetate — the precursor for milk fat.
3. **Rumen Buffer**: If feeding >3kg concentrate, add **30–50g Sodium Bicarbonate (meetha soda)** daily to avoid subclinical rumen acidosis which suppresses fat.
4. **Chelated Mineral Mixture**: **50g daily** with bioavailable Zinc, Copper, and Cobalt for maximum mammary gland efficiency.
5. **Complete Stripping**: The last 10% of stripped milk contains nearly 3x higher butterfat. Strip all quarters completely within 5–7 minutes."""

    # 3. FEED / FODDER / RATION
    if t(['feed', 'fodder', 'ration', 'silage', 'diet', 'nutrition', 'चारा', 'दाना', 'खुराक', 'మేత']):
        return f"""### 🌿 Balanced Daily Ration for {breed_name} (~450–550 kg Body Wt):

• **Green Fodder**: **20–25 kg/day** (mix leguminous Berseem/Cowpea with cereal Napier/Maize for high digestible crude protein).
• **Dry Straw / Roughage**: **4–5 kg/day** of chopped wheat or paddy straw for healthy rumen microbial fermentation.
• **Balanced Concentrate**: Base maintenance 1.5 kg + 1 kg for every 2.5 kg milk produced.
  - *Formula*: 35% broken grains (Maize/Barley), 32% oil meal cakes (Cottonseed/Mustard), 30% wheat bran/rice polish, 2% mineral mix, 1% common salt.
• **Fresh Clean Water**: **70–90 Liters/day** available 24/7. Water restriction directly cuts milk output by 25%."""

    # 4. HEAT DETECTION & ARTIFICIAL INSEMINATION (AI)
    if t(['heat', 'inseminat', 'ai', 'breeding', 'semen', 'am pm', 'मद', 'गर्भाधान', 'व्यांत', 'ఎద']):
        return f"""### 🐄 Heat Detection & AI Timing for {breed_name}:

**Key Heat Indicators:**
• Clear, elastic, transparent mucus discharge from vulva.
• Frequent bellowing, tail raising, and allowing other animals to mount (standing heat).
• *Buffalo Note*: 70% of buffaloes show **silent heat** — inspect mucus discharge between 4:00 AM and 6:00 AM.

**The Golden AM-PM Rule for AI:**
• Standing heat observed in the **MORNING** → Inseminate same day **EVENING (5:00 PM – 8:00 PM)**.
• Standing heat observed in the **EVENING** → Inseminate next day **MORNING (7:00 AM – 10:00 AM)**.

**Post-AI Care**: Keep the animal resting quietly in shade for 2 hours. Do not transport or stress."""

    # 5. BLOAT / EMERGENCY
    if t(['bloat', 'gas', 'tympan', 'swollen', 'belly', 'अफरा', 'आफरा', 'पेट फूलना', 'కడుపు ఉబ్బరం']):
        return f"""### ⚠️ EMERGENCY: Acute Ruminal Bloat / Tympanites:

**Immediate Farmer Actions (Execute within 10 minutes):**
1. **Elevate Front Body**: Stand animal on a 15–20 degree incline or mound to facilitate gas eructation (belching).
2. **Wooden Gag**: Insert a smooth wooden stick in the mouth crosswise behind horns to encourage chewing and salivation.
3. **Anti-Froth Drench**: Slowly drench **300–400 ml edible Mustard Oil or Groundnut Oil** mixed with **15 ml pure Turpentine Oil** via bottle.
4. **Commercial Drench**: Alternatively administer 100 ml of Bloatosil / Tympanol.
5. **Vet Call**: If the left flank is taut like a drum and breathing is labored, call a veterinarian immediately for left paralumbar trocarization."""

    # 6. MASTITIS / UDDER HEALTH
    if t(['mastitis', 'udder', 'teat', 'hard udder', 'clots', 'थनैला', 'थन', 'अयन', 'పొదుగు వాపు']):
        return f"""### 🩺 Mastitis Prevention & Treatment Protocol:

**Clinical Signs:** Swollen, hot, or painful quarters, watery milk, yellowish serum, or cheese-like clots.

**Action Steps:**
1. **Frequent Stripping**: Empty the affected quarter completely every 2–3 hours into a disinfectant vessel (never on floor).
2. **Cold Compress**: Apply ice packs or cold water compresses to reduce inflammatory heat.
3. **Post-Milking Teat Dip**: Dip teats immediately after every milking in **0.5% Povidone-Iodine** or chlorhexidine.
4. **Milking Order**: Always milk young healthy animals first, and mastitic animals strictly last.
5. **Veterinary Therapy**: Contact your vet for intramammary antibiotic infusions (Cefoperazone or Cloxacillin) and anti-inflammatory injection (Meloxicam)."""

    # 7. FEVER / INFECTION
    if t(['fever', 'temperature', 'pyrexia', 'hot body', 'shivering', 'बुखार', 'ताप', 'ज्वर', 'జ్వరం']):
        return f"""### 🩺 High Fever Management in {breed_name}:

• **Normal Bovine Temp**: **101.5°F – 102.5°F**. Anything > 103.5°F indicates active infection.
• **Immediate Actions**:
  1. Move animal to a cool, shaded, well-ventilated shelter.
  2. Sponge head, neck, and spine with cool water (do NOT throw chilled ice water over whole body suddenly).
  3. Offer fresh water with electral/ORS powder.
  4. Veterinary Anti-Pyretic: **Meloxicam + Paracetamol (Melonex Plus)** injectable or bolus.
  5. Check for tick infestation or swollen prescapular lymph nodes (rule out Tick Fever / Theileriosis)."""

    # 8. DIARRHEA / LOOSE MOTION
    if t(['diarrhea', 'diarrhoea', 'loose motion', 'dung', 'scour', 'दस्त', 'पतला गोबर', 'విరేచనాలు']):
        return f"""### 🩺 Bovine Diarrhea / Enteritis Protocol:

1. **Hydration First**: Feed **10–15 Litres of Oral Electrolyte Solution** (water + salt + baking soda + jaggery) split into 3 doses. Dehydration kills faster than infection.
2. **Adsorbent / Protectant**: Drench with **Kaolin-Pectin suspension** or activated charcoal (200g in rice starch water).
3. **Herbal Astringent**: Boil pomegranate rind (अनार छिलका) or Babul bark decoction.
4. **Withhold Succulent Greens**: Feed dry clean straw and soaked wheat bran mash for 24 hours.
5. **Veterinary Rx**: If foul-smelling or bloody, administer Neblon / Diaroak bolus + antibiotic (Sulphadimidine or Enrofloxacin) under vet guidance."""

    # 9. LUMPY SKIN DISEASE (LSD)
    if t(['lumpy', 'lsd', 'skin nodules', 'bumps', 'गांठदार', 'चर्म रोग']):
        return f"""### ⚠️ Lumpy Skin Disease (LSD) Clinical Protocol:

• **Symptoms**: Hard circular 1–5cm skin nodules across body, high fever (105°F), swollen legs and brisket, reduced milk.
• **Spread**: Vector-borne through flies, mosquitoes, and ticks.
• **Farmer Actions**:
  1. Strictly isolate affected cattle from the rest of the herd.
  2. Spray fly repellents and disinfectant (Ectomin/Deltamethrin) inside the shed.
  3. Apply **Povidone Iodine ointment** or Neem oil on ruptured nodules to prevent maggot infestation.
  4. Provide soft palatable green grass and electrolytes.
  5. **Vaccination**: Heterologous Goat Pox vaccine (1 ml s/c) covers healthy cattle in the village."""

    # 10. VACCINATION CALENDAR
    if t(['vaccin', 'fmd', 'hs', 'bq', 'injection', 'टीका', 'खुरपका', 'गलघोंटू', 'టీకాలు']):
        return f"""### 💉 National Livestock Vaccination Calendar for {breed_name}:

1. **FMD (Foot & Mouth Disease)**: **Bi-annually (May & November)** | All cattle and buffaloes above 4 months.
2. **HS (Haemorrhagic Septicaemia / गलघोंटू)**: **Annually in May** (pre-monsoon) | Essential for buffaloes (high mortality).
3. **BQ (Black Quarter / लंगड़ा बुखार)**: **Annually in April/May** | Young calves 6 months – 2 years.
4. **Brucellosis**: **Once in lifetime** | Female heifer calves between **4 to 8 months** only.
5. **Lumpy Skin Disease (LSD)**: **Annually** using Goat Pox vaccine as directed by Animal Husbandry Department."""

    # 11. GOVERNMENT LOANS & SUBSIDIES
    if t(['loan', 'scheme', 'pkcc', 'subsidy', 'kcc', 'nabard', 'gokul', 'योजना', 'ऋण', 'सब्सिडी', 'రుణాలు']):
        return f"""### 💰 Key Government Dairy Financial Schemes (2026):

**1. Pashu Kisan Credit Card (PKCC):**
• **Collateral-Free Loan up to ₹1,60,000** for buying milch animals and feed expenses.
• Interest Rate: Effectively **4% per annum** (7% base minus 3% prompt repayment subvention).
• Credit limits: ₹44,000 per cow | ₹61,000 per buffalo.

**2. Rashtriya Gokul Mission (Breed Conservation):**
• **Up to 50% Capital Subsidy** (max ₹2.00 Crore) for setting up indigenous breed multiplication farms (Gir, Sahiwal, Murrah).
• Free sex-sorted semen straws and automated doorstep artificial insemination.

**3. Animal Husbandry Infrastructure Development Fund (AHIDF):**
• 3% interest subvention for bulk milk coolers, chilling units, and automated milking parlors."""

    # 12. LIVESTOCK INSURANCE
    if t(['insurance', 'policy', 'claim', 'premium', 'बीमा', 'पशु बीमा', 'క్లెయిమ్']):
        return f"""### 🛡️ Livestock Insurance Claim & Enrollment Guidelines:

**Subsidized Schemes:**
• **National Livestock Insurance (NLIS)**: Covers accidental death, epidemic diseases (FMD, Anthrax, HS). 50% to 70% premium subsidized by government.
• Maximum cover up to ₹1,10,000 with 12-digit INAPH ear-tag identification.

**Claim Protocol (In Case of Animal Death):**
1. Inform insurance company helpline within **24 hours**.
2. Conduct **Post-Mortem examination** with government veterinary officer.
3. Submit PM certificate, original ear-tag, photos of carcass with ear-tag, and policy document. Claims settled within 14 working days."""

    # 13. DEFAULT INTELLIGENT REPLY
    return f"""### 🐄 BREEDIFY AI Agent Advisory for {breed_name}:

Regarding your query on **"{raw_message}"**:

• **Nutritional Standard**: Ensure 60% green fodder + 40% dry straw with 50g chelated mineral mixture daily.
• **Daily Health Monitoring**: Normal bovine temperature is **101.5°F–102.5°F**. Active rumination is 40–50 chews per cud.
• **Biosecurity**: Maintain clean dry bedding, regular tick control spray (Amitraz/Flumethrin), and bi-annual FMD vaccination.

Feel free to ask for specific protocols on: 🥛 Milk boosting | 🌿 Ration mixing | 🩺 Disease first-aid | 🐄 Insemination timing | 💰 PKCC loan application."""
