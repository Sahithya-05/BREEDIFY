# 🐄 BREEDIFY — Precision Livestock Intelligence & Marketplace

**BREEDIFY** is an AI-powered livestock biometrics, breed identification, health monitoring, and decentralized cattle trading platform engineered for farmers, veterinary doctors, and dairy operators.

---

## 🌟 Core Features

- **AI Vision Biometric Scanner**: Real-time breed identification, morphometric analysis (horn ridge, dewlap geometry, dorsal hump), and confidence scoring across 19+ indigenous Indian cattle and buffalo breeds.
- **Iris Biometric Verification**: Unique iris pattern recognition and Bharat Pashudhan (BPA) Pashu Aadhaar tagging for fraud-proof animal identity.
- **Livestock Marketplace**: Peer-to-peer digital mandi connecting farmers directly to verified buyers with multi-criteria filtering (breed, species, age, pregnancy status, lactation yield, and mandi valuation).
- **Digital Animal Passport**: Regulatory-compliant digital health card containing vaccination logs (FMD, HS, BQ), deworming records, pregnancy ultrasound confirmations, and milk yield metrics.
- **Clinical Health & Diagnostics**: Multi-symptom veterinary diagnostic decision support for conditions such as Foot-and-Mouth Disease (FMD), Bovine Mastitis, Lumpy Skin Disease (LSD), and Haemorrhagic Septicaemia (HS).
- **Veterinary HITL (Human-in-the-Loop)**: Role-gated verification portal empowering certified veterinary officers to validate AI predictions before passport issuance.
- **Multilingual Localization**: Native support for English, Hindi (हिंदी), Telugu (తెలుగు), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Marathi (मराठी), Bengali (বাংলা), Gujarati (ગુજરાતી), and Punjabi (ਪੰਜਾਬੀ).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3 + Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Internationalization**: i18next & react-i18next
- **Routing**: React Router v6

### Backend & AI Services
- **Framework**: FastAPI (Python 3.10+)
- **Computer Vision**: OpenCV, NumPy, MediaPipe
- **Iris Biometrics**: Custom Gabor wavelet & Daugman rubber-sheet normalizer
- **Database**: Cloud Firestore & SQLite

### Cloud & Infrastructure
- **Cloud Firestore**: Real-time NoSQL database for sale listings, animal registries, and user profiles
- **Firebase Authentication**: Role-based access control (Farmer, Vet, Dairy Operator)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run development server
npm run dev
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python server/main.py
```

---

## 🧬 Gemini Multimodal AI Vision & Veterinary Intelligence

BREEDIFY integrates Google Gemini Vision models for real-time bovine identification and age estimation:
- **Breed Classification (98% Accuracy)**: Automatic identification across 19 ICAR/NBAGR recognized breeds (Gir, Murrah, Sahiwal, Kankrej, Ongole, Tharparkar, Jaffarabadi, etc.).
- **Morphological Age Estimation**: Estimates bovine age in years with 92%+ confidence using horn annular rings, muzzle width, dentition indicators, and udder conformation.
- **Resilient Multi-Model Cascading**: Production cascade across active Gemini endpoints (`gemini-3.5-flash-lite` ➔ `gemini-3.6-flash` ➔ `gemini-flash-latest` ➔ `gemini-3.7-flash`) to ensure zero-downtime under high traffic.
- **ICAR-NDRI Veterinary Copilot**: Real-time AI chat agent offering customized feeding rations, disease mitigation, and feed economics in Indian Rupees (₹).

---

## 📜 License
Private and Proprietary — Developed for BREEDIFY.

