// Unified Local Storage & State Management for BREEDIFY Livestock Marketplace
import {
  createSaleListing as fsCreateSaleListing,
  getSaleListings as fsGetSaleListings,
  getSaleListingById as fsGetSaleListingById,
  updateSaleListing as fsUpdateSaleListing,
  deleteSaleListing as fsDeleteSaleListing,
  getFirestoreDashboardStats as fsGetDashboardStats,
  initializeFirestoreDatabaseIfEmpty
} from '../services/firestoreService.js';
import { SAMPLE_ANIMALS } from '../data/sampleBreeds.js';

const STORAGE_KEY = 'breedify_marketplace_listings';
const SAVED_KEY = 'breedify_saved_animals';
const REQUESTS_KEY = 'breedify_purchase_requests';

// Helper to resolve authentic realistic breed photos
export function getRealisticBreedImage(breed, species) {
  const b = (breed || '').toLowerCase();
  const s = (species || '').toLowerCase();
  if (b.includes('ongole')) return '/breeds/ongole.jpg';
  if (b.includes('murrah')) return '/breeds/murrah.jpg';
  if (b.includes('jaffarabadi')) return '/breeds/jaffarabadi.jpg';
  if (b.includes('sahiwal')) return '/breeds/sahiwal.jpg';
  if (b.includes('kankrej')) return '/breeds/kankrej.jpg';
  if (b.includes('rathi')) return '/breeds/rathi.jpg';
  if (b.includes('red sindhi') || b.includes('sindhi')) return '/breeds/red_sindhi.jpg';
  if (b.includes('tharparkar')) return '/breeds/tharparkar.jpg';
  if (b.includes('banni')) return '/breeds/banni.jpg';
  if (b.includes('mehsana')) return '/breeds/mehsana.jpg';
  if (b.includes('surti')) return '/breeds/surti.jpg';
  if (b.includes('nili')) return '/breeds/nili_ravi.jpg';
  if (b.includes('hariana')) return '/breeds/hariana.jpg';
  if (b.includes('deoni')) return '/breeds/deoni.jpg';
  if (b.includes('hallikar')) return '/breeds/hallikar.jpg';
  if (b.includes('kangayam')) return '/breeds/kangayam.jpg';
  if (b.includes('jersey')) return '/breeds/jersey_cross.jpg';
  if (b.includes('hf') || b.includes('holstein')) return '/breeds/hf_cross.jpg';
  if (b.includes('gir') && (b.includes('calf') || b.includes('heifer'))) return '/breeds/calf.jpg';
  if (b.includes('gir')) return '/breeds/gir.jpg';
  if (b.includes('calf') || b.includes('heifer')) return '/breeds/calf.jpg';
  return s === 'buffalo' ? '/breeds/murrah.jpg' : '/breeds/gir.jpg';
}

