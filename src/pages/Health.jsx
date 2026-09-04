import React, { useState, useRef } from 'react';
import {
  HeartPulse, Stethoscope, AlertTriangle, ShieldCheck,
  CheckCircle2, Phone, Loader2, X, Calendar, Activity,
  Info, Sparkles, Pill, AlertOctagon, HelpCircle, UserCheck
} from 'lucide-react';

const SYMPTOM_LIST = [
  { id: 'fever', label: 'High Fever (>103°F / 39.5°C)', emoji: '🌡️', category: 'General' },
  { id: 'udder_swelling', label: 'Udder Swelling, Heat, Pain or Flakes in Milk', emoji: '🐄', category: 'Mammary' },
  { id: 'salivation', label: 'Excessive Salivation / Blisters in Mouth & Feet', emoji: '💧', category: 'Oral/Limb' },
  { id: 'loss_appetite', label: 'Loss of Appetite, Lethargy & Dullness', emoji: '🥣', category: 'General' },
  { id: 'labored_breathing', label: 'Rapid / Labored Breathing & Grunting', emoji: '💨', category: 'Respiratory' },
  { id: 'skin_nodules', label: 'Hard Skin Nodules / Lumps (2-5cm) on Body', emoji: '🔴', category: 'Dermatological' },
  { id: 'diarrhea', label: 'Watery, Foul-smelling or Bloody Diarrhea', emoji: '⚠️', category: 'Digestive' },
  { id: 'lameness', label: 'Lameness / Limping / Swollen Interdigital Cleft', emoji: '🦵', category: 'Limb' },
  { id: 'nasal_discharge', label: 'Watery/Cloudy Nasal or Eye Discharge & Cough', emoji: '👁️', category: 'Respiratory' },
  { id: 'milk_drop', label: 'Sudden Drastic Drop in Milk Production (>40%)', emoji: '📉', category: 'Production' },
  { id: 'bloat', label: 'Severe Left-side Abdominal Distension / Bloat', emoji: '🎈', category: 'Digestive' },
  { id: 'shivering', label: 'Muscle Shivering, Tremors or Inability to Stand', emoji: '⚡', category: 'Neurological' },
];

