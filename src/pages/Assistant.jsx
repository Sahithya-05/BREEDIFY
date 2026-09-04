import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Send, Mic, MicOff, Volume2, VolumeX, Bot, User,
  Sparkles, Loader2, ChevronRight, RotateCcw, ThumbsUp,
  ThumbsDown, CheckCircle2, ShieldCheck, HeartPulse,
  Droplets, HelpCircle
} from 'lucide-react';

const CATEGORY_PROMPTS = {
  milk: [
    'How to increase milk yield & fat percentage?',
    'What is the daily green and dry fodder ratio?',
    'How does bypass fat improve lactation?',
    'What causes sudden drop in milk yield?'
  ],
  health: [
    'How to detect subclinical mastitis early?',
    'What to do immediately if animal shows bloat?',
    'What is the annual vaccination calendar?',
    'Natural and herbal remedies for tick control?'
  ],
  breeding: [
    'When is the exact right time for Artificial Insemination (AI)?',
    'How to care for a pregnant animal in the 8th-9th month?',
    'Colostrum feeding protocol for newborn calf?',
    'Normal gestation period for cattle vs buffaloes?'
  ],
  finance: [
    'How to get Pashu Kisan Credit Card (PKCC) without collateral?',
    'What subsidies exist under Rashtriya Gokul Mission?',
    'How is milk price calculated based on Fat and SNF?',
    'How to claim livestock insurance in case of accident?'
  ]
};

