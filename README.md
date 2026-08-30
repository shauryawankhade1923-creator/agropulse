# 🌾 AgroPulse — SIH-Grade AI Agricultural Supply Chain & Dynamic Procurement Queue Platform

AgroPulse is a full-stack platform transforming agricultural supply chain, mandi procurement bottlenecks, and farmer price realization using real-time AI intelligence, digital tokens, live queue orchestration, and direct payment tracking.

---

## 🚀 Tech Stack Overview

| Layer | Technologies | Purpose |
|---|---|---|
| **Backend** | Python 3.14, FastAPI, Uvicorn, SQLAlchemy, SQLite/PostgreSQL | Ultra-fast REST APIs, queue event lifecycle, payments, and data integrity |
| **AI / Machine Learning** | Scikit-Learn, NumPy, Pandas | 1. AI Crop Price Recommendation Engine<br>2. Dynamic Queue Wait-Time Estimator<br>3. Multi-Criteria Buyer Matching Algorithm |
| **Frontend Web** | React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, QR Canvas | Interactive multi-persona portal (Farmer, Buyer, APMC Operator, Admin Analytics) |
| **Mobile Scaffold** | Flutter & Dart | Android/iOS mobile application for on-field farmers and logistics drivers |

---

## 📂 Project Structure

```
agropulse/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & CORS router
│   │   ├── config.py            # Mandi coords & settings
│   │   ├── database.py          # SQLAlchemy engine & session maker
│   │   ├── models.py            # Relational models (Farmer, Produce, Slot, Token, Queue, Payment)
│   │   ├── schemas.py           # Pydantic validation DTOs
│   │   ├── ml/
│   │   │   ├── pricing_engine.py # AI Price Recommendation Engine
│   │   │   ├── queue_engine.py   # AI Queue Wait Time Estimator
│   │   │   └── buyer_matcher.py  # Multi-variable buyer compatibility matcher
│   │   └── routes/              # Auth, Produce, AI, Matching, Procurement, Queue, Payments, Analytics
│   ├── tests/                   # Pytest test suite (7/7 passed)
│   ├── seed_data.py             # Realistic Indian mandi dataset
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main router & persona manager
│   │   ├── api.js               # Centralized API client
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Switch between Farmer, Buyer, Operator, Analytics
│   │   │   ├── farmer/          # Produce Listing, AI Pricing, Buyer Radar, Token Pass, Payments
│   │   │   ├── buyer/           # Live Produce Marketplace & Bidding Console
│   │   │   ├── operator/        # Live Queue Board, Audio Callout, QR Scanner, Weighbridge Processor
│   │   │   └── analytics/       # Mandi volume charts, 7-Day price trends, yard efficiency
│   └── package.json
│
└── mobile/
    ├── lib/                     # Flutter Dart mobile application
    └── pubspec.yaml
```

---

## ⚡ How to Run AgroPulse Locally

### 1. Start the FastAPI Backend
```bash
cd backend
.\venv\Scripts\python -m uvicorn app.main:app --reload --port 8000
```
- Interactive API Docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
- Open browser at `http://localhost:5173`

---

## 🎯 Core User Journey Demo (SIH Presentation Flow)

1. **Farmer Persona (`🌾 Ramesh Patil`)**:
   - Lists 2,500 kg Onion batch with Grade A certification.
   - AI Price Engine calculates fair market value: **₹21.80 – ₹24.50/kg** with factor impact breakdown.
   - Multi-Criteria Buyer Matcher displays top-ranked buyers (e.g. *Kisan Agro Foods* at 94.5% match score).
   - Farmer books a slot at **Nashik APMC Main Yard** and immediately receives **Digital Token Pass `AP-2026-0247`** with optical QR code and real-time wait estimation (~12 mins).

2. **APMC Operator Persona (`🏢 Gate 1 & Weighbridge Inspector`)**:
   - Observes the **Live Queue Console** with active counters, queue depth, and audio voice callouts.
   - Scans farmer's QR pass, advances token to **Counter 2 (In-Inspection & Weighbridge)**.
   - Records certified weight (2,500 kg), tests moisture (11.2%), approves Grade A settlement rate (₹23.50/kg).
   - Submits approval → system instantly disburses **₹58,162.50** via simulated **Direct Benefit Transfer (DBT)** with generated UTR.

3. **Analytics Persona (`📊 Strategic Command Dashboard`)**:
   - Real-time aggregation of total tonnage procured (182.4 MT), DBT funds disbursed (₹43.76 Lakhs), 7-day crop price curves, and yard throughput rankings.