export const INITIAL_LISTINGS = [
  {
    listingId: 'MKT-IN-901',
    animalId: 'BOV-IN-008891',
    species: 'Cattle',
    breed: 'Sahiwal Cow',
    breedConfidence: 0.97,
    breedVerificationStatus: 'verified', // 'ai_estimated' | 'seller_provided' | 'verified'
    gender: 'Female',
    ageGroup: 'Adult',
    estimatedAge: '4.5 Years',
    dateOfBirth: '2021-11-14',
    weight: '390 kg',
    colour: 'Reddish Dun with White Underbelly',
    earTag: 'TAG-IN-8891',
    officialAnimalId: '1209 8891 4401',
    identificationStatus: 'Official Pashu Aadhaar', // 'Official Pashu Aadhaar' | 'Pending Registration'
    pregnancyStatus: 'Pregnant',
    pregnancyVerification: 'verified', // 'verified' | 'unverified'
    expectedCalvingDate: '2026-11-20',
    monthsPregnant: 5,
    previousCalvings: 2,
    lastCalvingDate: '2025-04-10',
    milkYield: '16 – 20 Liters / day',
    fatPercentage: '4.8% Butterfat',
    snfPercentage: '8.9% SNF',
    healthStatus: 'Healthy',
    vaccinationStatus: 'Fully Vaccinated (FMD, HS, BQ)',
    veterinaryVerification: 'verified', // 'verified' | 'unverified'
    lastVetCheck: '2026-08-15',
    dewormingDate: '2026-07-20',
    images: [
      '/breeds/sahiwal.jpg',
      '/breeds/gir.jpg',
      '/breeds/rathi.jpg'
    ],
    video: null,
    sellerId: 'usr_farmer_sahiwal',
    sellerDetails: {
      name: 'Gurpreet Singh Dhillon',
      village: 'Fazilka',
      district: 'Fazilka',
      state: 'Punjab',
      mobile: '+91 98140 22319',
      sellerType: 'Farmer',
      verifiedSeller: true,
      sellerRating: 4.9,
      animalsSold: 14,
      memberSince: 'March 2023'
    },
    location: 'Fazilka, Punjab',
    mandiDistance: '4.2 km from Fazilka Mandi',
    price: 88000,
    negotiable: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    availableFrom: 'Immediate',
    reasonForSelling: 'Herd rotation and expanding modern dairy milking parlor.',
    description: 'High-yielding Sahiwal dairy cow in second lactation. Excellent udder conformation, gentle temperament, certified A2 milk quality. Confirmed 5 months pregnant through certified veterinary ultrasound. Complete ICAR medical and vaccination history available.',
    historyTimeline: [
      { date: '14 Nov 2021', title: 'Birth Recorded', note: 'Sire: Sire-Sahiwal-PB-12, Dam: High-milking pure Sahiwal dam (19.5 L/day)' },
      { date: '20 Jan 2022', title: 'INAPH Ear Tagging', note: 'Tag #1209 8891 4401 issued by Punjab Animal Husbandry Dept' },
      { date: '10 May 2025', title: 'FMD & HS Vaccination', note: 'Administered by District Vet Hospital Fazilka' },
      { date: '15 Mar 2026', title: 'Artificial Insemination (AI)', note: 'Pure pedigree Sahiwal semen straw #PB-SAH-772' },
      { date: '15 Aug 2026', title: 'Veterinary Pregnancy Ultrasound', note: 'Confirmed pregnant (5th month) by Dr. Ravinder Sidhu, B.V.Sc' },
      { date: '01 Sep 2026', title: 'Listed on BREEDIFY Marketplace', note: 'Public listing with verified health & breed pedigree' }
    ],
    listingStatus: 'active', // 'active' | 'pending' | 'sold' | 'paused'
    views: 342,
    saves: 28,
    interestedBuyers: 6,
    createdAt: '2026-09-01T10:30:00Z',
    updatedAt: '2026-09-04T12:00:00Z'
  },
  {
    listingId: 'MKT-IN-902',
    animalId: 'BOV-IN-004420',
    species: 'Buffalo',
    breed: 'Murrah Buffalo',
    breedConfidence: 0.98,
    breedVerificationStatus: 'verified',
    gender: 'Female',
    ageGroup: 'Adult',
    estimatedAge: '5.2 Years',
    dateOfBirth: '2021-03-20',
    weight: '520 kg',
    colour: 'Jet Black with White Tail Switch',
    earTag: 'TAG-IN-4420',
    officialAnimalId: '1209 4420 9021',
    identificationStatus: 'Official Pashu Aadhaar',
    pregnancyStatus: 'Not Pregnant',
    pregnancyVerification: 'verified',
    expectedCalvingDate: null,
    monthsPregnant: 0,
    previousCalvings: 2,
    lastCalvingDate: '2026-02-15',
    milkYield: '18 – 22 Liters / day',
    fatPercentage: '7.4% Butterfat',
    snfPercentage: '9.2% SNF',
    healthStatus: 'Healthy',
    vaccinationStatus: 'Fully Vaccinated (FMD, HS, BQ, Anthrax)',
    veterinaryVerification: 'verified',
    lastVetCheck: '2026-08-20',
    dewormingDate: '2026-08-01',
    images: [
      '/breeds/murrah.jpg',
      '/breeds/jaffarabadi.jpg',
      '/breeds/banni.jpg'
    ],
    video: null,
    sellerId: 'usr_farmer_murrah',
    sellerDetails: {
      name: 'Baldev Singh Hooda',
      village: 'Makrauli Kalan',
      district: 'Rohtak',
      state: 'Haryana',
      mobile: '+91 94161 88720',
      sellerType: 'Dairy Owner',
      verifiedSeller: true,
      sellerRating: 5.0,
      animalsSold: 26,
      memberSince: 'January 2023'
    },
    location: 'Rohtak, Haryana',
    mandiDistance: '6.5 km from Rohtak Pashu Mandi',
    price: 95000,
    negotiable: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    availableFrom: 'Immediate',
    reasonForSelling: 'Excess milking capacity in dairy expansion.',
    description: 'World-renowned Murrah Black Gold buffalo with distinctive tightly curled horns, broad muzzle, and deep barrel. Yields 20+ liters daily at 7.4% fat. Tested negative for brucellosis and subclinical mastitis. Ideal for commercial dairy units seeking immediate high milk returns.',
    historyTimeline: [
      { date: '20 Mar 2021', title: 'Birth Recorded', note: 'Pure Murrah lineage, CIRB Hisar champion bloodline' },
      { date: '15 Apr 2021', title: 'Ear Tagged', note: 'INAPH ID #1209 4420 9021' },
      { date: '12 May 2026', title: 'Routine Annual Booster', note: 'FMD and HS vaccination completed' },
      { date: '20 Aug 2026', title: 'Clinical Milk Quality Audit', note: '7.4% Fat, 9.2% SNF verified at NDDB testing center' },
      { date: '02 Sep 2026', title: 'Listed on BREEDIFY Marketplace', note: 'Active listing verified by Rohtak Veterinary Officer' }
    ],
    listingStatus: 'active',
    views: 512,
    saves: 45,
    interestedBuyers: 11,
    createdAt: '2026-09-02T08:15:00Z',
    updatedAt: '2026-09-04T15:20:00Z'
  },
  {
    listingId: 'MKT-IN-903',
    animalId: 'BOV-CALF-0091',
    species: 'Cattle',
    breed: 'Gir Heifer Calf',
    breedConfidence: 0.95,
    breedVerificationStatus: 'verified',
    gender: 'Female',
    ageGroup: 'Calf',
    estimatedAge: '9 Months',
    dateOfBirth: '2025-12-05',
    weight: '115 kg',
    colour: 'Deep Speckled Red with White Forehead',
    earTag: 'PENDING-REG-091',
    officialAnimalId: 'Pending Registration',
    identificationStatus: 'Pending Registration',
    pregnancyStatus: 'Not Pregnant',
    pregnancyVerification: 'verified',
    expectedCalvingDate: null,
    monthsPregnant: 0,
    previousCalvings: 0,
    lastCalvingDate: null,
    milkYield: 'Expected 18+ L/day at maturity',
    fatPercentage: 'Pedigree A2 4.9%',
    snfPercentage: '8.8% SNF',
    healthStatus: 'Healthy',
    vaccinationStatus: 'Primary Calf Vaccines Complete (FMD, Brucellosis Cotton S19)',
    veterinaryVerification: 'verified',
    lastVetCheck: '2026-08-25',
    dewormingDate: '2026-08-10',
    images: [
      '/breeds/calf.jpg',
      '/breeds/gir.jpg',
      '/breeds/sahiwal.jpg'
    ],
    video: null,
    sellerId: 'usr_farmer_gir_breeder',
    sellerDetails: {
      name: 'Bhaveshbhai Vala',
      village: 'Talala',
      district: 'Gir Somnath',
      state: 'Gujarat',
      mobile: '+91 98252 61140',
      sellerType: 'Breeder',
      verifiedSeller: true,
      sellerRating: 4.8,
      animalsSold: 19,
      memberSince: 'February 2023'
    },
    location: 'Gir Somnath, Gujarat',
    mandiDistance: '8.0 km from Junagadh Cattle Market',
    price: 38000,
    negotiable: false,
    pickupAvailable: true,
    deliveryAvailable: true,
    availableFrom: 'Immediate',
    reasonForSelling: 'Dedicated pureline Gir heifer breeding program.',
    description: 'Promising young Gir heifer calf with classic convex forehead, pendulous bell-shaped ears, alert sawai stance, and prominent dewlap. Mother is an elite 20 L/day Gir cow (Pashu Aadhaar #1209 8891 4401). Official Pashu Aadhaar ear tag is currently pending district registration. Vaccinated against Brucellosis with certificate.',
    historyTimeline: [
      { date: '05 Dec 2025', title: 'Calf Born at Talala Farm', note: 'Dam ID: GJ-GIR-491 (20 L/day). Sire: Balaram Elite Gir Bull' },
      { date: '15 Jan 2026', title: 'Colostrum & Deworming Completed', note: 'Oral dewormer administered' },
      { date: '10 Apr 2026', title: 'Brucellosis Calfhood Vaccination', note: 'Cotton Strain 19 administered by Talala Veterinary Officer' },
      { date: '25 Aug 2026', title: 'Growth & Frame Assessment', note: 'Optimal bone density and frame development' },
      { date: '03 Sep 2026', title: 'Listed on BREEDIFY Marketplace', note: 'Calf identity logged with Dam verification' }
    ],
    listingStatus: 'active',
    views: 420,
    saves: 52,
    interestedBuyers: 9,
    createdAt: '2026-09-03T11:00:00Z',
    updatedAt: '2026-09-04T14:10:00Z'
  },
  {
    listingId: 'MKT-IN-904',
    animalId: 'BOV-IN-007712',
    species: 'Cattle',
    breed: 'Kankrej Breeding Bull',
    breedConfidence: 0.99,
    breedVerificationStatus: 'verified',
    gender: 'Male',
    ageGroup: 'Adult',
    estimatedAge: '3.5 Years',
    dateOfBirth: '2023-02-18',
    weight: '580 kg',
    colour: 'Silver Grey with Dark Shoulder Hump',
    earTag: 'TAG-IN-7712',
    officialAnimalId: '1209 7712 5502',
    identificationStatus: 'Official Pashu Aadhaar',
    pregnancyStatus: 'Not Applicable',
    pregnancyVerification: 'verified',
    expectedCalvingDate: null,
    monthsPregnant: 0,
    previousCalvings: 0,
    lastCalvingDate: null,
    milkYield: 'Maternal Pedigree: 17 L/day',
    fatPercentage: '4.6% Butterfat',
    snfPercentage: '8.8% SNF',
    healthStatus: 'Healthy',
    vaccinationStatus: 'Fully Vaccinated (FMD, HS, BQ, Theileriosis)',
    veterinaryVerification: 'verified',
    lastVetCheck: '2026-08-10',
    dewormingDate: '2026-07-25',
    images: [
      '/breeds/kankrej.jpg',
      '/breeds/tharparkar.jpg',
      '/breeds/ongole.jpg'
    ],
    video: null,
    sellerId: 'usr_farmer_kankrej',
    sellerDetails: {
      name: 'Devraj Rabari',
      village: 'Tharad',
      district: 'Banaskantha',
      state: 'Gujarat',
      mobile: '+91 97230 45511',
      sellerType: 'Breeder',
      verifiedSeller: true,
      sellerRating: 4.9,
      animalsSold: 8,
      memberSince: 'April 2023'
    },
    location: 'Banaskantha, Gujarat',
    mandiDistance: '12.0 km from Deesa APMC Mandi',
    price: 120000,
    negotiable: true,
    pickupAvailable: true,
    deliveryAvailable: false,
    availableFrom: 'Immediate',
    reasonForSelling: 'Available for village breed improvement or Gaushala semen collection.',
    description: 'Magnificent purebred Kankrej bull exhibiting majestic lyre-shaped horns, muscular thoracic hump, powerful dewlap, and trademark sawai chaal gait. Andrology and semen motility tested >85%. Free from genetic and infectious bovine reproductive disorders.',
    historyTimeline: [
      { date: '18 Feb 2023', title: 'Birth Recorded', note: 'Dam: 17 L/day Kankrej cow. Sire: Tharad Champion Sire' },
      { date: '15 Mar 2023', title: 'Tagged & Registered', note: 'INAPH #1209 7712 5502' },
      { date: '10 May 2026', title: 'Booster Vaccinations', note: 'FMD, HS, BQ administered' },
      { date: '10 Aug 2026', title: 'Breeding Soundness Evaluation', note: 'Certified by Veterinary College Dantiwada' }
    ],
    listingStatus: 'active',
    views: 298,
    saves: 34,
    interestedBuyers: 5,
    createdAt: '2026-09-02T14:20:00Z',
    updatedAt: '2026-09-04T10:00:00Z'
  },
  {
    listingId: 'MKT-IN-905',
    animalId: 'BOV-IN-006219',
    species: 'Buffalo',
    breed: 'Jaffarabadi Buffalo',
    breedConfidence: 0.96,
    breedVerificationStatus: 'verified',
    gender: 'Female',
    ageGroup: 'Adult',
    estimatedAge: '6.0 Years',
    dateOfBirth: '2020-08-12',
    weight: '620 kg',
    colour: 'Deep Black with Massive Frontal Dome',
    earTag: 'TAG-IN-6219',
    officialAnimalId: '1209 6219 8810',
    identificationStatus: 'Official Pashu Aadhaar',
    pregnancyStatus: 'Pregnant',
    pregnancyVerification: 'verified',
    expectedCalvingDate: '2026-12-10',
    monthsPregnant: 6,
    previousCalvings: 3,
    lastCalvingDate: '2025-05-18',
    milkYield: '20 – 24 Liters / day',
    fatPercentage: '8.2% Butterfat',
    snfPercentage: '9.4% SNF',
    healthStatus: 'Healthy',
    vaccinationStatus: 'Fully Vaccinated',
    veterinaryVerification: 'verified',
    lastVetCheck: '2026-08-18',
    dewormingDate: '2026-07-30',
    images: [
      '/breeds/jaffarabadi.jpg',
      '/breeds/murrah.jpg',
      '/breeds/surti.jpg'
    ],
    video: null,
    sellerId: 'usr_farmer_jaffarabadi',
    sellerDetails: {
      name: 'Mansukhbhai Ahir',
      village: 'Kodinar',
      district: 'Gir Somnath',
      state: 'Gujarat',
      mobile: '+91 94280 91823',
      sellerType: 'Dairy Owner',
      verifiedSeller: true,
      sellerRating: 4.9,
      animalsSold: 12,
      memberSince: 'May 2023'
    },
    location: 'Gir Somnath, Gujarat',
    mandiDistance: '5.5 km from Kodinar Mandi',
    price: 115000,
    negotiable: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    availableFrom: 'Immediate',
    reasonForSelling: 'Relocating dairy farm facilities.',
    description: 'Heaviest riverine buffalo breed in India. Extremely docile temperament with massive drooping horns shielding eyes. Record 22 liters daily at 8.2% fat during peak lactation. Confirmed 6 months pregnant, ready for high-yield winter calving.',
    historyTimeline: [
      { date: '12 Aug 2020', title: 'Birth Recorded', note: 'Gir coastal region pedigree' },
      { date: '10 Mar 2026', title: 'AI Insemination', note: 'Superior Jaffarabadi bull semen' },
      { date: '18 Aug 2026', title: '6-Month Ultrasound Check', note: 'Healthy single fetus confirmed by Dr. K. M. Solanki' }
    ],
    listingStatus: 'active',
    views: 388,
    saves: 41,
    interestedBuyers: 7,
    createdAt: '2026-09-01T15:00:00Z',
    updatedAt: '2026-09-04T09:30:00Z'
  },
  {
    listingId: 'MKT-IN-906',
    animalId: 'BOV-CALF-0074',
    species: 'Cattle',
    breed: 'Ongole Calf',
    breedConfidence: 0.94,
    breedVerificationStatus: 'ai_estimated',
    gender: 'Male',
    ageGroup: 'Young',
    estimatedAge: '14 Months',
    dateOfBirth: '2025-07-08',
    weight: '190 kg',
    colour: 'White Grey with Black Muzzle & Hooves',
    earTag: 'TAG-AP-0074',
    officialAnimalId: 'Pending Registration',
    identificationStatus: 'Pending Registration',
    pregnancyStatus: 'Not Applicable',
    pregnancyVerification: 'unverified',
    expectedCalvingDate: null,
    monthsPregnant: 0,
    previousCalvings: 0,
    lastCalvingDate: null,
    milkYield: 'Maternal: 14 L/day',
    fatPercentage: '4.5% Butterfat',
    snfPercentage: '8.7% SNF',
    healthStatus: 'Healthy',
    vaccinationStatus: 'Dewormed & FMD Vaccinated',
    veterinaryVerification: 'unverified',
    lastVetCheck: '2026-07-28',
    dewormingDate: '2026-07-28',
    images: [
      '/breeds/ongole.jpg',
      '/breeds/calf.jpg',
      '/breeds/kangayam.jpg'
    ],
    video: null,
    sellerId: 'usr_farmer_ongole',
    sellerDetails: {
      name: 'K. Sambasiva Rao',
      village: 'Chebrole',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      mobile: '+91 98480 33412',
      sellerType: 'Farmer',
      verifiedSeller: false,
      sellerRating: 4.6,
      animalsSold: 4,
      memberSince: 'September 2023'
    },
    location: 'Guntur, Andhra Pradesh',
    mandiDistance: '9.0 km from Tenali Mandi',
    price: 45000,
    negotiable: true,
    pickupAvailable: true,
    deliveryAvailable: false,
    availableFrom: 'Immediate',
    reasonForSelling: 'Young bull rearing for working draught or stud improvement.',
    description: 'Vigorous young Ongole bull calf with prominent hump, muscular legs, black hooves, and heat tolerance. Ideal candidate for organic zero-budget natural farming (ZBNF) or pedigree breeding.',
    historyTimeline: [
      { date: '08 Jul 2025', title: 'Birth in Guntur', note: 'Pure Ongole rural stock' },
      { date: '28 Jul 2026', title: 'Primary Deworming & Health Review', note: 'Reported healthy and active' }
    ],
    listingStatus: 'active',
    views: 210,
    saves: 18,
    interestedBuyers: 3,
    createdAt: '2026-09-03T16:45:00Z',
    updatedAt: '2026-09-04T08:00:00Z'
  },
  {
    listingId: 'MKT-IN-907',
    animalId: 'BOV-IN-003310',
    species: 'Cattle',
    breed: 'Rathi Cow',
    breedConfidence: 0.93,
    breedVerificationStatus: 'verified',
    gender: 'Female',
    ageGroup: 'Adult',
    estimatedAge: '4.8 Years',
    dateOfBirth: '2021-10-04',
    weight: '360 kg',
    colour: 'Brown with White Spots (Kabra)',
    earTag: 'TAG-RJ-3310',
    officialAnimalId: '1209 3310 7721',
    identificationStatus: 'Official Pashu Aadhaar',
    pregnancyStatus: 'Not Pregnant',
    pregnancyVerification: 'verified',
    expectedCalvingDate: null,
    monthsPregnant: 0,
    previousCalvings: 2,
    lastCalvingDate: '2026-01-20',
    milkYield: '14 – 16 Liters / day',
    fatPercentage: '4.7% Butterfat',
    snfPercentage: '8.9% SNF',
    healthStatus: 'Healthy',
    vaccinationStatus: 'Fully Vaccinated',
    veterinaryVerification: 'verified',
    lastVetCheck: '2026-08-05',
    dewormingDate: '2026-07-15',
    images: [
      '/breeds/rathi.jpg',
      '/breeds/tharparkar.jpg',
      '/breeds/sahiwal.jpg'
    ],
    video: null,
    sellerId: 'usr_farmer_rathi',
    sellerDetails: {
      name: 'Rameshwar Lal Bishnoi',
      village: 'Nokha',
      district: 'Bikaner',
      state: 'Rajasthan',
      mobile: '+91 94140 77122',
      sellerType: 'Farmer',
      verifiedSeller: true,
      sellerRating: 4.7,
      animalsSold: 9,
      memberSince: 'June 2023'
    },
    location: 'Bikaner, Rajasthan',
    mandiDistance: '14.0 km from Bikaner Cattle Market',
    price: 62000,
    negotiable: true,
    pickupAvailable: true,
    deliveryAvailable: true,
    availableFrom: 'Immediate',
    reasonForSelling: 'Herd consolidation before harvest season.',
    description: 'Hardy desert-adapted Rathi dairy cow known for excellent feed-to-milk conversion and disease resistance. Produces rich creamy A2 milk under harsh weather conditions.',
    historyTimeline: [
      { date: '04 Oct 2021', title: 'Birth Recorded in Nokha', note: 'Pure Rathi dual-purpose line' },
      { date: '10 May 2026', title: 'FMD Vaccination', note: 'Administered by Veterinary Sub-Center Nokha' }
    ],
    listingStatus: 'active',
    views: 195,
    saves: 22,
    interestedBuyers: 4,
    createdAt: '2026-09-02T18:00:00Z',
    updatedAt: '2026-09-04T07:15:00Z'
  }
];

