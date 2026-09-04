// Cross-Role Data Connection Engine for BREEDIFY Ecosystem
// Connects Farmer, Veterinarian, and Milk Vendor through shared records
import { getPassports, savePassport, getPassportById } from './passportStorage';
import { enforcePermission } from './rbac';

const CASES_KEY = 'bovine_clinical_cases';
const COLLECTIONS_KEY = 'bovine_milk_collections';
const WALLET_KEY = 'bovine_farmer_wallet';
const EMERGENCY_KEY = 'bovine_emergency_requests';

// Initial Mock Clinical Cases for Vet Command Center
const INITIAL_CASES = [
  {
    id: 'CASE-2026-081',
    date: '03 Sep 2026',
    time: '11:30 AM',
    animalId: 'BOV-IN-009942',
    tagNumber: 'TAG-IN-9942',
    breed: 'Jaffarabadi Buffalo',
    farmerName: 'Ramesh Patel',
    farmerMobile: '+91 98765 43210',
    village: 'Mogri, Anand',
    symptoms: 'Swelling in right rear quarter, mild fever (102.2°F), curd flakes in stripped milk.',
    diagnosis: 'Subclinical Mastitis (Streptococcus uberis)',
    treatmentGiven: 'Intramammary Cloxacillin infusion + Meloxicam 15ml IM',
    vaccinationGiven: null,
    urgency: 'High',
    status: 'Under Treatment',
    vetName: 'Dr. Anita Joshi, B.V.Sc'
  },
  {
    id: 'CASE-2026-079',
    date: '02 Sep 2026',
    time: '04:15 PM',
    animalId: 'BOV-IN-008891',
    tagNumber: 'TAG-IN-8891',
    breed: 'Gir Cow',
    farmerName: 'Ramesh Patel',
    farmerMobile: '+91 98765 43210',
    village: 'Mogri, Anand',
    symptoms: 'Routine 5th month pregnancy confirmation & FMD pre-monsoon immunity check.',
    diagnosis: 'Normal Gestation (142 Days) · Sound Vitality',
    treatmentGiven: 'Oral Calcium gel recommendation + Deworming check',
    vaccinationGiven: 'FMD Booster (Batch FMD-IN-882)',
    urgency: 'Routine',
    status: 'Resolved',
    vetName: 'Dr. Anita Joshi, B.V.Sc'
  }
];

// Initial Milk Collections recorded by Milk Vendor
const INITIAL_COLLECTIONS = [
  {
    id: 'MC-2026-0903-1',
    date: '03 Sep 2026',
    shift: 'Morning',
    farmerName: 'Ramesh Patel',
    farmerMobile: '+91 98765 43210',
    village: 'Mogri Route #4',
    animalTag: 'TAG-IN-4420 (Murrah Buffalo)',
    liters: 14.5,
    fat: 7.6,
    snf: 9.2,
    ratePerLiter: 66.8, // (7.6 * 5.8) + (9.2 * 2.4)
    totalPayout: 968.6,
    paymentStatus: 'Paid',
    paymentMode: 'Direct Bank Transfer (DBT)',
    recordedAt: '06:45 AM'
  },
  {
    id: 'MC-2026-0903-2',
    date: '03 Sep 2026',
    shift: 'Morning',
    farmerName: 'Ramesh Patel',
    farmerMobile: '+91 98765 43210',
    village: 'Mogri Route #4',
    animalTag: 'TAG-IN-8891 (Gir Cow)',
    liters: 12.0,
    fat: 4.8,
    snf: 8.8,
    ratePerLiter: 58.2,
    totalPayout: 698.4,
    paymentStatus: 'Paid',
    paymentMode: 'Direct Bank Transfer (DBT)',
    recordedAt: '07:15 AM'
  }
];

// Initial Emergency Requests from Farmers
const INITIAL_EMERGENCIES = [
  {
    id: 'EMG-902',
    date: '03 Sep 2026',
    time: '10 mins ago',
    animalId: 'BOV-IN-009942',
    tagNumber: 'TAG-IN-9942',
    farmerName: 'Ramesh Patel',
    village: 'Mogri, Plot 14',
    mobile: '+91 98765 43210',
    emergencyType: 'Acute Left Flank Bloat / Tympanites',
    description: 'Cow swollen on left side after morning berseem feed, breathing fast.',
    status: 'Pending Dispatch'
  }
];

/* ─── 1. VETERINARIAN FUNCTIONS ─── */
export function getClinicalCases() {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    if (!raw) {
      localStorage.setItem(CASES_KEY, JSON.stringify(INITIAL_CASES));
      return INITIAL_CASES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CASES;
  }
}