// Comprehensive Expert Knowledge Base
function getIntelligentReply(rawText, breedName) {
  const text = rawText.toLowerCase().trim();
  const t = (kws) => kws.some(k => text.includes(k));

  // ─── GREETINGS ───────────────────────────────────────────────
  if (t(['hi', 'hello', 'hey', 'namaste', 'pranam', 'ram ram', 'vanakkam', 'namaskara', 'hola', 'नमस्ते', 'प्रणाम', 'राम राम'])) {
    return `Namaste Kisan Bandhu! 🙏 I am your **BREEDIFY AI Agent**, specialized in Indian dairy farming, livestock veterinary care, and government schemes for your **${breedName}**.\n\nYou can ask me about:\n• 🥛 **Milk Yield & Fat/SNF Boosting**\n• 🌿 **Fodder & Ration Balancing**\n• 🩺 **Disease First-Aid & Vaccination**\n• 🐄 **Heat Detection & AI Timing**\n• 💰 **PKCC Loans & Government Subsidies**\n\nHow may I help your dairy farm today?`;
  }

  // ─── MILK YIELD / FAT / SNF / QUALITY ───────────────────────
  if (t(['milk yield', 'milk production', 'increase milk', 'boost milk', 'more milk', 'low milk', 'दूध उत्पादन', 'दूध कम', 'fat percentage', 'fat%', 'snf', 'butterfat', 'bypass fat', 'milk quality', 'milk fat', 'improve lactation', 'लेक्टेशन', 'दूध की मात्रा', 'दूध बढ़ाना'])) {
    return `### 🥛 Protocol to Boost Milk Yield & Fat in ${breedName}:\n\n1. **Roughage Ratio**: Feed **60% green fodder** (Napier, Maize, Berseem) + **40% dry straw**. Rumination of dry roughage produces acetate — the direct building block of milk fat.\n2. **Bypass Fat Supplement**: Add **50–100g rumen-protected bypass fat** (fractionated palm fat) to concentrate during peak lactation. Raises fat by 0.3–0.8%.\n3. **Chelated Mineral Mixture**: **50–60g per day** with calcium, phosphorus, zinc, and biotin.\n4. **Rumen Buffer**: If feeding >3kg grains/day, mix **30–50g Sodium Bicarbonate** (baking soda) to prevent subclinical acidosis that suppresses fat.\n5. **Complete Milking**: Last stripped milk contains the highest fat (up to 10%). Always fully strip all quarters within 5–7 minutes.\n6. **Stress-Free Environment**: Heat stress >35°C reduces milk yield by 20–30%. Provide shade, fans, and wallowing (especially for buffaloes).`;
  }

  // ─── FODDER / FEED / RATION / DIET ──────────────────────────
  if (t(['feed', 'fodder', 'ration', 'silage', 'diet', 'nutrition', 'food', 'concentrate', 'green fodder', 'dry fodder', 'berseem', 'napier', 'maize', 'straw', 'चारा', 'दाना', 'खाना', 'आहार', 'हरा चारा', 'सूखा चारा'])) {
    return `### 🌿 Balanced Daily Ration for ${breedName} (Body Wt ~450–550 kg):\n\n• **Green Fodder**: **20–25 kg/day** — mix legumes (Berseem/Cowpea) with cereals (Sorghum/Maize/Napier) for optimal protein and energy.\n• **Dry Straw**: **4–5 kg/day** — chopped wheat or paddy straw stimulates rumen health and fat synthesis.\n• **Concentrate Feed** = Maintenance base 1.5 kg + 1 kg per every 2.5 kg milk (buffalo) or 3 kg milk (cow).\n  - *Mix*: 35% broken grains (Maize/Barley), 32% oil cakes (Mustard/Cottonseed), 30% bran (Wheat bran/Rice polish), 2% Mineral Mix, 1% Common Salt.\n• **Mineral Mixture**: **50g chelated minerals** daily — prevents lameness, infertility, milk fever, and anaemia.\n• **Clean Water**: **70–90 litres/day**. For every litre of milk produced, a cow needs 3–4 litres of drinking water.`;
  }

  // ─── HEAT DETECTION / AI / BREEDING / INSEMINATION ──────────
  if (t(['heat', 'standing heat', 'inseminat', 'artificial insemination', 'ai timing', 'breeding', 'am pm', 'estrus', 'oestrus', 'गर्भाधान', 'मद', 'ऋतुकाल', 'गाय का मद', 'ब्याहना', 'when to breed', 'when to ai'])) {
    return `### 🐄 Heat Detection & AI Timing for ${breedName}:\n\n**Signs of Heat:**\n• Clear, stringy glass-like mucus discharge hanging from vulva.\n• Restlessness, bellowing, frequent urination, tail raising.\n• Allowing other cows/buffaloes to mount (\"standing heat\" is the gold standard).\n• *Buffalo Note*: 60–70% show SILENT heat — check vulvar swelling and mucus early morning & late night.\n\n**The Crucial AM-PM Rule for Artificial Insemination:**\n• Animal shows standing heat **MORNING** → Inseminate same **EVENING (5 PM – 8 PM)**.\n• Animal shows standing heat **EVENING** → Inseminate next **MORNING (7 AM – 10 AM)**.\n\n**Conception Tips:**\n• Keep the animal in shade and calm for 2 hours post-AI.\n• Do not transport or stress the animal for 24 hours after insemination.\n• Confirm pregnancy via rectal palpation or ultrasonography at 45–60 days.`;
  }

  // ─── PREGNANCY / GESTATION / CALVING / DELIVERY ─────────────
  if (t(['pregnant', 'pregnancy', 'calving', 'gestation', 'delivery', 'calve', 'dry period', 'dry off', 'steaming', 'गर्भवती', 'गाभिन', 'व्यांत', 'ब्याना', 'प्रसव', 'गर्भकाल'])) {
    return `### 🩺 Gestation & Pregnancy Care for ${breedName}:\n\n**Normal Gestation Period:**\n• **Cows (Gir, Sahiwal, Tharparkar)**: ~280–285 days (9 months 9 days)\n• **Buffaloes (Murrah, Jaffarabadi)**: ~310–315 days (10 months 10 days)\n\n**Last 60 Days (Dry Period) Protocol:**\n• Stop milking 60 days before expected delivery for udder tissue recovery.\n• At drying off: Infuse **dry-cow intramammary antibiotic tubes** into all 4 quarters (prevents Dry Period Mastitis).\n• \"Steaming Up\" ration: Increase concentrate by 0.5 kg/week 3 weeks before calving.\n• **⚠️ Avoid high calcium** in last 2 weeks — this prevents Milk Fever (Hypocalcemia) by training the parathyroid glands.\n\n**Signs of Imminent Calving (48 hrs):**\n• Udder filling / bag full and tight. Teats waxing.\n• Pelvic ligaments relax — soft hollow on both sides of tail-head.\n• Mucus discharge from vulva changes from thick to watery.`;
  }

  // ─── CALF CARE / COLOSTRUM ───────────────────────────────────
  if (t(['calf', 'calves', 'colostrum', 'newborn', 'baby animal', 'navel', 'बछड़ा', 'कटड़ा', 'खीस', 'दूध पिलाना', 'नाभि'])) {
    return `### 👶 Newborn Calf Care & Colostrum Protocol:\n\n1. **Clear Airway First**: Remove mucus from nostrils and mouth at birth. Rub chest briskly with dry straw to stimulate breathing.\n2. **Navel Cord Treatment**: Cut cord 2 inches from body with sterile scissors. Dip in **7% Tincture of Iodine** twice daily for 3 days — prevents Joint-Ill (Navel Ill) infection.\n3. **The Golden Colostrum Rule (खीस)**:\n   - Feed warm colostrum **within 1–2 hours of birth** — antibody absorption closes after 24 hours.\n   - Amount: **10% of calf body weight/day** → ~3–4 litres split across 3 feedings.\n4. **Deworming**: Oral Piperazine or Albendazole on **Day 7**, repeat at Day 21.\n5. **Brucellosis Vaccination**: Female heifer calves must receive a single lifetime dose between **4 to 8 months** of age.`;
  }

  // ─── BLOAT / TYMPANITES ──────────────────────────────────────
  if (t(['bloat', 'tympan', 'gas', 'swollen belly', 'swollen stomach', 'left flank', 'अफरा', 'पेट फूलना', 'गैस', 'आफरा'])) {
    return `### ⚠️ EMERGENCY: Acute Bloat / Tympanites in ${breedName}:\n\n**Immediate Actions (Do within 10 minutes):**\n1. Keep animal **standing with front legs elevated** on a raised mound or slope.\n2. Insert a clean wooden stick gag in the mouth behind horns to trigger belching.\n3. **Anti-Froth Drench**: Drench **300–400 ml edible Mustard Oil or Groundnut Oil** mixed with **15 ml Turpentine Oil** slowly via bottle. Or use commercial Bloatosil / Tympanol 100 ml.\n4. Walk the animal slowly for 15–20 minutes — do NOT let it lie on its left side.\n\n**Urgent Vet Call Needed If:**\n• Left flank is taut as a drum, animal unable to breathe — call veterinarian immediately for left paralumbar trocarisation.\n\n**Prevention:**\n• Never feed wet/dewy legume fodder (Berseem, Lucerne) on an empty stomach.\n• Always mix dry straw into green fodder (ratio 40:60 min).`;
  }

  // ─── MASTITIS / UDDER / TEAT ─────────────────────────────────
  if (t(['mastitis', 'udder', 'teat', 'hard udder', 'swollen udder', 'milk flakes', 'cmt', 'थनैला', 'अयन', 'थन', 'दूध में गांठ', 'दूध में पस'])) {
    return `### 🐄 Mastitis Detection & Treatment for ${breedName}:\n\n**Early Detection (CMT Field Test):**\n• Mix equal parts milk + CMT reagent in paddle. Gel formation = subclinical mastitis.\n• Look for: watery serum, clots/flakes in milk, teat hardness, redness, heat.\n\n**Immediate Farmer Actions:**\n• Strip infected milk every 3 hours into disinfectant bucket (never onto floor).\n• Apply **cold compresses / ice packs** to reduce heat and swelling.\n• **Teat Dipping**: After every milking dip all teats in **0.5% Povidone Iodine** solution.\n• Milk healthy animals FIRST, infected animals LAST to prevent cross-contamination.\n\n**Veterinary Treatment:**\n• Intramammary antibiotic infusions: Cloxacillin, Cefoperazone, or Amoxicillin.\n• Anti-inflammatory injection: Meloxicam or Flunixin Meglumine.\n• If unresponsive to antibiotics after 72 hrs → culture & sensitivity test.`;
  }

  // ─── TICK / PARASITE / LICE / MITE ──────────────────────────
  if (t(['tick', 'mite', 'lice', 'parasite', 'worm', 'fleas', 'external parasite', 'चिचड़ी', 'किलनी', 'पिसू', 'कीड़ा', 'परजीवी'])) {
    return `### 🪲 Tick & External Parasite Control:\n\n**On-Animal Treatment:**\n• Spray **Amitraz 12.5% (2 ml per litre of water)** thoroughly on animal body, paying attention to ear folds, groin, and tail base.\n• Alternatively apply **Flumethrin 1% pour-on** along backline from poll to tail-head.\n• *Do not apply Amitraz* on animals with open wounds; prevent licking for 2 hours.\n\n**Shed Disinfection (Most Important!):**\n• 90% of ticks live in shed wall cracks, NOT on the animal.\n• Spray walls, pillars, and floor cracks with **Deltamethrin (1.5 ml/L)** or use a blowtorch on brick/stone masonry.\n\n**Herbal/Organic Option:**\n• Spray **5% Neem Seed Kernel Extract (NSKE)** + 5 ml liquid soap twice weekly.\n\n**Internal Worm Treatment:**\n• Deworm all adults with **Ivermectin injection (0.2 mg/kg body weight)** every 6 months.`;
  }

  // ─── FMD / FOOT AND MOUTH ────────────────────────────────────
  if (t(['fmd', 'foot and mouth', 'foot mouth', 'mouth blister', 'खुरपका', 'मुंहपका', 'foot disease'])) {
    return `### ⚠️ FMD (Foot & Mouth Disease) — Highly Contagious:\n\n**Symptoms:** Blisters/erosions on mouth, tongue, feet, teats; excessive salivation (drooling); limping; high fever 104–106°F; sudden drop in milk yield.\n\n**Immediate Actions:**\n1. **Isolate** infected animal immediately — FMD spreads through air, saliva, and shed floor.\n2. **Mouth Wash**: Rinse oral blisters with **1% Potassium Permanganate (KMnO₄)** solution twice daily.\n3. **Foot Care**: Wash feet with **2% Copper Sulphate** solution and apply antiseptic spray.\n4. **Soft Feed**: Provide soft green fodder, soaked concentrate, and clean water.\n5. **Notify**: FMD is a notifiable disease — report to the nearest government veterinary hospital.\n\n**Vaccination (Best Prevention):**\n• Vaccinate TWICE yearly: **May** (pre-monsoon) and **November** (winter) — all cattle & buffaloes above 4 months.`;
  }

  // ─── VACCINATION / IMMUNIZATION SCHEDULE ────────────────────
  if (t(['vaccin', 'vaccination', 'immuniz', 'injection', 'टीका', 'इंजेक्शन', 'schedule', 'annual vaccine', 'shot'])) {
    return `### 💉 National Livestock Vaccination Calendar for ${breedName}:\n\n1. **FMD (Foot & Mouth Disease)**: **Twice yearly — May & November** | All cattle & buffaloes above 4 months.\n2. **HS (Haemorrhagic Septicaemia)**: **Annually in May** (before monsoon) | Critical for buffaloes (high mortality).\n3. **BQ (Black Quarter)**: **Annually in April/May** | Young stock 6 months – 2 years.\n4. **LSD (Lumpy Skin Disease)**: **Annually / during regional outbreaks (Sep–Oct)** | All cattle.\n5. **Brucellosis**: **Once in lifetime** | Female heifer calves between **4–8 months** only.\n6. **Theileriosis (Tick Fever)**: **Once at 3–6 months** | Available in high-tick-burden zones via AH Dept.\n\n**General Vaccination Tips:**\n• Always vaccinate healthy animals. Never vaccinate sick or stressed animals.\n• Maintain cold chain: Store vaccines at 2–8°C. Use immediately after opening.\n• Record vaccination dates and batch numbers in the INAPH livestock register.`;
  }

  // ─── MILK FEVER / HYPOCALCEMIA ───────────────────────────────
  if (t(['milk fever', 'hypocalcemia', 'calcium', 'fallen cow', 'downer cow', 'post calving', 'after calving', 'दूध बुखार', 'कैल्शियम'])) {
    return `### 💊 Milk Fever (Hypocalcemia) — Post-Calving Emergency in ${breedName}:\n\n**What it is:** Sudden drop in blood calcium right after calving. The udder demands huge calcium for milk production, depleting blood levels.\n\n**Symptoms:** Unable to stand (downer cow), cold ears, muscle tremors, neck twisted to flank (S-curve), loss of consciousness if untreated.\n\n**Emergency Treatment (Call Vet immediately):**\n• IV infusion of **Calcium Borogluconate 25% — 400 ml slowly over 15 minutes** (subcutaneous or IV).\n• Give 2nd dose subcutaneously after 12 hours.\n\n**Prevention:**\n• Avoid high calcium feed in last 2 weeks before calving — DCAD (Dietary Cation-Anion Difference) management.\n• Feed **anionic salts** (Ammonium Chloride, Magnesium Sulfate) 2–3 weeks before expected calving.\n• Always provide **calcified mineral mixture** from mid-lactation onwards.`;
  }

  // ─── LUMPY SKIN DISEASE / LSD ───────────────────────────────
  if (t(['lumpy', 'lsd', 'lumpy skin', 'skin nodules', 'skin bumps', 'गांठदार', 'चर्म रोग', 'त्वचा'])) {
    return `### ⚠️ Lumpy Skin Disease (LSD) — Current India Outbreak:\n\n**Symptoms:** Hard circular skin nodules 1–5 cm all over body (especially head, neck, legs, udder); fever 104–106°F; nasal discharge; limping; reduced milk; swollen lymph nodes.\n\n**Spread:** Via biting insects (flies, mosquitoes, ticks). Highly contagious.\n\n**Actions:**\n1. Isolate infected animals immediately.\n2. Control insect vectors: Spray pyrethroid insecticide around shed.\n3. Wound care: Apply **Povidone Iodine** ointment on open nodules.\n4. Supportive treatment: Anti-inflammatory (Meloxicam), Vitamin B12 injections.\n5. **Vaccination**: GoatPox vaccine (cross-protective) — contact your District AH Department.\n\n**Important**: LSD is a notifiable disease in India. Report outbreaks to your block veterinary hospital.`;
  }

  // ─── GOVERNMENT SCHEMES / PKCC / LOAN / SUBSIDY ─────────────
  if (t(['loan', 'scheme', 'pkcc', 'kcc', 'subsidy', 'credit card', 'government', 'nabard', 'gokul', 'insurance claim', 'finance', 'bank', 'interest', 'ऋण', 'सब्सिडी', 'योजना', 'लोन', 'केसीसी', 'पशु क्रेडिट'])) {
    return `### 💰 Government Financial Schemes for Dairy Farmers:\n\n**1. Pashu Kisan Credit Card (PKCC) — Most Popular:**\n• Collateral-free loan up to **₹1,60,000** for purchasing milch animals.\n• Interest rate: Effectively **4% per annum** (7% minus 3% prompt repayment subvention).\n• Per animal limit: ₹44,000 (cow) | ₹61,000 (buffalo).\n• Apply at any Public Sector Bank or Primary Agriculture Cooperative.\n\n**2. Rashtriya Gokul Mission (RGM):**\n• **50% capital subsidy** (max ₹2 Crore) for indigenous breed multiplication farms (Gir, Sahiwal, Murrah).\n• Free sex-sorted frozen semen doses + free doorstep AI services.\n• Apply at State Animal Husbandry & Dairying Department.\n\n**3. NABARD DEDS / AHIDF:**\n• **25% subsidy** (33.33% for SC/ST) for 2–10 animal dairy unit infrastructure.\n• Covers modern sheds, milking machines, bulk milk coolers, chaff cutters.\n\n**4. National Livestock Mission:**\n• Entrepreneurship grants for fodder production, silage, and goat/sheep rearing.`;
  }

  // ─── INSURANCE ───────────────────────────────────────────────
  if (t(['insurance', 'claim', 'policy', 'premium', 'nlis', 'animal death', 'compensation', 'बीमा', 'क्लेम', 'मृत्यु', 'पशु बीमा'])) {
    return `### 🛡️ Livestock Insurance — How to Claim & Apply:\n\n**Key Insurance Schemes:**\n• **National Livestock Insurance Scheme (New India Assurance)**: Covers accidental death, epidemic diseases (FMD, HS, Anthrax). Premium ~2.5% p.a. (50% subsidized by Govt).\n• **Pradhan Mantri Pashu Bima (National Insurance)**: Higher coverage up to ₹1,10,000. 70% subsidy for BPL/SC/ST farmers. Helpline: 1800-345-0330.\n\n**Claim Process (in case of animal death):**\n1. **Notify insurer within 24 hours** of animal death.\n2. Get **Post-Mortem Certificate** from a registered government veterinarian.\n3. Submit: PM certificate + original insurance policy + ear-tag / INAPH ID proof + bank passbook.\n4. Claims processed within **14 working days**.\n\n**Mandatory for Insurance:**\n• Animal must have a 12-digit INAPH ear-tag for identification.`;
  }

  // ─── MANDI RATES / MILK PRICE ────────────────────────────────
  if (t(['price', 'rate', 'mandi', 'market rate', 'milk rate', 'sell milk', 'milk cost', 'buffalo milk price', 'cow milk price', 'भाव', 'दाम', 'बाजार भाव', 'दूध का रेट'])) {
    return `### 📊 Milk Market Rates & Cooperative Pricing (2026):\n\n**Fat+SNF Two-Axis Formula (Used by Amul, Mother Dairy, Nandini):**\n> Milk Price = (Fat% × Fat Rate per unit) + (SNF% × SNF Rate per unit)\n\n**Current Benchmark Rates:**\n• **Murrah Buffalo Milk (7.0% Fat, 9.0% SNF)**: ₹62–₹70 per litre\n• **Gir / Sahiwal A2 Cow Milk (4.5% Fat, 8.5% SNF)**: ₹65–₹85 per litre (premium market)\n• **Crossbred HF Cow Milk (3.5% Fat, 8.5% SNF)**: ₹38–₹44 per litre\n\n**Animal Mandi Valuation:**\n• Peak-yield Murrah Buffalo (14L/day, 2nd lactation): ₹85,000–₹1,25,000\n• High-pedigree Gir Cow (12L/day): ₹70,000–₹1,10,000\n• Pregnant Sahiwal Heifer: ₹55,000–₹80,000\n\n**Tip:** Join the nearest state dairy cooperative (e.g. Amul in Gujarat, Vijaya in Telangana) for guaranteed daily collection at fair fat-tested prices.`;
  }

  // ─── SUMMER / HEAT STRESS ────────────────────────────────────
  if (t(['summer', 'heat stress', 'hot weather', 'temperature', 'cooling', 'shade', 'गर्मी', 'धूप', 'गर्म मौसम', 'पानी'])) {
    return `### ☀️ Summer Heat Stress Management for ${breedName}:\n\n• **Shed Cooling**: Paint tin roof white with lime (reflects 70% solar radiation). Install ceiling fans or foggers.\n• **Wallowing for Buffaloes**: Murrah buffaloes have only 1/6th the sweat glands of cattle. Provide wallowing or **sprinkler misting for 30 mins at 11 AM and 3 PM**.\n• **Night Feeding**: Shift 60% of daily feed to cooler evening/night hours (6 PM – 6 AM) to reduce metabolic heat load.\n• **Fresh Water 24/7**: Ensure clean water access always — consumption rises to 100+ litres in peak summer.\n• **Electrolytes**: Add **50g Potassium Chloride + 20g Sodium Bicarbonate** to drinking water once daily to counter respiratory alkalosis from panting.\n• **Avoid Black Polythene Roof Covers** — they raise internal shed temperature by 8–12°C.`;
  }

  // ─── BREED INFO ───────────────────────────────────────────────
  if (t(['breed', 'gir', 'sahiwal', 'murrah', 'jaffarabadi', 'tharparkar', 'kankrej', 'mehsana', 'nili ravi', 'surti', 'hf', 'holstein', 'about breed', 'breed profile', 'नस्ल', 'जानकारी'])) {
    return `### 🐂 Breed Profile: ${breedName}:\n\n• **Classification**: Indigenous Indian Dairy Breed (Bos indicus / Bubalus bubalis)\n• **Native Tract**: Northern and Western India — prized for superior milk solid content, disease resilience, and tropical heat tolerance.\n• **Average Daily Milk Yield**: 12–20 litres per day under balanced stall-fed management.\n• **Lactation Length**: 290–320 days per lactation cycle.\n• **Butterfat Content**: 4.5–8.5% (highest in Murrah and Jaffarabadi buffaloes).\n• **Distinctive Features**: Strong hoof structure, high tolerance to tick infestations, gentle temperament, excellent longevity (12–16 years productive life).\n• **Recommended Housing**: Loose housing system with central manger, concrete floor with 1:40 drainage slope, and east-facing orientation.`;
  }

  // ─── THEILERIOSIS / TICK FEVER / BLOOD PARASITE ─────────────
  if (t(['theileria', 'tick fever', 'blood parasite', 'anaplasmosis', 'babesia', 'blood in urine', 'red urine', 'थीलेरिया', 'टिक बुखार', 'लाल पेशाब'])) {
    return `### 🩸 Theileriosis (Tropical Tick Fever) — Serious Blood Parasite:\n\n**Symptoms:** High fever (104–107°F), loss of appetite, enlarged lymph nodes (especially in front legs), pale/yellowish eye membranes, red/dark urine, progressive weakness, sudden death if untreated.\n\n**Treatment (Veterinary):**\n• **Buparvaquone (Butalex) injection**: Single dose 2.5 mg/kg body weight — gold standard treatment.\n• Supportive: IV fluids (Normal Saline), Vitamin B12, Haematinic (iron-folic acid) injections.\n• Tick control simultaneously: Amitraz spray on animal and full shed disinfection.\n\n**Prevention:**\n• Maintain rigorous tick control program — spray every 3 weeks.\n• Theileria vaccine available in some states via AH Department — ask your local vet.`;
  }

  // ─── FOOT ROT / LAMENESS ────────────────────────────────────
  if (t(['foot rot', 'lameness', 'limping', 'sore foot', 'swollen foot', 'hoof', 'खुर', 'लंगड़ाना', 'पांव सूजन'])) {
    return `### 🦶 Foot Rot & Lameness Management in ${breedName}:\n\n**Causes:** Bacterial infection (Fusobacterium necrophorum) in cracked hooves; worsened by wet, muddy conditions.\n\n**Symptoms:** Sudden lameness, swelling between toes, foul smell from foot, fever.\n\n**Treatment:**\n1. Thoroughly clean and trim hoof to remove all dead/infected tissue.\n2. Apply **Copper Sulphate 5% or Oxytetracycline spray** on affected foot.\n3. Wrap foot with clean bandage after applying antiseptic.\n4. Systemic antibiotics: Oxytetracycline LA injection (20 mg/kg body weight) by vet.\n\n**Prevention:**\n• Footbath with **5% Copper Sulphate or 10% Formalin** weekly for all animals entering milking area.\n• Trim hooves every 3–4 months to prevent overgrowth.\n• Ensure dry, clean, cement-free (rubber-mat) flooring in milking area.`;
  }

  // ─── DEFAULT ─────────────────────────────────────────────────
  return `### 🐄 BREEDIFY Advisory for ${breedName}:\n\nThank you for your question on **"${rawText}"**.\n\nHere are general best practices that apply:\n• **Nutrition**: Maintain 60:40 green-to-dry fodder ratio. Provide 50g chelated mineral mixture daily.\n• **Health Check**: Normal temperature is **101.5°F–102.5°F**. Healthy rumination is 40–50 chews per cud.\n• **Vaccination**: Ensure bi-annual FMD vaccination (May & November) and annual HS vaccination.\n• **Water**: Provide clean, fresh water ad libitum — at least 70–90 litres daily.\n\nFor specific answers, you can ask me about:\n🥛 Milk yield | 🌿 Feed ration | 🩺 Mastitis/Bloat/FMD | 🐄 AI timing | 💰 PKCC loans | 💉 Vaccine schedule`;
}

