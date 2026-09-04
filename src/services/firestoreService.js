import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase.js';

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  CATTLE: 'cattle',
  BUFFALOES: 'buffaloes',
  SALE_LISTINGS: 'saleListings',
  BREED_INFO: 'breedInformation',
  DISEASE_RECORDS: 'diseaseRecords'
};

/* =========================================================================
   1. USER PROFILE OPERATIONS (users)
   ========================================================================= */

/**
 * Create or update a user profile document in Firestore
 */
export async function setUserProfile(userData) {
  if (!userData || (!userData.id && !userData.uid)) {
    throw new Error('User ID is required to set profile');
  }
  const userId = userData.id || userData.uid;
  const userRef = doc(db, COLLECTIONS.USERS, userId);

  const payload = {
    uid: userId,
    id: userId,
    name: userData.name || 'Farmer',
    mobile: userData.mobile || '',
    location: userData.location || '',
    role: userData.role || 'farmer',
    preferred_language: userData.preferred_language || 'en',
    updatedAt: new Date().toISOString()
  };

  if (!userData.createdAt) {
    payload.createdAt = new Date().toISOString();
  }

  await setDoc(userRef, payload, { merge: true });
  return payload;
}

/**
 * Retrieve user profile by user ID
 */
export async function getUserProfile(userId) {
  if (!userId) return null;
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/* =========================================================================
   2. ANIMAL CRUD OPERATIONS (cattle & buffaloes)
   ========================================================================= */

/**
 * Determine target collection based on animal type
 */
export function getAnimalCollectionName(animalType) {
  const type = (animalType || '').toLowerCase();
  return type.includes('buffalo') ? COLLECTIONS.BUFFALOES : COLLECTIONS.CATTLE;
}

/**
 * Standardize an animal record for Firestore
 */
export function formatAnimalRecord(data, id = null) {
  const isBuffalo = (data.animalType || data.species || '').toLowerCase().includes('buffalo');
  const now = new Date().toISOString();

  return {
    id: id || data.id || data.bpaId || data.tagNumber || `BOV-${Date.now().toString().slice(-6)}`,
    animalType: isBuffalo ? 'buffalo' : 'cattle',
    breed: data.breed || (isBuffalo ? 'Murrah Buffalo' : 'Gir Cow'),
    age: data.age || data.estimatedAge || '3.5 Years',
    gender: data.gender || 'Female',
    pregnancyStatus: data.pregnancyStatus || 'Not Pregnant',
    healthStatus: data.healthStatus || 'Healthy',
    ownerInformation: {
      name: data.ownerInformation?.name || data.owner?.name || data.sellerName || 'Ramesh Patel',
      mobile: data.ownerInformation?.mobile || data.owner?.mobile || data.sellerContact || '+91 98765 43210',
      location: data.ownerInformation?.location || data.location || 'Anand, Gujarat',
      farmName: data.ownerInformation?.farmName || data.owner?.farmName || 'Kisan Dairy Farm'
    },
    bpaId: data.bpaId || data.officialAnimalId || data.tagNumber || data.inaphTag || `TAG-IN-${Date.now().toString().slice(-4)}`,
    location: data.location || 'Anand, Gujarat',
    imageUrl: data.imageUrl || data.animalImage || data.photo || (data.images && data.images[0]) || (isBuffalo ? '/breeds/murrah.jpg' : '/breeds/gir.jpg'),
    createdAt: data.createdAt || now,
    updatedAt: now,
    // Supplementary metadata
    weight: data.weight || '380 kg',
    color: data.color || data.colour || 'Standard',
    milkYield: data.milkYield || '14 - 18 Liters / day',
    vaccinationStatus: data.vaccinationStatus || 'Fully Vaccinated'
  };
}

/**
 * CREATE: Add an animal to cattle or buffaloes collection
 */
export async function createAnimalRecord(animalData) {
  const formatted = formatAnimalRecord(animalData);
  const collName = getAnimalCollectionName(formatted.animalType);
  const docRef = doc(db, collName, formatted.id);
  await setDoc(docRef, formatted);
  return formatted;
}

/**
 * READ: Get an animal by ID from cattle or buffaloes
 */
export async function getAnimalRecord(animalId, animalType = null) {
  if (!animalId) return null;

  // If animalType is specified, query directly
  if (animalType) {
    const collName = getAnimalCollectionName(animalType);
    const snap = await getDoc(doc(db, collName, animalId));
    return snap.exists() ? snap.data() : null;
  }

  // Otherwise check cattle first, then buffaloes
  const cattleSnap = await getDoc(doc(db, COLLECTIONS.CATTLE, animalId));
  if (cattleSnap.exists()) return cattleSnap.data();

  const buffaloSnap = await getDoc(doc(db, COLLECTIONS.BUFFALOES, animalId));
  if (buffaloSnap.exists()) return buffaloSnap.data();

  return null;
}

/**
 * UPDATE: Update an animal record
 */
export async function updateAnimalRecord(animalId, animalType, updates) {
  if (!animalId) throw new Error('Animal ID required for update');
  const collName = getAnimalCollectionName(animalType);
  const docRef = doc(db, collName, animalId);
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(docRef, payload);
  return { id: animalId, ...payload };
}

/**
 * DELETE: Delete an animal record
 */
export async function deleteAnimalRecord(animalId, animalType) {
  if (!animalId) throw new Error('Animal ID required for delete');
  const collName = getAnimalCollectionName(animalType);
  await deleteDoc(doc(db, collName, animalId));
  return true;
}

/**
 * READ ALL: List all animals in a collection
 */
export async function getAllAnimals(animalType = 'cattle') {
  const collName = getAnimalCollectionName(animalType);
  const snap = await getDocs(collection(db, collName));
  const animals = [];
  snap.forEach(docSnap => {
    animals.push(docSnap.data());
  });
  return animals;
}

/* =========================================================================
   3. SALE LISTINGS CRUD & FILTERING (saleListings)
   ========================================================================= */

/**
 * Standardize a sale listing record for Firestore
 */
export function formatSaleListing(data, id = null) {
  const isBuffalo = (data.animalType || data.species || '').toLowerCase().includes('buffalo');
  const now = new Date().toISOString();
  const listingId = id || data.listingId || data.id || `MKT-IN-${Date.now().toString().slice(-4)}`;

  return {
    id: listingId,
    listingId: listingId,
    sellerName: data.sellerName || data.sellerDetails?.name || 'Ramesh Patel',
    sellerContact: data.sellerContact || data.sellerDetails?.mobile || data.sellerMobile || '+91 98765 43210',
    animalType: isBuffalo ? 'buffalo' : 'cattle',
    species: isBuffalo ? 'Buffalo' : 'Cattle',
    breed: data.breed || (isBuffalo ? 'Murrah Buffalo' : 'Gir Cow'),
    age: data.age || data.estimatedAge || '3.5 Years',
    gender: data.gender || 'Female',
    pregnancyStatus: data.pregnancyStatus || 'Not Pregnant',
    healthStatus: data.healthStatus || 'Healthy',
    bpaId: data.bpaId || data.officialAnimalId || data.earTag || 'Official Pashu Aadhaar',
    price: Number(data.price || 50000),
    description: data.description || 'Verified livestock available on BREEDIFY Marketplace.',
    location: data.location || 'Anand, Gujarat',
    animalImage: data.animalImage || data.imageUrl || (data.images && data.images[0]) || (isBuffalo ? '/breeds/murrah.jpg' : '/breeds/gir.jpg'),
    images: data.images && data.images.length > 0 ? data.images : [data.animalImage || (isBuffalo ? '/breeds/murrah.jpg' : '/breeds/gir.jpg')],
    listingStatus: data.listingStatus || data.status || 'active',
    createdAt: data.createdAt || now,
    updatedAt: now,
    // Supporting metadata
    negotiable: data.negotiable !== undefined ? data.negotiable : true,
    views: data.views || 0,
    saves: data.saves || 0,
    interestedBuyers: data.interestedBuyers || 0,
    breedVerificationStatus: data.breedVerificationStatus || 'verified',
    sellerId: data.sellerId || 'usr_farmer_1',
    sellerDetails: data.sellerDetails || {
      name: data.sellerName || 'Ramesh Patel',
      mobile: data.sellerContact || '+91 98765 43210',
      village: 'Anand',
      district: 'Anand',
      state: 'Gujarat',
      sellerType: 'Farmer',
      verifiedSeller: true
    }
  };
}

/**
 * CREATE: Create a new sale listing in Firestore
 */
export async function createSaleListing(listingData) {
  const formatted = formatSaleListing(listingData);
  const docRef = doc(db, COLLECTIONS.SALE_LISTINGS, formatted.listingId);
  await setDoc(docRef, formatted);

  // Also auto-register or sync into cattle or buffaloes collection
  try {
    await createAnimalRecord({
      id: formatted.bpaId && formatted.bpaId.startsWith('TAG') ? formatted.bpaId : `ANM-${formatted.listingId}`,
      animalType: formatted.animalType,
      breed: formatted.breed,
      age: formatted.age,
      gender: formatted.gender,
      pregnancyStatus: formatted.pregnancyStatus,
      healthStatus: formatted.healthStatus,
      ownerInformation: {
        name: formatted.sellerName,
        mobile: formatted.sellerContact,
        location: formatted.location
      },
      bpaId: formatted.bpaId,
      location: formatted.location,
      imageUrl: formatted.animalImage
    });
  } catch (syncErr) {
    console.warn('Animal auto-sync from listing notice:', syncErr);
  }

  return formatted;
}

/**
 * READ: Get a single sale listing by listing ID
 */
export async function getSaleListingById(listingId) {
  if (!listingId) return null;
  const docRef = doc(db, COLLECTIONS.SALE_LISTINGS, listingId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * UPDATE: Update a sale listing in Firestore
 */
export async function updateSaleListing(listingId, updates) {
  if (!listingId) throw new Error('Listing ID required for update');
  const docRef = doc(db, COLLECTIONS.SALE_LISTINGS, listingId);
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString()
  };
  await updateDoc(docRef, payload);
  return { listingId, ...payload };
}

/**
 * DELETE: Delete a sale listing from Firestore
 */
export async function deleteSaleListing(listingId) {
  if (!listingId) throw new Error('Listing ID required for delete');
  const docRef = doc(db, COLLECTIONS.SALE_LISTINGS, listingId);
  await deleteDoc(docRef);
  return true;
}

/**
 * READ & FILTER: Query sale listings with rich search and filters
 * Supports:
 * - animal type ('cattle' / 'buffalo')
 * - breed
 * - location
 * - pregnancy status
 * - price (maxPrice, minPrice)
 * - age
 * - text search
 * - sorting ('newest', 'price_asc', 'price_desc', 'verified_first')
 */
export async function getSaleListings(filters = {}, sortBy = 'newest') {
  const collRef = collection(db, COLLECTIONS.SALE_LISTINGS);
  const snap = await getDocs(collRef);
  let listings = [];

  snap.forEach(docSnap => {
    listings.push(docSnap.data());
  });

  // Client-side filtering for composite flexibility
  if (filters.species && filters.species !== 'all') {
    const s = filters.species.toLowerCase();
    listings = listings.filter(l =>
      (l.animalType && l.animalType.toLowerCase() === s) ||
      (l.species && l.species.toLowerCase() === s)
    );
  }

  if (filters.breed && filters.breed !== 'all') {
    const b = filters.breed.toLowerCase();
    listings = listings.filter(l => l.breed && l.breed.toLowerCase().includes(b));
  }

  if (filters.location && filters.location !== 'all') {
    const loc = filters.location.toLowerCase();
    listings = listings.filter(l => l.location && l.location.toLowerCase().includes(loc));
  }

  if (filters.pregnancy && filters.pregnancy !== 'all') {
    if (filters.pregnancy === 'pregnant') {
      listings = listings.filter(l => (l.pregnancyStatus || '').toLowerCase().includes('pregnant') && !(l.pregnancyStatus || '').toLowerCase().includes('not'));
    } else if (filters.pregnancy === 'not_pregnant') {
      listings = listings.filter(l => (l.pregnancyStatus || '').toLowerCase().includes('not'));
    }
  }

  if (filters.gender && filters.gender !== 'all') {
    const g = filters.gender.toLowerCase();
    listings = listings.filter(l => l.gender && l.gender.toLowerCase() === g);
  }

  if (filters.ageGroup && filters.ageGroup !== 'all') {
    const ag = filters.ageGroup.toLowerCase();
    listings = listings.filter(l => (l.ageGroup || l.age || '').toLowerCase().includes(ag));
  }

  if (filters.maxPrice) {
    listings = listings.filter(l => Number(l.price) <= Number(filters.maxPrice));
  }

  if (filters.minPrice) {
    listings = listings.filter(l => Number(l.price) >= Number(filters.minPrice));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    listings = listings.filter(l =>
      (l.breed && l.breed.toLowerCase().includes(q)) ||
      (l.location && l.location.toLowerCase().includes(q)) ||
      (l.sellerName && l.sellerName.toLowerCase().includes(q)) ||
      (l.bpaId && l.bpaId.toLowerCase().includes(q)) ||
      (l.listingId && l.listingId.toLowerCase().includes(q)) ||
      (l.description && l.description.toLowerCase().includes(q))
    );
  }

  // Sorting
  if (sortBy === 'price_asc') {
    listings.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price_desc') {
    listings.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'verified_first') {
    listings.sort((a, b) => (b.breedVerificationStatus === 'verified' ? 1 : 0) - (a.breedVerificationStatus === 'verified' ? 1 : 0));
  } else {
    // Newest first
    listings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return listings;
}

/**
 * Real-time listener for sale listings
 */
export function subscribeToSaleListings(callback, onError = null) {
  const collRef = collection(db, COLLECTIONS.SALE_LISTINGS);
  return onSnapshot(collRef, (snapshot) => {
    const listings = [];
    snapshot.forEach(docSnap => {
      listings.push(docSnap.data());
    });
    callback(listings);
  }, (err) => {
    console.error('Sale listings subscription error:', err);
    if (onError) onError(err);
  });
}

/* =========================================================================
   4. BREED INFORMATION OPERATIONS (breedInformation)
   ========================================================================= */

/**
 * Retrieve breed information by breed ID
 */
export async function getBreedInformation(breedId) {
  if (!breedId) return null;
  const docRef = doc(db, COLLECTIONS.BREED_INFO, breedId.toLowerCase());
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Retrieve all registered breeds from Firestore
 */
export async function getAllBreedsFromFirestore() {
  const collRef = collection(db, COLLECTIONS.BREED_INFO);
  const snap = await getDocs(collRef);
  const breeds = [];
  snap.forEach(docSnap => {
    breeds.push(docSnap.data());
  });
  return breeds;
}

/* =========================================================================
   5. DISEASE RECORDS OPERATIONS (diseaseRecords)
   ========================================================================= */

/**
 * Retrieve disease records from Firestore
 */
export async function getDiseaseRecordsFromFirestore() {
  const collRef = collection(db, COLLECTIONS.DISEASE_RECORDS);
  const snap = await getDocs(collRef);
  const records = [];
  snap.forEach(docSnap => {
    records.push(docSnap.data());
  });
  return records;
}

/**
 * Log a new disease or clinical diagnosis incident
 */
export async function logDiseaseRecord(recordData) {
  const id = recordData.id || `INC-${Date.now()}`;
  const docRef = doc(db, COLLECTIONS.DISEASE_RECORDS, id);
  const payload = {
    ...recordData,
    id,
    loggedAt: new Date().toISOString()
  };
  await setDoc(docRef, payload);
  return payload;
}

/* =========================================================================
   6. DASHBOARD AGGREGATED STATS (Connected to Firestore)
   ========================================================================= */

/**
 * Fetch real aggregate statistics across Firestore collections for the Dashboard
 */
export async function getFirestoreDashboardStats() {
  try {
    const [cattleSnap, buffaloSnap, listingsSnap] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.CATTLE)),
      getDocs(collection(db, COLLECTIONS.BUFFALOES)),
      getDocs(collection(db, COLLECTIONS.SALE_LISTINGS))
    ]);

    const cattleCount = cattleSnap.size;
    const buffaloCount = buffaloSnap.size;
    const totalAnimals = cattleCount + buffaloCount;

    const listings = [];
    listingsSnap.forEach(d => listings.push(d.data()));

    const activeListings = listings.filter(l => l.listingStatus === 'active');
    const soldListings = listings.filter(l => l.listingStatus === 'sold');
    const pregnantCount = listings.filter(l =>
      (l.pregnancyStatus || '').toLowerCase().includes('pregnant') &&
      !(l.pregnancyStatus || '').toLowerCase().includes('not')
    ).length;
    const verifiedCount = listings.filter(l => l.breedVerificationStatus === 'verified').length;

    return {
      totalAnimals,
      cattleCount,
      buffaloCount,
      totalListings: listings.length,
      activeListingsCount: activeListings.length,
      soldListingsCount: soldListings.length,
      pregnantCount,
      verifiedCount,
      averageListingPrice: activeListings.length
        ? Math.round(activeListings.reduce((sum, l) => sum + (Number(l.price) || 0), 0) / activeListings.length)
        : 0
    };
  } catch (err) {
    console.warn('Error computing Firestore dashboard stats:', err);
    return null;
  }
}

