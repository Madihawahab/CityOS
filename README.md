# CityOS: AI-Powered Civic Operating System

> **One Report. Zero Follow-ups. AI Handles Everything.**

---

CityOS is an AI-first, modular, cloud-native civic operating system that autonomously manages the complete lifecycle of civic issues. Rather than functioning as a passive complaint-reporting application, CityOS integrates citizens, municipal authorities, and city administration into a unified, AI-driven workflow.

---

## 📖 Table of Contents

- [Vision & Philosophy](#-vision--philosophy)
- [Repository Structure](#-repository-structure)
- [Architecture Overview](#%EF%B8%8F-architecture-overview)
- [The 6 Autonomous AI Modules](#the-6-autonomous-ai-modules)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Configuration](#configuration)
  - [Installation & Running](#installation--running)
- [Database & APIs](#-database--apis)
- [Deployment](#-deployment)

---

## 🌟 Vision & Philosophy

Citizens report a civic issue (e.g., potholes, water leaks, broken streetlights, garbage accumulation) **once**, and the AI handles the rest:

```
[Citizen Reports Issue]
         │
         ▼
[AI Understands & Verifies]
         │
         ▼
[AI Assigns & Prioritizes]
         │
         ▼
[Authority Executes Work]
         │
         ▼
[AI & Citizen Verify Outcome]
```

### Core Guiding Principles:
* **AI-First & Autonomous:** AI acts as the primary decision-maker, routing tasks to departments and validating evidence without manual oversight.
* **Explainable & Transparent:** Explanations for AI decisions (e.g., trust scores, department routing, priority) are readable and clear, while keeping internal chain-of-thought processing invisible.
* **Non-Overridable Decisions:** Field officers/authorities execute tasks assigned by the system without altering category, priority, or routing.
* **Citizen-Centric:** Focuses on building community trust through transparency, notification loops, and community verification.

---

## 📁 Repository Structure

The project directory is structured as follows:

```text
CityOS/
├── 01_PRD/               # Product Requirements Document
│   └── PRD.md            # Vision, target users, features, and success metrics
├── 02_Architcture/       # Architectural Specifications
│   ├── System_architecture.md  # High-level architecture and system components
│   ├── Database.md       # Firestore collection schemas and rules
│   └── API_List.md       # REST API endpoints specifications
├── 03_UI/                # UI Prototypes & Generated Mockups
│   ├── Citizen/          # Citizen Portal layouts and views
│   ├── Authority/        # Authority Dashboard views
│   └── Admin/            # City Intelligence Mission Control views
├── 04_AI/                # AI Configuration & Specifications
│   └── AI_module.md      # Six Gemini AI modules pipeline details
├── 05_Backend/           # Future backend microservices (currently within Next.js API Routes)
├── 06_Prompts/           # Templates for AI Prompts & Gemini Prompt Engineering (TBD)
├── 07_Demo/              # Presentation slides, video walkthroughs, or assets (TBD)
├── 08_Docs/              # Developer guides and onboarding docs (TBD)
└── cityos/               # Core Next.js Web Application
    ├── public/           # Static assets, fonts, icons
    └── src/              # Application Source Code
        ├── app/          # Next.js App Router (Citizen, Admin, Authority, API)
        ├── components/   # UI, AI, Map, and Chart components
        ├── config/       # Firebase and Gemini client configurations
        ├── hooks/        # Custom React Hooks
        ├── lib/          # Helper utilities and proxy services
        ├── providers/    # Global context providers (Theme, Auth, Query)
        ├── store/        # Zustand global state stores
        ├── styles/       # Global CSS styles
        ├── theme/        # Theme definitions
        └── types/        # TypeScript type/interface definitions
```

---

## ⚙️ Architecture Overview

CityOS is composed of three portals connected through a centralized **AI Intelligence Layer** built with Google Gemini:

1. **Citizen Portal (Light Theme):** A friendly, Material 3 based mobile-responsive interface for submitting photo/video/voice reports, tracking issue progress on a live map, and verifying resolved reports.
2. **Authority Portal (Dark Theme):** An operational workspace for municipal departments containing Today's Work Queue, repair guidelines, and mechanisms to upload photo evidence of completed work.
3. **City Intelligence Portal (Dark Theme):** A premium mission control console for administrators to view city-wide analytics, heatmaps, infrastructure KPIs, and inspect explainable AI audit logs.

---

## 🤖 The 6 Autonomous AI Modules

Powered by the **Google Gemini API**, the central intelligence pipeline operates sequentially:

1. **Report Intelligence:** Analyzes text, voice, images, and video to categorize the issue, write a structured description, and evaluate severity.
2. **Trust Engine:** Detects duplicates (via spatio-temporal similarity), filters spam, flags manipulated media, and outputs a Trust Score.
3. **Decision Intelligence:** Automatically routes the issue to the correct department (e.g., Roads, Sanitation, Water) and assigns a priority level.
4. **Resolution Intelligence:** Verifies work by comparing before/after photos and validating GPS/timestamp matching of the evidence.
5. **Civic Intelligence:** Aggregates analytics, detects hotspots, and predicts future infrastructure failures.
6. **Civic Copilot:** Provides natural language conversational assistance to citizens, field officers, and administrators.

---

## 🛠️ Technology Stack

* **Frontend:** [Next.js 15 (App Router)](https://nextjs.org/), React 19, TypeScript, Tailwind CSS
* **Mapping:** Leaflet & React-Leaflet
* **State Management:** Zustand
* **Data Fetching:** TanStack React Query v5
* **Database & Auth:** Firebase Firestore, Firebase Auth, and Firebase Storage
* **AI Engine:** Google Gemini API (`@google/generative-ai`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Firebase project (for development/production database and storage)
- A Google Gemini API Key (get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Configuration
1. Navigate to the `cityos` folder:
   ```bash
   cd cityos
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
3. Open `.env.local` and configure your credentials.

> [!NOTE]
> CityOS includes a **Demo Mode** which works with **no database or AI configurations required**. If you just want to run and explore the UI components, set:
> ```env
> NEXT_PUBLIC_APP_ENV=demo
> ```

### Installation & Running
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## 📊 Database & APIs

### Firestore Collections
The database is structured around the following key collections:
- `users`: User profiles (Citizen, Authority, Admin roles).
- `reports`: The main database of submitted civic issues.
- `ai_analysis`: Outputs and audit trails from the 6 AI modules.
- `departments`: Municipal departments (e.g., Water, Sanitation, Road Maintenance).
- `work_queue`: AI-generated work tasks assigned to field officers.
- `repair_evidence`: Photos and GPS data uploaded as proof of resolution.
- `citizen_verification`: Feedback and confirmations from citizens regarding completed repairs.

### API Endpoints
All API endpoints are versioned under `/api/v1` and handle:
- `/auth`: Citizen registration, login, and token verification.
- `/reports`: Report submissions, retrieval, and verification.
- `/authority`: Work queue retrievals, status updates, and evidence uploads.
- `/ai`: Report analysis, trust scoring, routing decisions, and Copilot chats.
- `/admin`: Dashboard metrics, infrastructure KPIs, and AI audit logs.

For detailed API definitions, see [API_List.md](file:///E:/CityOS/02_Architcture/API_List.md).
For detailed database schemas, see [Database.md](file:///E:/CityOS/02_Architcture/Database.md).

---

## 🚢 Deployment

The CityOS web app is configured to deploy easily on **Vercel** or **Firebase Hosting**.

To build the production bundle:
```bash
npm run build
```
Once built, deploy using your preferred cloud provider.
