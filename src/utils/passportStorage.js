// Unified Local Storage Manager for BREEDIFY Digital Animal Passports
const STORAGE_KEY = 'bovine_passports';

const INITIAL_PASSPORTS = [
  {
    id: 'BOV-IN-008891',
    tagNumber: 'TAG-IN-8891',
    inaphTag: '1209 8891 4401',
    species: 'Cattle',
    breed: 'Gir Cow',
    hindiName: 'गीर गाय',
    scientificName: 'Bos indicus',
    breedConfidence: 0.96,
    gender: 'Female',
    age: '4.5 Years',
    color: 'Reddish Dun with White Patches',
    identificationMarks: 'Convex forehead, pendulous leaf-like ears, curved lyre horns',
    photo: '/breeds/gir.jpg',
    owner: {
      name: 'Ramesh Patel',
      mobile: '+91 98765 43210',
      farmName: 'Amul Sharda Dairy Farm',
      village: 'Mogri',
      district: 'Anand',
      state: 'Gujarat',
      registrationDate: '12 Jan 2024'
    },
    health: {
      status: 'Healthy',
      pregnancyStatus: 'Pregnant (Est. 5th Month · Gestation 142 Days)',
      lastCheckup: '12 Aug 2026',
      bodyTemperature: '101.8°F (Normal)',
      dewormingDate: '15 Jul 2026 (Albendazole 100ml)',
      vaccinations: [
        { name: 'FMD (Foot & Mouth)', date: '10 May 2026', batch: 'FMD-IN-882', status: 'Vaccinated' },
        { name: 'HS (Haemorrhagic Septicaemia)', date: '05 May 2026', batch: 'HS-IND-410', status: 'Vaccinated' },
        { name: 'BQ (Black Quarter)', date: '28 Apr 2026', batch: 'BQ-V-119', status: 'Vaccinated' }
      ]
    },
    milk: {
      dailyYield: '16.5 L/day',
      fatPercentage: '4.8%',
      snfPercentage: '8.8%',
      lactationCycle: '305 Days (2nd Lactation)',
      milkingSchedule: 'Twice daily (5:30 AM & 6:00 PM)'
    },
    feeding: {
      greenFodder: '22 kg Hybrid Napier & Berseem',
      dryFodder: '4.5 kg Chopped Wheat Straw',
      concentrate: '3.5 kg Cottonseed & Maize blend',
      mineralMix: '50g Chelated Mineral Mixture + 10g Salt'
    },
    documents: {
      inaphVerified: true,
      insurancePolicy: 'New India Assurance (NLIS-2026-8891)',
      insuranceCoverage: '₹95,000',
      pkccSanctioned: '₹44,000 (Active @ 4%)'
    },
    timeline: [
      { date: '12 Aug 2026', title: 'AI Vision Biometric Scan', note: '96% Gir breed purity confirmed via BREEDIFY' },
      { date: '15 Jul 2026', title: 'Routine Deworming', note: 'Administered oral Albendazole suspension' },
      { date: '10 May 2026', title: 'Bi-Annual FMD Vaccination', note: 'Administered by Veterinary Hospital, Anand' },
      { date: '22 Mar 2026', title: 'Artificial Insemination (AI)', note: 'Superior Gir pedigree semen straw #GJ-GIR-491' }
    ]
  },
  {
    id: 'BOV-IN-004420',
    tagNumber: 'TAG-IN-4420',
    inaphTag: '1209 4420 9021',
    species: 'Buffalo',
    breed: 'Murrah Buffalo',
    hindiName: 'मुर्रा भैंस (ब्लैक गोल्ड)',
    scientificName: 'Bubalus bubalis',
    breedConfidence: 0.98,
    gender: 'Female',
    age: '5 Years',
    color: 'Jet Black with White Tail Switch',
    identificationMarks: 'Tightly curled spiral horns, short broad muzzle, massive wedge udder',
    photo: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=800&q=80',
    owner: {
      name: 'Ramesh Patel',
      mobile: '+91 98765 43210',
      farmName: 'Amul Sharda Dairy Farm',
      village: 'Mogri',
      district: 'Anand',
      state: 'Gujarat',
      registrationDate: '05 Mar 2024'
    },
    health: {
      status: 'Healthy',
      pregnancyStatus: 'Milking · Non-Pregnant',
      lastCheckup: '25 Aug 2026',
      bodyTemperature: '101.4°F (Normal)',
      dewormingDate: '10 Aug 2026 (Ivermectin Pour-on)',
      vaccinations: [
        { name: 'FMD (Foot & Mouth)', date: '12 May 2026', batch: 'FMD-IN-882', status: 'Vaccinated' },
        { name: 'HS (Haemorrhagic Septicaemia)', date: '08 May 2026', batch: 'HS-IND-410', status: 'Vaccinated' },
        { name: 'LSD (Lumpy Skin Disease)', date: '15 Sep 2025', batch: 'LSD-GP-301', status: 'Vaccinated' }
      ]
    },
    milk: {
      dailyYield: '19.0 L/day',
      fatPercentage: '7.6%',
      snfPercentage: '9.2%',
      lactationCycle: '315 Days (3rd Lactation)',
      milkingSchedule: 'Twice daily (5:00 AM & 5:30 PM)'
    },
    feeding: {
      greenFodder: '28 kg Maize & Sorghum silage',
      dryFodder: '5.0 kg Paddy Straw',
      concentrate: '4.5 kg Balanced Dairy Mash with Bypass Fat',
      mineralMix: '60g Chelated Mineral Mixture + 30g Buffer'
    },
    documents: {
      inaphVerified: true,
      insurancePolicy: 'PM Pashu Bima (NIC-2026-4420)',
      insuranceCoverage: '₹1,25,000',
      pkccSanctioned: '₹61,000 (Active @ 4%)'
    },
    timeline: [
      { date: '25 Aug 2026', title: 'Milk Quality Testing', note: 'Recorded 7.6% Butterfat and 9.2% SNF' },
      { date: '10 Aug 2026', title: 'Ectoparasite Treatment', note: 'Applied Flumethrin 1% pour-on for tick protection' },
      { date: '12 May 2026', title: 'FMD Annual Booster', note: 'Administered under National Animal Disease Control' }
    ]
  },
  {
    id: 'BOV-IN-007135',
    tagNumber: 'TAG-IN-7135',
    inaphTag: '1209 7135 1184',
    species: 'Cattle',
    breed: 'Sahiwal Cow',
    hindiName: 'साहीवाल गाय',
    scientificName: 'Bos indicus',
    breedConfidence: 0.94,
    gender: 'Female',
    age: '3.5 Years',
    color: 'Reddish-Dun with Pale Underside',
    identificationMarks: 'Voluminous loose dewlap, stumpy horns, docile temperament',
    photo: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80',
    owner: {
      name: 'Ramesh Patel',
      mobile: '+91 98765 43210',
      farmName: 'Amul Sharda Dairy Farm',
      village: 'Mogri',
      district: 'Anand',
      state: 'Gujarat',
      registrationDate: '18 Nov 2024'
    },
    health: {
      status: 'Healthy',
      pregnancyStatus: 'Heifer · Ready for Insemination',
      lastCheckup: '01 Sep 2026',
      bodyTemperature: '101.6°F (Normal)',
      dewormingDate: '20 Jul 2026',
      vaccinations: [
        { name: 'Brucellosis (Strain 19)', date: '15 Dec 2023', batch: 'BRU-19-44', status: 'Lifetime Completed' },
        { name: 'FMD (Foot & Mouth)', date: '15 May 2026', batch: 'FMD-IN-882', status: 'Vaccinated' }
      ]
    },
    milk: {
      dailyYield: '14.0 L/day (Est.)',
      fatPercentage: '4.6%',
      snfPercentage: '8.7%',
      lactationCycle: '300 Days',
      milkingSchedule: 'N/A (First Calver Expected)'
    },
    feeding: {
      greenFodder: '20 kg Leguminous Berseem & Cowpea',
      dryFodder: '4.0 kg Wheat Straw',
      concentrate: '3.0 kg Steaming Up Feed',
      mineralMix: '50g Minerals + Calcium Booster'
    },
    documents: {
      inaphVerified: true,
      insurancePolicy: 'IFFCO-Tokio Comprehensive (IT-2026-7135)',
      insuranceCoverage: '₹80,000',
      pkccSanctioned: '₹44,000 (Eligible)'
    },
    timeline: [
      { date: '01 Sep 2026', title: 'Breeding Pre-Screening', note: 'Pelvic structure verified ready for AI' },
      { date: '15 May 2026', title: 'FMD Pre-Monsoon Vaccine', note: 'Administered via Block Veterinary Dispensary' }
    ]
  },
  {
    id: 'BOV-IN-009942',
    tagNumber: 'TAG-IN-9942',
    inaphTag: '1209 9942 6639',
    species: 'Buffalo',
    breed: 'Jaffarabadi Buffalo',
    hindiName: 'जाફરાબાદી ભેંસ',
    scientificName: 'Bubalus bubalis',
    breedConfidence: 0.93,
    gender: 'Female',
    age: '6 Years',
    color: 'Deep Black with Heavy Bone Frame',
    identificationMarks: 'Heavy drooping horns turned outwards and downwards, prominent forehead',
    photo: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80',
    owner: {
      name: 'Ramesh Patel',
      mobile: '+91 98765 43210',
      farmName: 'Amul Sharda Dairy Farm',
      village: 'Mogri',
      district: 'Anand',
      state: 'Gujarat',
      registrationDate: '10 Feb 2023'
    },
    health: {
      status: 'Under Treatment',
      pregnancyStatus: 'Milking · Non-Pregnant',
      lastCheckup: '02 Sep 2026',
      bodyTemperature: '102.2°F (Slight Fever)',
      dewormingDate: '01 Jun 2026',
      vaccinations: [
        { name: 'FMD (Foot & Mouth)', date: '12 May 2026', batch: 'FMD-IN-882', status: 'Vaccinated' },
        { name: 'HS (Haemorrhagic Septicaemia)', date: '08 May 2026', batch: 'HS-IND-410', status: 'Vaccinated' }
      ]
    },
    milk: {
      dailyYield: '17.0 L/day',
      fatPercentage: '8.2%',
      snfPercentage: '9.4%',
      lactationCycle: '310 Days',
      milkingSchedule: 'Twice daily'
    },
    feeding: {
      greenFodder: '30 kg Sorghum & Napier',
      dryFodder: '6.0 kg Bajra Stover',
      concentrate: '5.0 kg High Energy Mustard Cake Mash',
      mineralMix: '60g Minerals + 50g Salt'
    },
    documents: {
      inaphVerified: true,
      insurancePolicy: 'PM Pashu Bima (NIC-2026-9942)',
      insuranceCoverage: '₹1,10,000',
      pkccSanctioned: '₹61,000'
    },
    timeline: [
      { date: '02 Sep 2026', title: 'Subclinical Mastitis Check', note: 'CMT test mild positive in right rear quarter; started teat dipping' },
      { date: '12 May 2026', title: 'Bi-Annual FMD Booster', note: 'Verified by Dr. Sharma, Veterinary Officer' }
    ]
  }
];