// Initial purchase requests seed
export const INITIAL_PURCHASE_REQUESTS = [
  {
    requestId: 'REQ-2026-001',
    listingId: 'MKT-IN-901',
    animalName: 'Sahiwal Cow (4.5 Yrs)',
    species: 'Cattle',
    breed: 'Sahiwal Cow',
    askingPrice: 88000,
    offeredPrice: 84000,
    sellerName: 'Gurpreet Singh Dhillon',
    sellerMobile: '+91 98140 22319',
    buyerId: 'usr_demo',
    buyerName: 'Bandela Revanth',
    buyerMobile: '+91 98765 43210',
    buyerLocation: 'Hyderabad, Telangana',
    message: 'Interested in this pregnant Sahiwal cow. Can you arrange transport to Telangana or will Mandi pickup be required?',
    status: 'Negotiation', // 'Sent' | 'Seller Responded' | 'Negotiation' | 'Accepted' | 'Sold'
    timeline: [
      { step: 'Sent', date: '2026-09-02 14:30', note: 'Purchase offer ₹84,000 sent to seller' },
      { step: 'Seller Responded', date: '2026-09-03 09:15', note: 'Seller offered ₹85,500 including transit health certificate' },
      { step: 'Negotiation', date: '2026-09-03 16:00', note: 'Discussing final delivery logistics and veterinary transit permit' }
    ],
    createdAt: '2026-09-02T14:30:00Z'
  }
];