/* =========================================================================
   7. INITIAL SEEDING / SYNC UTILITY (If collections are empty)
   ========================================================================= */

/**
 * Initializes Firestore collections with foundational data if currently empty.
 * This guarantees the user has active, real database records upon connecting.
 */
export async function initializeFirestoreDatabaseIfEmpty(initialListings = [], initialBreeds = [], initialDiseases = []) {
  try {
    // 1. Check saleListings
    const listingsSnap = await getDocs(query(collection(db, COLLECTIONS.SALE_LISTINGS), limit(1)));
    if (listingsSnap.empty && initialListings && initialListings.length > 0) {
      console.log('Seeding initial saleListings into Firestore...');
      for (const item of initialListings) {
        const formatted = formatSaleListing(item);
        await setDoc(doc(db, COLLECTIONS.SALE_LISTINGS, formatted.listingId), formatted);
      }
    }

    // 2. Check cattle
    const cattleSnap = await getDocs(query(collection(db, COLLECTIONS.CATTLE), limit(1)));
    if (cattleSnap.empty) {
      console.log('Seeding initial cattle records into Firestore...');
      const seedCattle = [
        {
          id: 'BOV-IN-008891',
          animalType: 'cattle',
          breed: 'Gir Cow',
          age: '4.5 Years',
          gender: 'Female',
          pregnancyStatus: 'Pregnant (Est. 5th Month)',
          healthStatus: 'Healthy',
          ownerInformation: {
            name: 'Ramesh Patel',
            mobile: '+91 98765 43210',
            location: 'Anand, Gujarat',
            farmName: 'Amul Sharda Dairy Farm'
          },
          bpaId: 'TAG-IN-8891',
          location: 'Anand, Gujarat',
          imageUrl: '/breeds/gir.jpg',
          milkYield: '16.5 L/day',
          vaccinationStatus: 'Fully Vaccinated (FMD, HS, BQ)'
        },
        {
          id: 'BOV-IN-009142',
          animalType: 'cattle',
          breed: 'Sahiwal Cow',
          age: '3.8 Years',
          gender: 'Female',
          pregnancyStatus: 'Not Pregnant',
          healthStatus: 'Healthy',
          ownerInformation: {
            name: 'Gurpreet Singh',
            mobile: '+91 98140 22319',
            location: 'Fazilka, Punjab',
            farmName: 'Dhillon Dairy'
          },
          bpaId: 'TAG-IN-9142',
          location: 'Fazilka, Punjab',
          imageUrl: '/breeds/sahiwal.jpg',
          milkYield: '18.0 L/day',
          vaccinationStatus: 'Fully Vaccinated'
        }
      ];
      for (const c of seedCattle) {
        await setDoc(doc(db, COLLECTIONS.CATTLE, c.id), formatAnimalRecord(c));
      }
    }

    // 3. Check buffaloes
    const buffaloSnap = await getDocs(query(collection(db, COLLECTIONS.BUFFALOES), limit(1)));
    if (buffaloSnap.empty) {
      console.log('Seeding initial buffalo records into Firestore...');
      const seedBuffaloes = [
        {
          id: 'BOV-IN-004420',
          animalType: 'buffalo',
          breed: 'Murrah Buffalo',
          age: '5.2 Years',
          gender: 'Female',
          pregnancyStatus: 'Not Pregnant',
          healthStatus: 'Healthy',
          ownerInformation: {
            name: 'Baldev Singh Hooda',
            mobile: '+91 94161 88720',
            location: 'Rohtak, Haryana',
            farmName: 'Haryana Black Gold Stud'
          },
          bpaId: 'TAG-IN-4420',
          location: 'Rohtak, Haryana',
          imageUrl: '/breeds/murrah.jpg',
          milkYield: '20.0 L/day',
          vaccinationStatus: 'Fully Vaccinated (FMD, HS, BQ, Anthrax)'
        },
        {
          id: 'BOV-IN-005510',
          animalType: 'buffalo',
          breed: 'Jaffarabadi Buffalo',
          age: '4.0 Years',
          gender: 'Female',
          pregnancyStatus: 'Pregnant',
          healthStatus: 'Healthy',
          ownerInformation: {
            name: 'Khimji Ahir',
            mobile: '+91 98250 11984',
            location: 'Junagadh, Gujarat',
            farmName: 'Gir Somnath Buffalo Farm'
          },
          bpaId: 'TAG-IN-5510',
          location: 'Junagadh, Gujarat',
          imageUrl: '/breeds/jaffarabadi.jpg',
          milkYield: '17.5 L/day',
          vaccinationStatus: 'Fully Vaccinated'
        }
      ];
      for (const b of seedBuffaloes) {
        await setDoc(doc(db, COLLECTIONS.BUFFALOES, b.id), formatAnimalRecord(b));
      }
    }

    // 4. Check breedInformation
    const breedSnap = await getDocs(query(collection(db, COLLECTIONS.BREED_INFO), limit(1)));
    if (breedSnap.empty && initialBreeds && initialBreeds.length > 0) {
      console.log('Seeding breedInformation library into Firestore...');
      for (const b of initialBreeds) {
        const id = (b.id || b.short_name || 'breed').toLowerCase();
        const docPayload = {
          id,
          name: b.name || b.data?.name,
          shortName: b.short_name || b.data?.name,
          species: b.species || b.data?.species,
          category: b.category,
          imageUrl: b.url,
          tag: b.tag,
          origin: b.data?.origin || '',
          avgMilkYield: b.data?.avg_milk_yield || '',
          lactationPeriod: b.data?.lactation_period || '',
          costRange: b.data?.cost_range || '',
          idealTempRange: b.data?.ideal_temp_range || '',
          feedingNotes: b.data?.feeding_notes || '',
          lifespan: b.data?.lifespan || '',
          description: b.data?.description || '',
          keyFeatures: b.data?.key_features || [],
          diseaseRisks: b.data?.disease_risks || [],
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, COLLECTIONS.BREED_INFO, id), docPayload);
      }
    }

    // 5. Check diseaseRecords
    const diseaseSnap = await getDocs(query(collection(db, COLLECTIONS.DISEASE_RECORDS), limit(1)));
    if (diseaseSnap.empty && initialDiseases && initialDiseases.length > 0) {
      console.log('Seeding diseaseRecords into Firestore...');
      for (const d of initialDiseases) {
        const docPayload = {
          id: d.id,
          condition: d.condition,
          hindiName: d.hindiName,
          riskLevel: d.riskLevel,
          urgency: d.urgency,
          color: d.color,
          breedPrevalence: d.breedPrevalence,
          firstAid: d.firstAid || [],
          medicalProtocol: d.medicalProtocol || '',
          quarantineGuide: d.quarantineGuide || '',
          vaccines: d.vaccines || [],
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, COLLECTIONS.DISEASE_RECORDS, d.id), docPayload);
      }
    }

    console.log('Firestore collections check/seed complete.');
    return true;
  } catch (err) {
    console.warn('Firestore seeding notice (check security rules if permission denied):', err);
    return false;
  }
}