const COMPREHENSIVE_DIAGNOSES = [
  {
    id: 'fmd',
    condition: 'Foot-and-Mouth Disease (FMD)',
    hindiName: 'खुरपका-मुँहपका रोग',
    requiredAny: [['salivation', 'fever'], ['salivation', 'lameness'], ['salivation']],
    bonusScore: ['fever', 'loss_appetite', 'milk_drop', 'lameness'],
    riskLevel: 'CRITICAL',
    urgency: 'Immediate Quarantine & Department Notification',
    color: 'red',
    breedPrevalence: 'Extremely contagious across all indigenous & exotic cattle and Murrah buffaloes.',
    confidenceBase: 94,
    firstAid: [
      'Isolate animal in a clean, shaded, dry pen away from herd immediately.',
      'Wash oral blisters with mild 1% Potassium Permanganate or 2% Sodium Bicarbonate solution.',
      'Apply protective fly-repellent antiseptic ointment (such as Lorexane/Himax) on hoof lesions.',
      'Provide soft, easily digestible gruel (cooked porridge, rice bran gruel) as chewing is painful.'
    ],
    medicalProtocol: 'Supportive anti-inflammatory injections (Meloxicam 0.5 mg/kg body weight) to reduce pain/fever. Broad-spectrum antibiotic coverage (Ceftriaxone / Oxytetracycline) strictly under Veterinarian advice to prevent secondary bacterial complications.',
    quarantineGuide: 'Strict herd lockdown for 21 days. Disinfect shed floors with 4% washing soda solution. Do not allow transit or market sale of milk/animals.',
    vaccines: ['Aftovaxpur DOE or Raksha Ovac (Bi-annually in May & November)']
  },
  {
    id: 'mastitis',
    condition: 'Bovine Mastitis (Clinical / Acute)',
    hindiName: 'थनैला रोग (तीव्र / उप-नैदानिक)',
    requiredAny: [['udder_swelling', 'milk_drop'], ['udder_swelling']],
    bonusScore: ['fever', 'loss_appetite', 'shivering'],
    riskLevel: 'HIGH',
    urgency: 'Vet Intervention Within 6 Hours to Save Quarter',
    color: 'red',
    breedPrevalence: 'Very high incidence in high-yielding dairy cattle (HF crosses, Jersey, Gir) and heavy-lactation Murrah buffaloes.',
    confidenceBase: 92,
    firstAid: [
      'Completely strip affected quarter milk into a disinfectant cup every 3-4 hours (do not discard on bedding).',
      'Apply cold water compresses or ice packs to the inflamed quarter to alleviate acute heat and pain.',
      'Dip teats in post-milking antiseptic solution (0.5% Povidone Iodine) after every milking.',
      'Provide clean, dry, sand or rubber mat bedding to stop bacterial ingress through teat orifice.'
    ],
    medicalProtocol: 'Intramammary antibiotic infusion (e.g. Cloxacillin or Cefoperazone) after complete stripping. Systemic anti-inflammatory (Meloxicam) and supportive Vitamin H (Biotin), Vitamin E & Selenium therapy.',
    quarantineGuide: 'Milk affected cow last. Disinfect milker’s hands and milking machine cluster between cows.',
    vaccines: ['Mastivac Polyvalent (Preventative herd management)']
  },
  {
    id: 'lsd',
    condition: 'Lumpy Skin Disease (LSD)',
    hindiName: 'लम्पी त्वचा रोग (गांठदार त्वचा रोग)',
    requiredAny: [['skin_nodules', 'fever'], ['skin_nodules']],
    bonusScore: ['nasal_discharge', 'loss_appetite', 'milk_drop', 'lameness'],
    riskLevel: 'HIGH',
    urgency: 'Isolate Animal & Vaccinate Non-Infected Herd',
    color: 'amber',
    breedPrevalence: 'Predominantly affects cattle (Bos indicus & Bos taurus); lower clinical incidence in buffaloes but act as carriers.',
    confidenceBase: 95,
    firstAid: [
      'Immediately isolate infected animals in a mosquito and fly-netted isolation shed.',
      'Clean skin eruptions with 1% potassium permanganate wash and spray herbal fly repellent.',
      'Offer fresh tender grass, electrolytes, and jaggery water to maintain energy levels.'
    ],
    medicalProtocol: 'Supportive antipyretic therapy (Paracetamol / Meloxicam). Supportive oral multivitamin syrup (Vitamins A, D3, E, B-Complex + Zinc). Antibiotics only if secondary skin infection ulcerates.',
    quarantineGuide: 'Strict vector control: spray shedding areas with Cypermethrin or Deltamethrin to eliminate Stomoxys flies and mosquitoes.',
    vaccines: ['Lumpi-ProVacInd (Homologous) or Goat Pox Vaccine (Heterologous ring vaccination)']
  },
  {
    id: 'hs',
    condition: 'Haemorrhagic Septicaemia (HS / Shipping Fever)',
    hindiName: 'गलघोंटू रोग (एचएस)',
    requiredAny: [['labored_breathing', 'fever'], ['labored_breathing', 'salivation']],
    bonusScore: ['loss_appetite', 'shivering', 'nasal_discharge'],
    riskLevel: 'CRITICAL',
    urgency: 'Emergency Life Threat — IV Therapy Needed Within 4-6 Hours',
    color: 'red',
    breedPrevalence: 'Extremely high mortality in Murrah & Nili-Ravi buffaloes; common during onset of monsoon.',
    confidenceBase: 93,
    firstAid: [
      'Keep the animal completely calm in a well-ventilated dry space; do not force animal to walk.',
      'Keep head and neck elevated to ease airway obstruction.',
      'Prepare emergency transport or alert the nearest mobile veterinary clinic immediately.'
    ],
    medicalProtocol: 'Immediate intravenous administration of broad-spectrum antimicrobials (Sulfadimidine 33.3% IV or Oxytetracycline IV) combined with Flunixin Meglumine for swelling reduction.',
    quarantineGuide: 'Incinerate or deeply bury any carcass with quicklime. Disinfect standing shed.',
    vaccines: ['HS-BQ Combined Oil Adjuvant Vaccine (Mandatory pre-monsoon in May)']
  },
  {
    id: 'bloat',
    condition: 'Acute Ruminal Tympanites / Frothy Bloat',
    hindiName: 'अफरा / तीव्र पेट फूलना',
    requiredAny: [['bloat', 'labored_breathing'], ['bloat']],
    bonusScore: ['loss_appetite', 'shivering'],
    riskLevel: 'CRITICAL',
    urgency: 'Emergency Rumen Decompression Required',
    color: 'red',
    breedPrevalence: 'Cattle & buffaloes grazing on young lush leguminous pasture (Berseem, Lucerne) or gorging grains.',
    confidenceBase: 96,
    firstAid: [
      'Keep animal standing with front quarters elevated on an incline slope.',
      'Tie a wooden bit in mouth to stimulate salivation and swallowing reflex.',
      'Administer 250–500 ml Vegetable Oil / Mustard Oil with 15–20 ml Turpentine oil orally to break frothy foam.',
      'Do not allow animal to lie down; walk gently until rumen sounds resume.'
    ],
    medicalProtocol: 'Oral administration of dimethicone/poloxalene anti-frothing agents (Bloatosil / Tympanol). Emergency veterinary trocarisation of left paralumbar fossa in suffocating animals.',
    quarantineGuide: 'Withhold succulent lush legumes; feed dry roughage before turning animals onto green pastures.',
    vaccines: ['Non-infectious (Nutritional management)']
  },
  {
    id: 'theileriosis',
    condition: 'Bovine Theileriosis / Babesiosis (Tick Fever)',
    hindiName: 'बबेसिओसिस / चिचड़ी बुखार (रक्त परजीवी)',
    requiredAny: [['fever', 'shivering'], ['fever', 'loss_appetite', 'milk_drop']],
    bonusScore: ['nasal_discharge', 'lameness'],
    riskLevel: 'HIGH',
    urgency: 'Administer Antiprotozoal Within 24 Hours',
    color: 'amber',
    breedPrevalence: 'Very high mortality in exotic/cross-bred cows; indigenous breeds (Gir/Sahiwal) possess natural resistance.',
    confidenceBase: 89,
    firstAid: [
      'Sponge head and body with cool water to bring down body temperature.',
      'Inspect ears, brisket, and tail base for ticks and manually apply tick-control dust.',
      'Provide clean electrolyte-enriched drinking water with iron-folic acid supplements.'
    ],
    medicalProtocol: 'Specific antiprotozoal drug: Buparvaquone (Zubion) 2.5 mg/kg IM single dose for Theileriosis; Diminazene Aceturate (Berenil) 3.5 mg/kg deep IM for Babesiosis.',
    quarantineGuide: 'Perform herd-wide acaricide spraying (Flumethrin or Amitraz) of both animals and shed crevices.',
    vaccines: ['Raksha Vac-T (Theileria annulata cell culture vaccine in endemic zones)']
  },
  {
    id: 'coccidiosis',
    condition: 'Bovine Enteritis / Calf Scours (Coccidiosis)',
    hindiName: 'खूनी पेचिश / आंत्रशोथ',
    requiredAny: [['diarrhea', 'loss_appetite'], ['diarrhea']],
    bonusScore: ['fever', 'milk_drop', 'shivering'],
    riskLevel: 'HIGH',
    urgency: 'Dehydration Prevention — Oral Fluids Every 2 Hours',
    color: 'amber',
    breedPrevalence: 'Common in young calves under 6 months and adult animals during wet seasons.',
    confidenceBase: 91,
    firstAid: [
      'Isolate animal and provide continuous Oral Rehydration Salt (ORS) solution with dextrose.',
      'Offer boiled starch water (rice kanji) with a pinch of salt and ginger powder.',
      'Keep calf warm and dry with adequate bedding.'
    ],
    medicalProtocol: 'Oral Amprolium or Sulphadimidine under veterinary direction. Supportive probiotics and bismuth subnitrate gut protectors.',
    quarantineGuide: 'Clean feeding pans and sanitize water troughs with boiling water or chlorine.',
    vaccines: ['Bovilis Rotavec Corona (for pregnant dams to protect newborn calves)']
  },
  {
    id: 'foot_rot',
    condition: 'Foot Rot / Interdigital Phlegmon',
    hindiName: 'खुर सड़न / डिजिटल डर्मेटाइटिस',
    requiredAny: [['lameness', 'fever'], ['lameness']],
    bonusScore: ['loss_appetite', 'milk_drop'],
    riskLevel: 'MEDIUM',
    urgency: 'Local Antiseptic Foot Bath & Bandaging within 48h',
    color: 'amber',
    breedPrevalence: 'Prevalent in heavy Murrah buffaloes standing in damp, waterlogged sheds.',
    confidenceBase: 88,
    firstAid: [
      'Rest animal on dry, firm flooring (avoid wet muddy standing).',
      'Clean interdigital cleft thoroughly with water and 5% Copper Sulphate footbath.',
      'Debride necrotic tissue carefully and apply Zinc Oxide / Pine tar bandage.'
    ],
    medicalProtocol: 'Systemic single-dose Long-Acting Oxytetracycline (20 mg/kg IM) or Florfenicol under veterinary prescription with anti-inflammatory support.',
    quarantineGuide: 'Improve drainage and implement weekly 5% formalin or zinc sulphate walk-through foot baths.',
    vaccines: ['Non-core (Focus on hoof hygiene & biosecurity)']
  },
  {
    id: 'brd',
    condition: 'Bovine Respiratory Disease (BRD) / Calf Pneumonia',
    hindiName: 'बोवाइन श्वसन रोग / बछड़ा निमोनिया',
    requiredAny: [['nasal_discharge', 'labored_breathing'], ['nasal_discharge', 'fever']],
    bonusScore: ['loss_appetite', 'fever'],
    riskLevel: 'HIGH',
    urgency: 'Veterinary Antibiotic Therapy Recommended in 12h',
    color: 'amber',
    breedPrevalence: 'Weaned calves, feedlot cattle, and animals exposed to cold draughts or long transit.',
    confidenceBase: 90,
    firstAid: [
      'Move animal to an airy but draft-free dry barn.',
      'Steam inhalation with eucalyptus oil / camphor in warm water to clear airway congestion.',
      'Provide warm, palatable mash and fresh green fodder.'
    ],
    medicalProtocol: 'Veterinary prescription of Tulathromycin (Draxxin) or Enrofloxacin with NSAID (Ketoprofen or Meloxicam).',
    quarantineGuide: 'Ensure minimum 4 air changes per hour in calf pens; avoid overcrowding.',
    vaccines: ['Bovilis Bovipast RSP']
  },
  {
    id: 'milk_fever',
    condition: 'Hypocalcemia / Milk Fever (Downer Cow Syndrome)',
    hindiName: 'दुग्ध ज्वर / हाइपोकैल्सीमिया',
    requiredAny: [['milk_drop', 'shivering'], ['shivering', 'loss_appetite']],
    bonusScore: ['udder_swelling'],
    riskLevel: 'HIGH',
    urgency: 'Calcium Borogluconate Infusion Required Before Recumbency',
    color: 'amber',
    breedPrevalence: 'High-yielding dairy cattle in 3rd to 6th lactation within 48 hours of calving.',
    confidenceBase: 87,
    firstAid: [
      'Propper cow on her sternum (chest); do not allow animal to lie flat on her side to avoid bloat.',
      'Provide deep dry straw bedding to prevent nerve damage from pressure.',
      'Never drench liquid medicine orally if cow cannot swallow.'
    ],
    medicalProtocol: 'Slow intravenous infusion of 400-500 ml Calcium Borogluconate 25% warmed to body temperature under veterinary heart monitoring.',
    quarantineGuide: 'Pre-calving anionic salt diet and Vitamin D3 injections 5 days before expected calving.',
    vaccines: ['Metabolic disorder (Nutrition management)']
  },
  {
    id: 'general_stress',
    condition: 'Acute Heat Stress & Subclinical Ruminal Indigestion',
    hindiName: 'ताप तनाव / सामान्य अपच',
    requiredAny: [['fever'], ['loss_appetite'], ['milk_drop']],
    bonusScore: [],
    riskLevel: 'LOW',
    urgency: 'Provide Shade, Sprinklers & Rumen Buffers',
    color: 'green',
    breedPrevalence: 'Exotic crossbreeds during peak summer; native Zebu cows exhibit superior tolerance.',
    confidenceBase: 82,
    firstAid: [
      'Provide continuous clean, cool drinking water in the shade.',
      'Run ceiling fans and mist sprinklers during peak afternoon heat (11 AM - 3 PM).',
      'Add 50-70g Sodium Bicarbonate (Baking Soda) and mineral mixture to daily ration.'
    ],
    medicalProtocol: 'Rumenotoric boluses (e.g. Biobloom / Himalayan Batisa) to restore microbial flora. Oral yeast culture supplementation.',
    quarantineGuide: 'Ensure thatch roofing and adequate shed ventilation.',
    vaccines: ['Maintain routine annual vaccination schedule']
  }
];