export function normalizeListing(l) {
  if (!l) return null;
  const id = l.listingId || l.id || 'MKT-IN-901';
  const rawList = (l.images && l.images.length > 0) ? l.images : ((l.photos && l.photos.length > 0) ? l.photos : []);
  let cleanImages = rawList.map(img => {
    if (typeof img === 'string') {
      if (img.includes('/stickers/') || img.includes('unsplash.com')) {
        return getRealisticBreedImage(l.breed, l.species);
      }
      if ((l.breed || '').toLowerCase().includes('ongole') && img.includes('/breeds/calf.jpg')) {
        return '/breeds/ongole.jpg';
      }
    }
    return img;
  }).filter(Boolean);

  if (cleanImages.length === 0) {
    cleanImages = [getRealisticBreedImage(l.breed, l.species)];
  }

  return {
    ...l,
    id: id,
    listingId: id,
    title: l.title || `${l.breed} (${l.estimatedAge || l.age || 'Adult'})`,
    photos: cleanImages,
    images: cleanImages,
    age: l.age || l.estimatedAge || '3.5 Years',
    estimatedAge: l.estimatedAge || l.age || '3.5 Years',
    verified: l.verified !== undefined ? l.verified : (l.breedVerificationStatus === 'verified'),
    breedVerificationStatus: l.breedVerificationStatus || (l.verified ? 'verified' : 'ai_estimated'),
    status: l.status || l.listingStatus || 'active',
    listingStatus: l.listingStatus || l.status || 'active',
    seller: l.seller || l.sellerDetails || {
      name: 'Ramesh Patel',
      location: l.location || 'Anand, Gujarat',
      phone: '+91 98765 43210'
    },
    sellerDetails: l.sellerDetails || l.seller || {
      name: 'Ramesh Patel',
      village: 'Anand',
      district: 'Anand',
      state: 'Gujarat',
      mobile: '+91 98765 43210',
      sellerType: 'Farmer',
      verifiedSeller: true
    }
  };
}

