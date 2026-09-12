<div align="center">

# 👁️ DiabPathy - AI-Powered Retinal Diagnostic & Clinical Screening Platform
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/AI%2FInference-FastAPI%20%2B%20TensorFlow-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Spring Boot](https://img.shields.io/badge/Auth%20%26%20Security-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

*An end-to-end multi-stack clinical decision support system designed for automated diabetic retinopathy staging, macular edema stratification, and microvascular lesion segmentation using deep learning ensembles.*

</div>

---

## 🏗️ System Architecture & Workflow

DiabPathy is built on a robust multi-tier microservices-inspired architecture separating authentication, heavy AI inference, and clinical dashboard interfaces:

```text
  [ React Frontend (Vite) ]
         │ (JWT / REST API)
         ├──────────────────────────┐
         ▼                          ▼
  [ Spring Boot Auth ]     [ FastAPI Inference Engine ]
  (OTP & Security Bridge)   (TensorFlow / Keras Model)
         │                          │
         └─────────────┬────────────┘
                       ▼
            [ PostgreSQL Unified DB ]


🛠️ Tech Stack
Frontend Dashboard: React, Vite, Tailwind CSS, Lucide Icons, jsPDF for dynamic medical report generation.

AI & Deep Learning Engine: Python, FastAPI, TensorFlow / Keras (DeepPath-V3 / Grad-CAM ensemble models).

Authentication & Security Bridge: Java Spring Boot, Spring Security, JWT Bearer Tokens, OTP verification.

Database & Persistence: PostgreSQL (dr_screening_db) with SQLAlchemy ORM.

📂 Project Directory Structure
Plaintext
DiabPathy-Project/
├── frontend/               # React Vite UI (Dashboard, Patient History, Profile)
├── fastapi-backend/        # Python FastAPI service, .keras model weights, SQLAlchemy models
├── DiabProjectBackend/     # Java Spring Boot authentication & security bridge
└── README.md               # Project documentation
🚀 Key Clinical & Technical Features
Multi-Laterality Fundus Capture: Supports Left Eye (OS) and Right Eye (OD) 45°/50° FOV retinal image ingestion.

AI Staging & Lesion Segmentation: Instant detection of microaneurysms, hemorrhages, venous beading, and DME threat levels with confidence metrics.

Grad-CAM Visual Explanations: Heatmap overlay on retinal scans to visualize neural network decision pathways for physicians.

Dynamic PDF Report Generation: Client-side clinical report compiler using jsPDF adhering to medical document standards.

Secure Audit & Patient History: PostgreSQL-backed historical tracking and practitioner profile governance.

⚙️ Local Development Setup
1. Clone the Repository
Bash
git clone [https://github.com/bhardwajayush80419-lab/DiabPathy-Retinal-AI.git](https://github.com/bhardwajayush80419-lab/DiabPathy-Retinal-AI.git)
cd DiabPathy-Project
2. Run FastAPI Inference Engine
Bash
cd fastapi-backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
3. Run Spring Boot Auth Service
Bash
cd ../DiabProjectBackend
mvn spring-boot:run
4. Run React Frontend
Bash
cd ../frontend
npm install
npm run dev
📄 License & Compliance
Designed for clinical support research and academic demonstration under HIPAA & GDPR data-transit standards