export default function Assistant() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const breedName = location.state?.breedName || 'Murrah Buffalo';

  const speechLangMap = {
    hi: 'hi-IN',
    te: 'te-IN',
    gu: 'gu-IN',
    ta: 'ta-IN',
    kn: 'kn-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    pa: 'pa-IN',
    en: 'en-IN'
  };
  const activeVoiceLang = speechLangMap[i18n.language] || 'en-IN';

  const getGreeting = (lang) => {
    switch (lang) {
      case 'hi':
        return `नमस्ते किसान बंधु! 🙏 मैं आपका **BREEDIFY AI एजेंट** हूँ, जो आपकी **${breedName}** के लिए संपूर्ण कृषि और पशु चिकित्सा जानकारी से लैस है।\n\nआप मुझसे बेझिझक पूछ सकते हैं:\n• 🥛 **दूध उत्पादन और फैट बढ़ाने के उपाय**\n• 🌿 **संतुलित हरा-सूखा चारा और साइलेज राशन**\n• 🩺 **पशु रोग प्राथमिक उपचार और टीकाकरण**\n• 🐄 **गर्मी (हीट) पहचान और गर्भाधान समय**\n• 💰 **पशु केसीसी ऋण और 50% गोकुल सब्सिडी**\n\nनीचे दिए गए सुझावों पर टैप करें या अपना प्रश्न पूछें!`;
      case 'te':
        return `నమస్కారం రైతు సోదరా! 🙏 నేను మీ **BREEDIFY AI ఏజెంట్**, మీ **${breedName}** పశువుకు సంబంధించిన సంపూర్ణ పశువైద్య మరియు పాడి సమాచారంతో సిద్ధంగా ఉన్నాను.\n\nమీరు నన్ను వీటి గురించి అడగవచ్చు:\n• 🥛 **పాల దిగుబడి & వెన్న శాతం పెంపుదల**\n• 🌿 **శాస్త్రీయ పచ్చిమేత, సైలేజ్ & దాణా నిష్పత్తి**\n• 🩺 **పశు వ్యాధుల ప్రథమ చికిత్స & టీకాలు**\n• 🐄 **ఎద గుర్తింపు & గర్భధారణ సమయం**\n• 💰 **పశు కిసాన్ క్రెడిట్ కార్డు (PKCC) & రాయితీలు**\n\nక్రింద ఉన్న ప్రశ్నలలో ఒకదాన్ని ఎంచుకోండి లేదా నేరుగా అడగండి!`;
      case 'gu':
        return `નમસ્તે ખેડૂત મિત્ર! 🙏 હું તમારો **BREEDIFY AI એજન્ટ** છું, જે તમારી **${breedName}** માટે પશુચિકિત્સા અને ડેરી વ્યવસ્થાપન માર્ગદર્શનથી સજ્જ છે.\n\nતમે મને આ વિષયો પર પૂછી શકો છો:\n• 🥛 **દૂધ ઉત્પાદન અને ફેટ વધારવાના ઉપાયો**\n• 🌿 **વૈજ્ઞાનિક લીલો-સૂકો ઘાસચારો અને સાયલેજ**\n• 🩺 **પશુ રોગ પ્રાથમિક સારવાર અને રસીકરણ**\n• 🐄 **ગરમી (વેતર) ઓળખ અને બીજદાનનો સમય**\n• 💰 **પશુ કિસાન ક્રેડિટ કાર્ડ અને ગોકુળ મિશન સબસિડી**\n\nનીચેના સૂચનો પર ક્લિક કરો અથવા તમારો પ્રશ્ન પૂછો!`;
      default:
        return `Namaste Kisan Bandhu! 🙏 I am your **BREEDIFY AI Agent**, equipped with full agricultural and veterinary context for your **${breedName}**.\n\nYou can ask me in your preferred language about:\n• 🥛 **Milk yield & butterfat enhancement**\n• 🌿 **Scientific fodder & silage rations**\n• 🩺 **Veterinary disease first-aid & vaccines**\n• 🐄 **Heat detection & AI timing**\n• 💰 **Pashu KCC loans & 50% Gokul subsidies**\n\nTap any suggested prompt below or type/speak your question!`;
    }
  };

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: getGreeting(i18n.language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Update greeting when language changes if only default message exists
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 1) {
        return [{
          id: 1,
          sender: 'bot',
          text: getGreeting(i18n.language),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [i18n.language]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeCategory, setActiveCategory] = useState('milk');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (msgText) => {
    const text = msgText || input;
    if (!text.trim() || isThinking) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', text: text.trim(), timestamp: timeStr };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    let replyText = '';
    const userApiKey = localStorage.getItem('bovine_gemini_key') || localStorage.getItem('gemini_api_key') || '';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': userApiKey
        },
        body: JSON.stringify({
          message: text.trim(),
          breed_name: breedName,
          api_key: userApiKey
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        replyText = data?.reply;
      }
    } catch (err) {
      console.warn('Backend chat copilot unreachable, using local intelligence engine:', err);
    }

    if (!replyText) {
      replyText = getIntelligentReply(text, breedName);
    }

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, botMsg]);
    setIsThinking(false);
  };

  const handleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/###|\*\*|\*|•|#|`|_/g, '')
      .replace(/\$\$.*?\$\$/g, 'price formula based on fat and SNF')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.lang = activeVoiceLang;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recog = new SpeechRecognition();
      recog.lang = activeVoiceLang;
      recog.interimResults = false;
      recog.maxAlternatives = 1;
      recognitionRef.current = recog;

      recog.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      recog.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: `Chat reset! How can I assist you with your **${breedName}** today? Ask about milk yield, feed, health, or subsidies.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10 text-[#2A2A28]">

      {/* Header Banner */}
      <div className="bg-[#F4EDE0] p-5 sm:p-6 rounded-3xl border border-[#DFD3BF] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D96B43] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-editorial font-bold text-[#2A2A28]">
                BREEDIFY AI Agent
              </h1>
              <p className="text-xs text-[#7A7A70]">
                Veterinary & Agronomy Intelligence Agent for: <strong className="text-[#324E38]">{breedName}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={clearChat}
            className="text-xs font-bold px-3.5 py-2 rounded-xl border border-[#DFD3BF] bg-[#F4EDE0] hover:bg-[#F7F3EA] text-[#7A7A70] hover:text-[#2A2A28] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>AI Online</span>
          </div>
        </div>
      </div>

      {/* Category Suggestion Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'milk', label: '🥛 Milk & Feeding', icon: Droplets },
          { id: 'health', label: '🩺 Disease & First-Aid', icon: HeartPulse },
          { id: 'breeding', label: '🐄 Heat & AI Timing', icon: Sparkles },
          { id: 'finance', label: '💰 Loans & Subsidies', icon: ShieldCheck },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? 'bg-[#324E38] text-white shadow-sm'
                : 'bg-[#FFFDF8] border border-[#DFD3BF] text-[#7A7A70] hover:text-[#2A2A28] hover:bg-[#FAF5EB]'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Prompts Carousel based on active category */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORY_PROMPTS[activeCategory]?.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="bg-[#FFFDF8] hover:bg-[#F5EBE1] border border-[#DFD3BF] hover:border-[#D96B43] text-[#2A2A28] px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>{prompt}</span>
            <ChevronRight className="w-3 h-3 text-[#D96B43]" />
          </button>
        ))}
      </div>

      {/* CHAT MESSAGES WINDOW */}
      <div className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] shadow-soft p-4 sm:p-6 min-h-[460px] max-h-[600px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div className="w-8 h-8 rounded-full bg-[#324E38] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 space-y-2 text-xs sm:text-sm leading-relaxed ${
                  isBot
                    ? 'bg-[#F4EDE0] text-[#2A2A28] border border-[#DFD3BF] shadow-xs'
                    : 'bg-[#324E38] text-white shadow-sm'
                }`}
              >
                {/* Formatted Content */}
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return <h4 key={lIdx} className="font-editorial font-bold text-base text-[#D96B43] mt-2 mb-1">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('• ')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                          <span className="text-[#D96B43] font-bold">•</span>
                          <span>{line.replace('• ', '')}</span>
                        </div>
                      );
                    }
                    if (/^\d+\.\s/.test(line)) {
                      return (
                        <div key={lIdx} className="flex items-start gap-2 my-1 pl-1">
                          <span className="font-bold text-[#324E38]">{line.match(/^\d+\./)[0]}</span>
                          <span>{line.replace(/^\d+\.\s/, '')}</span>
                        </div>
                      );
                    }
                    return <p key={lIdx} className={line.trim() === '' ? 'h-2' : ''}>{line}</p>;
                  })}
                </div>

                {/* Footer Bar with Time and TTS Speak Button */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>

                  {isBot && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.text)}
                        title="Listen to this response"
                        className={`p-1 rounded-lg transition-colors flex items-center gap-1 ${
                          isSpeaking
                            ? 'bg-[#D96B43] text-white'
                            : 'hover:bg-[#EDE7DA] text-[#7A7A70]'
                        }`}
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-full bg-[#D96B43] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isThinking && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-[#324E38] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#F4EDE0] border border-[#DFD3BF] rounded-2xl p-4 flex items-center gap-2 text-xs text-[#7A7A70]">
              <Loader2 className="w-4 h-4 animate-spin text-[#D96B43]" />
              <span>Analyzing dairy agronomy & veterinary guidelines...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div className="bg-[#F4EDE0] rounded-3xl p-2.5 sm:p-3 border border-[#DFD3BF] shadow-soft flex items-center gap-2">
        
        {/* Voice Input Mic Toggle */}
        <button
          onClick={toggleMic}
          title={isListening ? 'Listening... click to stop' : 'Click to speak'}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-md'
              : 'bg-[#F4EDE0] text-[#7A7A70] hover:text-[#2A2A28] border border-[#DFD3BF] hover:bg-[#F7F3EA]'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? t('copilot.listeningPlaceholder', 'Listening in your language...') : t('copilot.askPlaceholder', `Ask BREEDIFY AI Agent anything about ${breedName} feed, vaccines, loans...`)}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-[#2A2A28] placeholder-[#A0A090] focus:outline-none"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isThinking}
          className="w-10 h-10 rounded-2xl bg-[#D96B43] hover:bg-[#C25832] disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
}