// Read listings
export function getListings(filters = {}, sort = 'newest') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let listings = raw ? JSON.parse(raw) : INITIAL_LISTINGS;
    let needsUpdate = !raw;
    listings = listings.map(l => {
      const norm = normalizeListing(l);
      if (JSON.stringify(l.images) !== JSON.stringify(norm.images)) {
        needsUpdate = true;
      }
      return norm;
    });
    if (needsUpdate) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    }

    // Apply filtering
    if (filters.species && filters.species !== 'all') {
      listings = listings.filter(l => l.species.toLowerCase() === filters.species.toLowerCase());
    }
    if (filters.ageGroup && filters.ageGroup !== 'all') {
      listings = listings.filter(l => l.ageGroup.toLowerCase() === filters.ageGroup.toLowerCase());
    }
    if (filters.gender && filters.gender !== 'all') {
      listings = listings.filter(l => l.gender.toLowerCase() === filters.gender.toLowerCase());
    }
    if (filters.pregnancy && filters.pregnancy !== 'all') {
      if (filters.pregnancy === 'pregnant') listings = listings.filter(l => l.pregnancyStatus === 'Pregnant');
      else if (filters.pregnancy === 'not_pregnant') listings = listings.filter(l => l.pregnancyStatus === 'Not Pregnant');
    }
    if (filters.verification && filters.verification !== 'all') {
      if (filters.verification === 'verified') listings = listings.filter(l => l.breedVerificationStatus === 'verified');
      else if (filters.verification === 'unverified') listings = listings.filter(l => l.breedVerificationStatus !== 'verified');
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      listings = listings.filter(l =>
        l.breed?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.sellerDetails?.name?.toLowerCase().includes(q) ||
        l.listingId?.toLowerCase().includes(q) ||
        l.officialAnimalId?.toLowerCase().includes(q)
      );
    }
    if (filters.maxPrice) {
      listings = listings.filter(l => l.price <= Number(filters.maxPrice));
    }
    if (filters.minPrice) {
      listings = listings.filter(l => l.price >= Number(filters.minPrice));
    }

    // Sorting
    if (sort === 'price_asc') {
      listings.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      listings.sort((a, b) => b.price - a.price);
    } else if (sort === 'verified_first') {
      listings.sort((a, b) => (b.breedVerificationStatus === 'verified' ? 1 : 0) - (a.breedVerificationStatus === 'verified' ? 1 : 0));
    } else {
      // Newest
      listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return listings.map(normalizeListing);
  } catch (err) {
    console.error('Error reading marketplace listings:', err);
    return INITIAL_LISTINGS.map(normalizeListing);
  }
}