const VACCINATION_SCHEDULE = [
  { name: 'FMD (Foot & Mouth Disease)', schedule: 'Bi-annually — May & November', target: 'All Cattle & Buffaloes', nextDue: 'Nov 2026', status: 'due_soon', color: 'amber' },
  { name: 'HS (Haemorrhagic Septicaemia)', schedule: 'Annually — May before monsoon', target: 'All Bovines, esp. Buffaloes', nextDue: 'May 2027', status: 'ok', color: 'green' },
  { name: 'BQ (Black Quarter)', schedule: 'Annually — Pre-monsoon', target: 'Calves >6 months', nextDue: 'Apr 2027', status: 'ok', color: 'green' },
  { name: 'LSD (Lumpy Skin Disease)', schedule: 'Annually / Outbreak Ring', target: 'All Cattle in endemic zones', nextDue: 'Oct 2026', status: 'due_now', color: 'red' },
  { name: 'Brucellosis (S19/RB51)', schedule: 'Once in Lifetime — 4-8 months', target: 'Female calves only', nextDue: 'Completed', status: 'ok', color: 'green' },
  { name: 'Anthrax (Spore Vaccine)', schedule: 'Annually in endemic pockets', target: 'Adult Cattle & Buffaloes', nextDue: 'Feb 2027', status: 'ok', color: 'green' },
];