export function getPassports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PASSPORTS));
      return INITIAL_PASSPORTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PASSPORTS));
      return INITIAL_PASSPORTS;
    }
    // Auto-heal broken photo URLs using reliable local realistic breed photos
    let updated = false;
    const healed = parsed.map((p) => {
      if (!p.photo || p.photo.includes('1546445317') || p.photo.includes('/stickers/')) {
        updated = true;
        return {
          ...p,
          photo: p.species === 'Buffalo' ? '/breeds/murrah.jpg' : '/breeds/gir.jpg'
        };
      }
      return p;
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(healed));
    }
    return healed;
  } catch (e) {
    console.error('Error reading passports from localStorage', e);
    return INITIAL_PASSPORTS;
  }
}

export function getPassportById(id) {
  const passports = getPassports();
  return passports.find(p => p.id === id || p.tagNumber === id);
}

export function savePassport(animalData) {
  const passports = getPassports();
  const existingIdx = passports.findIndex(p => p.id === animalData.id || p.tagNumber === animalData.tagNumber);

  if (existingIdx >= 0) {
    passports[existingIdx] = {
      ...passports[existingIdx],
      ...animalData,
      updatedAt: new Date().toISOString()
    };
  } else {
    passports.unshift({
      ...animalData,
      id: animalData.id || `BOV-IN-${Math.floor(100000 + Math.random() * 900000)}`,
      tagNumber: animalData.tagNumber || `TAG-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(passports));
  return passports;
}

export function deletePassport(id) {
  const passports = getPassports().filter(p => p.id !== id && p.tagNumber !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(passports));
  return passports;
}
