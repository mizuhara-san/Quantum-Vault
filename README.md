# 🛡️ QuantumVault
**Post-Quantum Secure Cloud Storage Platform**

QuantumVault is a hybrid security solution designed to protect data against the "Store Now, Decrypt Later" (SNDL) attacks of the quantum era. It implements NIST-standardized **ML-KEM (Lattice-based)** cryptography.

## 🚀 Core Features
* **Post-Quantum Ready:** Uses Module-Lattice Key Encapsulation Mechanism (ML-KEM-768).
* **Hybrid Encryption:** Combines AES-256-GCM for performance with PQC for key protection.
* **Quantum Entropy:** Integrated with ANU Quantum Random Number Generator API.
* **Zero-Knowledge Architecture:** Private keys are never stored in plain text.

## 🛠️ Tech Stack
- **Frontend:** React 19, Tailwind CSS, Framer Motion
- **Backend:** Node.js (v24.11+), Express
- **Database:** MongoDB Atlas
- **Storage:** Cloudinary API

## 📖 Deployment
The frontend is optimized for **Vercel**, and the backend is ready for **Render/Railway**.