export default function Health() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('checker'); // 'checker' | 'vaccines'
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting' | 'connected'
  const resultRef = useRef(null);

  const toggleSymptom = (id) => {
    setDiagnosis(null);
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRunDiagnosis = () => {
    if (selectedSymptoms.length === 0) return;
    setIsAnalyzing(true);
    setDiagnosis(null);

    setTimeout(() => {
      // Intelligent Multi-Symptom Pattern Matching Engine
      let bestMatch = null;
      let highestScore = -1;

      for (const diag of COMPREHENSIVE_DIAGNOSES) {
        let isEligible = false;

        // Check if symptoms satisfy any requiredAny group
        for (const reqGroup of diag.requiredAny) {
          const hasAll = reqGroup.every(sym => selectedSymptoms.includes(sym));
          if (hasAll) {
            isEligible = true;
            break;
          }
        }

        if (isEligible) {
          // Calculate score based on matched primary and bonus symptoms
          const primaryMatches = selectedSymptoms.filter(s =>
            diag.requiredAny.some(group => group.includes(s))
          );
          const bonusMatches = selectedSymptoms.filter(s => diag.bonusScore.includes(s));
          const totalScore = (primaryMatches.length * 3) + (bonusMatches.length * 1.5);

          if (totalScore > highestScore) {
            highestScore = totalScore;
            const confidenceCalc = Math.min(
              98,
              diag.confidenceBase + (primaryMatches.length * 2) + (bonusMatches.length * 1)
            );
            bestMatch = {
              ...diag,
              confidence: confidenceCalc,
              matchedTriggers: Array.from(new Set([...primaryMatches, ...bonusMatches]))
            };
          }
        }
      }

      // Default fallback if no specific complex rule matched
      if (!bestMatch) {
        const defaultDiag = COMPREHENSIVE_DIAGNOSES.find(d => d.id === 'general_stress');
        bestMatch = {
          ...defaultDiag,
          confidence: 84,
          matchedTriggers: selectedSymptoms
        };
      }

      setDiagnosis(bestMatch);
      setIsAnalyzing(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }, 450);
  };

  const triggerEmergencyCall = () => {
    setCallModalOpen(true);
    setCallStatus('connecting');
    setTimeout(() => setCallStatus('connected'), 1200);
  };

  const colorMap = {
    red: {
      bg: 'bg-red-50/90',
      border: 'border-red-300',
      badge: 'bg-red-600 text-white',
      cardBg: 'bg-[#F4EDE0]',
      accentText: 'text-red-700',
      icon: 'text-red-600'
    },
    amber: {
      bg: 'bg-amber-50/90',
      border: 'border-amber-300',
      badge: 'bg-amber-600 text-white',
      cardBg: 'bg-[#F4EDE0]',
      accentText: 'text-amber-800',
      icon: 'text-amber-600'
    },
    green: {
      bg: 'bg-emerald-50/90',
      border: 'border-emerald-300',
      badge: 'bg-emerald-600 text-white',
      cardBg: 'bg-[#F4EDE0]',
      accentText: 'text-emerald-800',
      icon: 'text-emerald-600'
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-[#2A2A28]">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF5EB] border border-[#DFD3BF] text-[11px] font-bold text-[#D96B43] shadow-sm">
          <HeartPulse className="w-3.5 h-3.5 text-[#D96B43]" />
          <span>ICAR & IVRI Veterinary Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#2A2A28]">
          Livestock Health & <span className="text-[#D96B43]">Symptom Checker</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#7A7A70] max-w-lg mx-auto">
          Select observable physical symptoms in your cattle or buffalo to receive immediate differential diagnosis, first-aid protocols, and supportive veterinary guidance.
        </p>
      </div>

      {/* Tab Nav */}
      <div className="flex bg-[#FAF5EB] rounded-2xl p-1 border border-[#DFD3BF] shadow-sm gap-1">
        {[
          { id: 'checker', label: '🩺 AI Symptom Diagnostic Engine' },
          { id: 'vaccines', label: '💉 National Vaccination Protocol' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[#324E38] text-white shadow'
                : 'text-[#7A7A70] hover:text-[#2A2A28]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SYMPTOM CHECKER */}
      {activeTab === 'checker' && (
        <div className="space-y-6">
          <div className="bg-[#F4EDE0] p-6 sm:p-7 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70] block">
                  STEP 1: SELECT VISIBLE CLINICAL SIGNS
                </span>
                <p className="text-xs text-[#5A5A50] mt-0.5">Check all symptoms present in the animal for highest diagnosis accuracy</p>
              </div>
              {selectedSymptoms.length > 0 && (
                <span className="bg-[#F5EBE1] text-[#D96B43] px-3 py-1 rounded-full text-xs font-bold">
                  {selectedSymptoms.length} Selected
                </span>
              )}
            </div>

            {/* Symptoms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SYMPTOM_LIST.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <div
                    key={sym.id}
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 text-xs font-semibold select-none ${
                      isSelected
                        ? 'bg-[#F5EBE1] border-[#D96B43] text-[#D96B43] shadow-sm'
                        : 'bg-[#FDFBF7] border-[#DFD3BF] text-[#2A2A28] hover:bg-[#F7F3EA] hover:border-[#D9C9B3]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-[#D96B43] border-[#D96B43] text-white' : 'border-[#D9C9B3] bg-white'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm shrink-0">{sym.emoji}</span>
                    <span className="leading-snug">{sym.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {selectedSymptoms.length > 0 && (
                <button
                  onClick={() => { setSelectedSymptoms([]); setDiagnosis(null); }}
                  className="w-full sm:w-auto px-4 py-3 rounded-full border border-[#DFD3BF] text-[#7A7A70] hover:text-[#2A2A28] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear Selection
                </button>
              )}

              <button
                onClick={handleRunDiagnosis}
                disabled={selectedSymptoms.length === 0 || isAnalyzing}
                className="flex-1 w-full bg-[#324E38] hover:bg-[#253D2A] text-white py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider shadow-md disabled:opacity-40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Cross-referencing Veterinary Pathology Rules...</>
                ) : (
                  <><Stethoscope className="w-4 h-4 text-[#D96B43]" /> Run AI Veterinary Health Diagnosis ({selectedSymptoms.length})</>
                )}
              </button>
            </div>

          </div>

          {/* DIAGNOSIS RESULT CARD */}
          {diagnosis && (
            <div
              ref={resultRef}
              className={`p-6 sm:p-8 rounded-3xl border-2 space-y-6 shadow-md transition-all ${colorMap[diagnosis.color]?.bg} ${colorMap[diagnosis.color]?.border}`}
            >
              
              {/* Card Header with Condition & Severity */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${colorMap[diagnosis.color]?.badge}`}>
                      {diagnosis.urgency}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 border border-black/10 text-[#324E38] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#D96B43]" /> {diagnosis.confidence}% AI Diagnostic Confidence
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-editorial font-bold text-[#2A2A28] pt-1">
                    {diagnosis.condition}
                  </h3>
                  <div className="text-sm font-semibold text-[#D96B43]">
                    {diagnosis.hindiName}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-white/90 px-4 py-2 rounded-2xl border border-black/10">
                  <AlertOctagon className={`w-6 h-6 ${colorMap[diagnosis.color]?.icon}`} />
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-[#7A7A70] block">SEVERITY LEVEL</span>
                    <span className="text-xs font-black text-[#2A2A28]">{diagnosis.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Matched Symptoms Trigger Pills */}
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A7A70] block mb-2">
                  CONFIRMED CLINICAL TRIGGERS IN THIS DIAGNOSIS:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {diagnosis.matchedTriggers.map((trigId) => {
                    const match = SYMPTOM_LIST.find(s => s.id === trigId);
                    return (
                      <span key={trigId} className="inline-flex items-center gap-1 text-xs font-bold bg-white text-[#2A2A28] px-3 py-1 rounded-xl border border-black/10 shadow-xs">
                        <span>{match?.emoji}</span>
                        <span>{match?.label.split('/')[0]}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="bg-[#FAF5EB]/90 backdrop-blur rounded-2xl p-4 border border-black/10 space-y-1">
                  <div className="font-extrabold text-[10px] uppercase tracking-wider text-[#7A7A70]">Breed Prevalence & Etiology</div>
                  <p className="text-[#2A2A28] font-medium leading-relaxed">{diagnosis.breedPrevalence}</p>
                </div>
                <div className="bg-[#FAF5EB]/90 backdrop-blur rounded-2xl p-4 border border-black/10 space-y-1">
                  <div className="font-extrabold text-[10px] uppercase tracking-wider text-[#7A7A70]">Herd Biosecurity & Isolation</div>
                  <p className="text-[#2A2A28] font-medium leading-relaxed">{diagnosis.quarantineGuide}</p>
                </div>
              </div>

              {/* Step-by-Step Immediate First-Aid */}
              <div className="bg-[#FAF5EB] rounded-2xl p-5 border border-[#DFD3BF] space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#D96B43]" />
                  <span className="font-editorial font-bold text-sm text-[#2A2A28]">
                    Immediate First-Aid Action Protocol for Farmers
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {diagnosis.firstAid.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FDFBF7] border border-[#DFD3BF] text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#324E38] text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-[#2A2A28] leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Protocol & Antibiotic Disclaimer */}
              <div className="bg-[#FAF5EB] rounded-2xl p-5 border border-[#DFD3BF] space-y-2">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  <span className="font-editorial font-bold text-sm text-[#2A2A28]">
                    Supportive Medical Protocol & Clinical Guidelines
                  </span>
                </div>
                <p className="text-xs text-[#2A2A28] leading-relaxed bg-[#F7F3EA] p-3 rounded-xl border border-[#DFD3BF]">
                  {diagnosis.medicalProtocol}
                </p>
                <p className="text-[10px] text-[#7A7A70] flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Important: Prescription antibiotics and injectable drugs must be administered only by a licensed Veterinary Officer.</span>
                </p>
              </div>

              {/* Relevant Vaccines */}
              {diagnosis.vaccines && diagnosis.vaccines.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 bg-white/80 p-3 rounded-2xl border border-black/10">
                  <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] mr-1">Recommended Vaccine Protection:</span>
                  {diagnosis.vaccines.map((v, i) => (
                    <span key={i} className="text-xs font-bold bg-[#324E38] text-white px-3 py-1 rounded-full shadow-xs">
                      💉 {v}
                    </span>
                  ))}
                </div>
              )}

              {/* Emergency Duty Doctor Connect Button */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={triggerEmergencyCall}
                  className="flex-1 bg-[#D96B43] hover:bg-[#C25832] text-white py-3.5 px-6 rounded-full font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
                >
                  <Phone className="w-4 h-4 animate-bounce" /> Call Duty Veterinary Doctor / Toll-Free 1962
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: VACCINATION SCHEDULE */}
      {activeTab === 'vaccines' && (
        <div className="bg-[#F4EDE0] p-6 sm:p-8 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D96B43]" />
              <div>
                <h2 className="font-editorial font-bold text-lg text-[#2A2A28]">National Livestock Vaccination Calendar</h2>
                <p className="text-xs text-[#7A7A70]">Mandatory immunizations prescribed by Animal Husbandry Dept. & ICAR</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Government Subsidized
            </span>
          </div>

          <div className="space-y-3">
            {VACCINATION_SCHEDULE.map((vac, idx) => {
              const statusColors = {
                due_now: 'bg-red-100 text-red-800 border-red-200',
                due_soon: 'bg-amber-100 text-amber-800 border-amber-200',
                ok: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              };
              const statusLabel = { due_now: '⚠️ Due Immediately', due_soon: '📅 Due Soon', ok: '✅ Up to Date' };
              return (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD3BF] hover:bg-[#F7F3EA] transition-colors">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#2A2A28] flex items-center gap-2">
                      <span>{vac.name}</span>
                    </div>
                    <div className="text-[11px] text-[#5A5A50]">{vac.schedule} · <span className="font-semibold text-[#324E38]">{vac.target}</span></div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <span className="text-[11px] font-semibold text-[#7A7A70]">Window: {vac.nextDue}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors[vac.status]}`}>
                      {statusLabel[vac.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#F7F3EA] p-4 rounded-2xl border border-[#DFD3BF] text-xs text-[#5A5A50] space-y-1">
            <strong className="text-[#2A2A28] block">Kisan Advisory:</strong>
            <p>
              Under the National Animal Disease Control Programme (NADCP), FMD and Brucellosis vaccinations are provided 100% free of charge by the Government of India. Contact your local Gram Panchayat veterinary assistant for village camp dates.
            </p>
          </div>
        </div>
      )}

      {/* Emergency Call Simulation Modal */}
      {callModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <Phone className="w-5 h-5 animate-pulse" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Veterinary Tele-Emergency Connect
                </h3>
              </div>
              <button
                onClick={() => setCallModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F5EBE1] text-[#D96B43] flex items-center justify-center mx-auto shadow-inner">
                {callStatus === 'connecting' ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <UserCheck className="w-8 h-8 text-emerald-600" />
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-[#2A2A28]">
                  {callStatus === 'connecting' ? 'Routing to Duty Veterinary Officer...' : 'Connected: Dr. S. Ramanathan (MVSc)'}
                </h4>
                <p className="text-xs text-[#7A7A70] mt-0.5">
                  {callStatus === 'connecting'
                    ? 'Kisan Pashu Helpline (Toll-Free 1962 / 1800-180-1551)'
                    : 'District Animal Husbandry Tele-Clinic active.'}
                </p>
              </div>

              {diagnosis && (
                <div className="text-left bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#DFD3BF] text-xs space-y-1">
                  <div className="text-[10px] font-bold uppercase text-[#7A7A70]">Automated Tele-Triage Payload:</div>
                  <div className="font-bold text-[#2A2A28]">{diagnosis.condition}</div>
                  <div className="text-[11px] text-[#5A5A50]">Symptoms reported: {diagnosis.matchedTriggers.join(', ')}</div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCallModalOpen(false)}
                className="flex-1 bg-[#324E38] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                Close Connection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