export function getListingById(id) {
  if (!id) return null;
  const listings = getListings();
  const found = listings.find(l => 
    l.listingId === id || 
    l.id === id || 
    l.animalId === id ||
    l.listingId?.toLowerCase() === id?.toLowerCase() ||
    l.id?.toLowerCase() === id?.toLowerCase()
  );
  return found ? normalizeListing(found) : null;
}

// Background self-healing initialization for Firestore
let isFirestoreInitTriggered = false;
export async function triggerFirestoreInitialization() {
  if (isFirestoreInitTriggered) return;
  isFirestoreInitTriggered = true;
  try {
    await initializeFirestoreDatabaseIfEmpty(INITIAL_LISTINGS, SAMPLE_ANIMALS);
  } catch (err) {
    console.warn('Firestore initialization notice:', err?.message || err);
  }
}
triggerFirestoreInitialization();

/**
 * Async fetch of listings from Cloud Firestore with local cache sync
 */
export async function fetchListingsFromFirestore(filters = {}, sortBy = 'newest') {
  try {
    const remote = await fsGetSaleListings(filters, sortBy);
    if (remote && remote.length > 0) {
      const normalized = remote.map(normalizeListing);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch (err) {
    console.warn('Firestore fetchListings notice (falling back to cache):', err?.message || err);
  }
  return getListings(filters, sortBy);
}

/**
 * Async fetch of single listing from Cloud Firestore
 */
export async function fetchListingByIdFromFirestore(id) {
  try {
    const remote = await fsGetSaleListingById(id);
    if (remote) {
      return normalizeListing(remote);
    }
  } catch (err) {
    console.warn('Firestore fetchListingById notice:', err?.message || err);
  }
  return getListingById(id);
}

export function saveListing(listingData) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const listings = raw ? JSON.parse(raw) : [...INITIAL_LISTINGS];

    const newListing = {
      ...listingData,
      id: listingData.id || `mkt-${Date.now().toString().slice(-6)}`,
      listingId: listingData.listingId || `MKT-IN-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 1,
      saves: 0,
      interestedBuyers: 0,
      listingStatus: listingData.listingStatus || 'active'
    };

    listings.unshift(newListing);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));

    // Asynchronously replicate to Cloud Firestore
    fsCreateSaleListing(newListing).catch(err => {
      console.warn('Firestore replication notice:', err?.message || err);
    });

    return newListing;
  } catch (err) {
    console.error('Error saving listing:', err);
    return null;
  }
}

/**
 * Async save listing directly awaiting Cloud Firestore write
 */
export async function saveListingAsync(listingData) {
  const local = saveListing(listingData);
  try {
    await fsCreateSaleListing(local);
  } catch (err) {
    console.warn('Firestore saveListingAsync write notice:', err?.message || err);
  }
  return local;
}

export function updateListing(listingId, updates) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let listings = raw ? JSON.parse(raw) : [...INITIAL_LISTINGS];
    const index = listings.findIndex(l => l.listingId === listingId);
    if (index === -1) return null;

    listings[index] = {
      ...listings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));

    // Asynchronously replicate to Cloud Firestore
    fsUpdateSaleListing(listingId, updates).catch(err => {
      console.warn('Firestore update replication notice:', err?.message || err);
    });

    return listings[index];
  } catch (err) {
    console.error('Error updating listing:', err);
    return null;
  }
}

export async function updateListingAsync(listingId, updates) {
  const local = updateListing(listingId, updates);
  try {
    await fsUpdateSaleListing(listingId, updates);
  } catch (err) {
    console.warn('Firestore updateListingAsync notice:', err?.message || err);
  }
  return local;
}

export function deleteListing(listingId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let listings = raw ? JSON.parse(raw) : [...INITIAL_LISTINGS];
    listings = listings.filter(l => l.listingId !== listingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));

    // Asynchronously replicate to Cloud Firestore
    fsDeleteSaleListing(listingId).catch(err => {
      console.warn('Firestore delete replication notice:', err?.message || err);
    });

    return true;
  } catch (err) {
    console.error('Error deleting listing:', err);
    return false;
  }
}

export async function deleteListingAsync(listingId) {
  const local = deleteListing(listingId);
  try {
    await fsDeleteSaleListing(listingId);
  } catch (err) {
    console.warn('Firestore deleteListingAsync notice:', err?.message || err);
  }
  return local;
}

// Saved / Bookmarked animals
export function getSavedListingIds() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : ['MKT-IN-901', 'MKT-IN-903'];
  } catch {
    return ['MKT-IN-901', 'MKT-IN-903'];
  }
}

export function toggleSaveListing(listingId) {
  try {
    const saved = getSavedListingIds();
    let updated;
    const isAlreadySaved = saved.includes(listingId);
    if (isAlreadySaved) {
      updated = saved.filter(id => id !== listingId);
    } else {
      updated = [...saved, listingId];
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
    return !isAlreadySaved;
  } catch (err) {
    console.error('Error toggling saved listing:', err);
    return false;
  }
}

export function getSavedListings() {
  const savedIds = getSavedListingIds();
  const all = getListings();
  return all.filter(l => savedIds.includes(l.listingId));
}

export function normalizePurchaseRequest(req) {
  if (!req) return null;
  const id = req.requestId || req.id || 'REQ-1';
  return {
    ...req,
    id,
    requestId: id,
    animalTitle: req.animalTitle || req.animalName || 'Bovine Listing',
    sellerPhone: req.sellerPhone || req.sellerMobile || '+91 98765 43210',
    sellerMobile: req.sellerMobile || req.sellerPhone || '+91 98765 43210'
  };
}

// Purchase Requests
export function getPurchaseRequests() {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_PURCHASE_REQUESTS));
      return INITIAL_PURCHASE_REQUESTS.map(normalizePurchaseRequest);
    }
    return JSON.parse(raw).map(normalizePurchaseRequest);
  } catch {
    return INITIAL_PURCHASE_REQUESTS.map(normalizePurchaseRequest);
  }
}

export function createPurchaseRequest(requestData) {
  try {
    const requests = getPurchaseRequests();
    const newReq = {
      ...requestData,
      id: requestData.id || `req-${Date.now().toString().slice(-6)}`,
      requestId: `REQ-${Date.now().toString().slice(-5)}`,
      status: 'Sent',
      timeline: [
        { step: 'Sent', date: new Date().toLocaleString(), note: `Purchase request for ₹${requestData.offeredPrice || ''} submitted` }
      ],
      createdAt: new Date().toISOString()
    };
    requests.unshift(newReq);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));

    // Increment interested buyers on listing
    const listing = getListingById(requestData.listingId);
    if (listing) {
      updateListing(requestData.listingId, {
        interestedBuyers: (listing.interestedBuyers || 0) + 1
      });
    }

    return newReq;
  } catch (err) {
    console.error('Error creating purchase request:', err);
    return null;
  }
}

export function updatePurchaseRequestStatus(requestId, newStatus, note = '') {
  try {
    const requests = getPurchaseRequests();
    const idx = requests.findIndex(r => r.requestId === requestId || r.id === requestId);
    if (idx === -1) return null;

    requests[idx].status = newStatus;
    requests[idx].timeline = requests[idx].timeline || [];
    requests[idx].timeline.push({
      step: newStatus,
      date: new Date().toLocaleString(),
      note: note || `Status updated to ${newStatus}`
    });

    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    return requests[idx];
  } catch (err) {
    console.error('Error updating purchase request status:', err);
    return null;
  }
}

// Marketplace Summary Stats
export function getMarketplaceStats() {
  const listings = getListings();
  const total = listings.length;
  const cattle = listings.filter(l => l.species === 'Cattle').length;
  const buffalo = listings.filter(l => l.species === 'Buffalo').length;
  const calves = listings.filter(l => l.ageGroup === 'Calf').length;
  const pregnant = listings.filter(l => l.pregnancyStatus === 'Pregnant').length;
  const verified = listings.filter(l => l.breedVerificationStatus === 'verified').length;
  const active = listings.filter(l => l.listingStatus === 'active').length;
  const sold = listings.filter(l => l.listingStatus === 'sold').length;
  const totalRevenue = listings
    .filter(l => l.listingStatus === 'sold')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalViews = listings.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return {
    total,
    cattle,
    buffalo,
    calves,
    pregnant,
    verified,
    active,
    sold,
    totalRevenue,
    totalViews,
    purchaseRequestsCount: getPurchaseRequests().length,
    savedCount: getSavedListingIds().length
  };
}