export function saveClinicalCase(caseData, userRole = 'vet') {
  enforcePermission(userRole, 'case:create');

  const cases = getClinicalCases();
  const newCase = {
    ...caseData,
    id: caseData.id || `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  cases.unshift(newCase);
  localStorage.setItem(CASES_KEY, JSON.stringify(cases));

  // CROSS-ROLE SYNC: Update animal record in Digital Passport
  const targetId = caseData.animalId || caseData.tagNumber;
  if (targetId) {
    const animal = getPassportById(targetId);
    if (animal) {
      // Update health status
      const updatedAnimal = { ...animal };
      if (caseData.healthStatus) {
        updatedAnimal.health = {
          ...updatedAnimal.health,
          status: caseData.healthStatus,
          lastCheckup: newCase.date
        };
      }

      // Add vaccination if administered
      if (caseData.vaccinationGiven) {
        const vacName = caseData.vaccinationGiven;
        const newVac = {
          name: vacName,
          date: newCase.date,
          batch: caseData.vaccineBatch || `VAC-IND-${Math.floor(100 + Math.random() * 900)}`,
          status: 'Vaccinated by Dr. Joshi'
        };
        updatedAnimal.health.vaccinations = [newVac, ...(updatedAnimal.health.vaccinations || [])];
      }

      // Append clinical note to timeline
      const timelineNote = {
        date: newCase.date,
        title: `Clinical Consultation: ${caseData.diagnosis || 'Health Examination'}`,
        note: `Prescribed: ${caseData.treatmentGiven || 'Routine examination completed'}. Status: ${caseData.healthStatus || 'Checked'}`
      };
      updatedAnimal.timeline = [timelineNote, ...(updatedAnimal.timeline || [])];

      savePassport(updatedAnimal);
    }
  }

  return newCase;
}

/* ─── 2. MILK VENDOR FUNCTIONS ─── */
export function getMilkCollections() {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) {
      localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(INITIAL_COLLECTIONS));
      return INITIAL_COLLECTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COLLECTIONS;
  }
}

export function saveMilkCollection(collectionData, userRole = 'vendor') {
  enforcePermission(userRole, 'milk:create');

  const collections = getMilkCollections();
  
  // Calculate two-axis milk price
  const fat = parseFloat(collectionData.fat) || 4.5;
  const snf = parseFloat(collectionData.snf) || 8.5;
  const liters = parseFloat(collectionData.liters) || 10;
  
  // Benchmark cooperative formula: (Fat * 5.8) + (SNF * 2.4)
  const ratePerLiter = Math.round(((fat * 5.8) + (snf * 2.4)) * 10) / 10;
  const totalPayout = Math.round((liters * ratePerLiter) * 10) / 10;

  const newRecord = {
    ...collectionData,
    id: `MC-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    shift: new Date().getHours() < 12 ? 'Morning' : 'Evening',
    liters,
    fat,
    snf,
    ratePerLiter,
    totalPayout,
    paymentStatus: 'Paid',
    paymentMode: 'Direct Bank Transfer (DBT)',
    recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  collections.unshift(newRecord);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));

  // CROSS-ROLE SYNC: Update animal's current daily yield & fat in passport
  if (collectionData.animalId || collectionData.animalTag) {
    const tagMatch = (collectionData.animalTag || '').match(/TAG-IN-\d+/)?.[0];
    const targetId = collectionData.animalId || tagMatch;
    if (targetId) {
      const animal = getPassportById(targetId);
      if (animal) {
        const updatedAnimal = {
          ...animal,
          milk: {
            ...animal.milk,
            dailyYield: `${liters} L/day (Recorded Today)`,
            fatPercentage: `${fat}%`,
            snfPercentage: `${snf}%`
          },
          timeline: [
            {
              date: newRecord.date,
              title: `Milk Collection Recorded: ${liters}L @ ₹${ratePerLiter}/L`,
              note: `Quality: ${fat}% Fat · ${snf}% SNF. Payout: ₹${totalPayout} disbursed via DBT.`
            },
            ...(animal.timeline || [])
          ]
        };
        savePassport(updatedAnimal);
      }
    }
  }

  return newRecord;
}

/* ─── 3. FARMER FUNCTIONS ─── */
export function getFarmerMilkEarnings(farmerName = 'Ramesh Patel') {
  const collections = getMilkCollections();
  const farmerCollections = collections.filter(c => !farmerName || c.farmerName?.toLowerCase().includes(farmerName.toLowerCase()));

  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayCollections = farmerCollections.filter(c => c.date === today);

  const todayLiters = todayCollections.reduce((sum, c) => sum + (c.liters || 0), 0);
  const todayEarnings = todayCollections.reduce((sum, c) => sum + (c.totalPayout || 0), 0);
  const totalLifetimeEarnings = farmerCollections.reduce((sum, c) => sum + (c.totalPayout || 0), 0);

  return {
    todayLiters: Math.round(todayLiters * 10) / 10,
    todayEarnings: Math.round(todayEarnings),
    totalLifetimeEarnings: Math.round(totalLifetimeEarnings),
    collections: farmerCollections
  };
}

export function getEmergencyRequests() {
  try {
    const raw = localStorage.getItem(EMERGENCY_KEY);
    if (!raw) {
      localStorage.setItem(EMERGENCY_KEY, JSON.stringify(INITIAL_EMERGENCIES));
      return INITIAL_EMERGENCIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EMERGENCIES;
  }
}

export function createEmergencyRequest(requestData, userRole = 'farmer') {
  enforcePermission(userRole, 'consultation:create');

  const requests = getEmergencyRequests();
  const newReq = {
    ...requestData,
    id: `EMG-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Pending Dispatch'
  };

  requests.unshift(newReq);
  localStorage.setItem(EMERGENCY_KEY, JSON.stringify(requests));
  return newReq;
}

export function resolveEmergencyRequest(reqId, userRole = 'vet') {
  enforcePermission(userRole, 'case:update');

  const requests = getEmergencyRequests();
  const idx = requests.findIndex(r => r.id === reqId);
  if (idx >= 0) {
    requests[idx].status = 'Veterinarian Dispatched';
    localStorage.setItem(EMERGENCY_KEY, JSON.stringify(requests));
  }
  return requests;
}
