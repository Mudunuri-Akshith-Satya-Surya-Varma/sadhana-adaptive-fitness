# SĀDHANĀ — Technical Engineering Diary & Progress Journal

> **Project Identity**: Adaptive AI Fitness Platform combining deterministic rule-based classification, Google Gemini workout personalization, and class-based RPG progression.  
> **Repository Location**: `c:\Users\PC\Downloads\projects\Sādhanā`  
> **Status**: Active Development  
> **Core Philosophy**: *"Adapt to the person. Never compromise the potential."*

---

## Table of Contents
1. [Project Overview & System Architecture](#1-project-overview--system-architecture)
2. [Architecture Decision Records (ADRs)](#2-architecture-decision-records-adrs)
   - [ADR-001: Five Sanskrit Disciplines as Core Classes](#adr-001-five-sanskrit-disciplines-as-core-classes)
   - [ADR-002: Dual Database Strategy & Windows Python Driver](#adr-002-dual-database-strategy--windows-python-driver)
   - [ADR-003: Strict Boundary: Django Control vs. Gemini Reasoning](#adr-003-strict-boundary-django-control-vs-gemini-reasoning)
   - [ADR-004: Frontend Architecture — React 19, TypeScript, Tailwind CSS & Figma](#adr-004-frontend-architecture--react-19-typescript-tailwind-css--figma)
3. [Phase-by-Phase Progress Log](#3-phase-by-phase-progress-log)
   - [Phase 1: Foundation & Project Scaffolding](#phase-1-foundation--project-scaffolding-completed)
   - [Phase 2: Authentication & Fitness Profile Onboarding (Next)](#phase-2-authentication--fitness-profile-onboarding-queued)
4. [Master Phase Tracker](#4-master-phase-tracker)
5. [Environment & Runtime Manifest](#5-environment--runtime-manifest)

---

## 1. Project Overview & System Architecture

### Canonical Problem Statement
> Most existing fitness applications provide standardized workout plans or assume that users have consistent schedules, sufficient time, appropriate equipment, and the discipline to follow fixed routines. In reality, people have different fitness levels, goals, experience, schedules, available resources, and changing day-to-day circumstances. When these conditions change, rigid fitness plans often become difficult to follow, causing users to lose consistency and eventually abandon their routines.
>
> There is therefore a need for a fitness platform that can understand the individual user, determine an appropriate training direction based on their goals and current capabilities, and continuously adapt their workouts to their real-life circumstances without unnecessarily lowering the standard of progress. The system should account for factors such as available time, equipment, previous performance, workout history, preferences, and legitimate physical limitations while maintaining consistency and progressively challenging the user.
>
> **Sādhanā** addresses this problem by combining rule-based fitness classification with AI-driven workout personalization and continuous adaptation, creating a fitness experience that adapts to the person while continuously developing their potential.

```text
                                SĀDHANĀ SYSTEM ARCHITECTURE
                                
       FRONTEND (Port 5173)                               BACKEND (Port 8000)
┌─────────────────────────────────┐               ┌─────────────────────────────────┐
│  React 19 + TypeScript + Vite   │               │  Django 6.1 + Django REST (DRF) │
│  • Figma Obsidian Dark HUD      │  HTTP / JSON  │  • Modular Apps                 │
│  • Tailwind CSS Utility Engine  ├──────────────►│    - users / classes / exercises│
│  • Active Workout Player (TS)   │               │    - workouts / ai_coach        │
│  • RPG Progression & Aura       │◄──────────────┤  • CORS Configured              │
└─────────────────────────────────┘               └───────────────┬─────────────────┘
                                                                  │
                                            ┌─────────────────────┴─────────────────────┐
                                            ▼                                           ▼
                                 ┌───────────────────────┐                  ┌───────────────────────┐
                                 │      PERSISTENCE      │                  │       AI ENGINE       │
                                 │  • SQLite (Local Dev) │                  │  • Google Gemini API  │
                                 │  • MySQL (Production) │                  │  • `google-genai` SDK │
                                 │  • Django ORM         │                  │  • Strict JSON Schema │
                                 └───────────────────────┘                  └───────────────────────┘
```

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Five Sanskrit Disciplines as Core Classes
* **Date**: 2026-10-08 / 2026-10-09
* **Status**: Accepted & Implemented
* **Context**: Earlier drafts separated English classes (*Foundation, Strength, Endurance, Athletic, Mobility*) from Sanskrit underlying fitness components (*Sthira, Vistāra, Yodha, Dhruva, Samanvaya*). This introduced naming redundancy.
* **Decision**: Merge them directly into **five canonical Sādhanā Classes**:
  1. **Sthira** (स्थिर — Balance & Core Stability)
  2. **Vistāra** (विस्तार — Flexibility & Movement Quality)
  3. **Yodha** (योद्धा — Strength & Muscular Power)
  4. **Dhruva** (ध्रुव — Cardio / Endurance & Steadfast Stamina)
  5. **Samanvaya** (समन्वय — Coordination & Athletic Agility)
* **Consequences**: Every user is directly assigned to one of these five disciplines. Each class specializes in that domain while retaining supporting work across the other four fundamental movement pillars.

---

### ADR-002: Dual Database Strategy & Windows Python Driver
* **Date**: 2026-10-09
* **Status**: Accepted & Implemented
* **Context**: Installing `mysqlclient` on Windows environments without a pre-installed Microsoft Visual C++ Build Tools compiler causes wheel compilation failures. Additionally, local developers often need immediate zero-configuration execution.
* **Decision**:
  1. Use `pymysql` with `pymysql.install_as_MySQLdb()` in `config/settings.py` to transparently bridge Django's native MySQL engine without compiling C extensions.
  2. Implement an automatic database fallback: If `DB_NAME` is configured in `.env`, connect to MySQL; otherwise default automatically to `sqlite3` (`db.sqlite3`).
* **Consequences**: Zero friction local onboarding with instant SQLite testing, while preserving production-grade MySQL support.

---

### ADR-003: Strict Boundary: Django Control vs. Gemini Reasoning
* **Date**: 2026-10-08
* **Status**: Accepted
* **Context**: Unconstrained LLM workout generators hallucinate non-existent exercise names, prescribe unsafe rep/set combinations, or lose track of injury contraindications.
* **Decision**:
  * **Django is the System of Control**: Owns Authentication, User Data, Class Assignment, Volume Caps, and the **Controlled Exercise Catalog** (~60 verified movements).
  * **Gemini is the System of Reasoning**: Consumes sanitized context payloads, reasons about daily constraints (time, equipment, fatigue), and outputs strict JSON referencing *only* valid database exercise IDs.
  * **Validation Gatekeeper**: `services/validator.py` inspects Gemini's JSON before any database persistence. Invalid responses are rejected.

---

### ADR-004: Frontend Architecture — React 19, TypeScript, Tailwind CSS & Figma
* **Date**: 2026-10-09
* **Status**: Accepted & Scheduled
* **Context**: The Sādhanā platform bridges strict backend AI schemas (from Google Gemini and Django REST) with a mobile-first, high-intensity gym training HUD. This requires:
  1. Complete type safety to validate structured AI workout payloads on the client without runtime type crashes.
  2. Rapid, cohesive utility-first styling with high visual impact (Obsidian dark aesthetic, Sanskrit class glows).
  3. Direct mapping from a production-grade Figma design system to frontend code.
* **Decision**:
  * **Framework & Language**: Standardize the client application on **React 19** with **TypeScript** and **Vite**.
  * **Design System & Styling**: Use **Tailwind CSS** configured with custom tokens generated directly from the Figma design master (Obsidian `#07090e`, Amber Aura `#f59e0b`, and the 5 discipline accents: Sthira Cyan, Vistāra Emerald, Yodha Crimson, Dhruva Azure, Samanvaya Purple).
  * **Type Contracts**: Maintain strict TypeScript interfaces matching DRF serializers and Gemini JSON schemas (`UserProfile`, `SadhanaClass`, `Exercise`, `DailyWorkoutPlan`, `WorkoutHistory`).
  * **UX & Ergonomics**: Use Figma prototypes as the single source of truth for single-thumb mobile gym ergonomics and bottom-sheet interactive drawers.
* **Consequences**: Guaranteed end-to-end type safety from Django REST to React components, zero CSS bundle bloat, effortless dark-mode tokenization, and pixel-perfect adherence to Figma prototypes.

---

## 3. Phase-by-Phase Progress Log

### Phase 1: Foundation & Project Scaffolding [COMPLETED]
* **Date**: 2026-10-09
* **Status**: Completed & Verified End-to-End

#### Backend Implementation (`sadhana_backend`)
1. **Environment Setup**:
   * Evaluated Windows runtimes; selected official CPython 3.13 (`C:\Users\PC\AppData\Local\Programs\Python\Python313\python.exe`) to resolve MSYS compiler conflicts.
   * Created virtual environment at `sadhana_backend\venv`.
   * Installed packages:
     ```bash
     pip install django djangorestframework django-cors-headers python-dotenv google-genai pymysql
     ```
2. **Project Scaffolding**:
   * Generated project configuration: `django-admin startproject config sadhana_backend`.
   * Created 5 core modular apps:
     * `users` — Authentication, UserProfile models.
     * `classes` — Class definitions, deterministic classifier, Aura calculation.
     * `exercises` — Controlled exercise catalog.
     * `workouts` — Plans, active tracking, biofeedback logs.
     * `ai_coach` — Gemini API services, prompt engineering, JSON validators.
3. **Settings & Middleware (`config/settings.py`)**:
   * Integrated `rest_framework` and `corsheaders`.
   * Positioned `corsheaders.middleware.CorsMiddleware` at the apex of `MIDDLEWARE`.
   * Configured `CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']`.
   * Added dual SQLite/MySQL database engine logic.
4. **Health Check Endpoint (`GET /api/health/`)**:
   * Built in `config/urls.py` with `AllowAny` permissions.
   * Verifies database connectivity and returns the 5 Sādhanā Classes.
   * **Verified Output**:
     ```json
     {
       "status": "ok",
       "service": "Sādhanā Adaptive Fitness Engine",
       "database": "ok",
       "classes": [
         {"name": "Sthira", "domain": "Balance"},
         {"name": "Vistāra", "domain": "Flexibility"},
         {"name": "Yodha", "domain": "Strength"},
         {"name": "Dhruva", "domain": "Cardio / Endurance"},
         {"name": "Samanvaya", "domain": "Coordination"}
       ],
       "version": "1.0.0-mvp"
     }
     ```
5. **Database Initialization**:
   * Ran initial migrations (`manage.py migrate`) cleanly creating initial Django auth & session tables.

#### Frontend Implementation (`sadhana_frontend`)
1. **Scaffolding**:
   * Initialized React 19 + TypeScript SPA using Vite (`npm create vite@latest sadhana_frontend -- --template react-ts`).
   * Installed libraries: `react-router-dom` (routing), `axios` (HTTP client), `lucide-react` (icons), `tailwindcss` & `@tailwindcss/vite` (styling).
2. **Figma Design System Tokens (`src/index.css` & `tailwind.config.ts`)**:
   * Established dark obsidian theme (`#07090e`, `#0d1117`, `#131924`) directly from Figma master components.
   * Configured typography hierarchy via Google Fonts (*Outfit* and *Plus Jakarta Sans*).
   * Tokenized Aura Gold (`#f59e0b`) with soft atmospheric glow and glassmorphic card borders.
   * Defined Tailwind color accents for all 5 Sādhanā Classes:
     * Sthira: `#06b6d4` (Teal)
     * Vistāra: `#10b981` (Emerald)
     * Yodha: `#ef4444` (Crimson)
     * Dhruva: `#3b82f6` (Azure)
     * Samanvaya: `#a855f7` (Purple)
3. **State & Services**:
   * `src/services/api.ts`: Configured typed Axios client with `baseURL: http://127.0.0.1:8000/api` and token interceptor.
   * `src/types/`: Strict TypeScript interfaces for API contracts and system status.
4. **User Interface**:
   * `src/App.tsx`: Header HUD with Sādhanā Sanskrit logo (`साधना`), navigation links, and live Aura display pill.
   * `src/pages/HomeView.tsx`: Hero banner, live interactive backend health verification card, 5 Sādhanā Classes showcase grid, and Phase 1 completion checklist.
5. **Build & Connectivity Verification**:
   * Verified frontend serving at `http://127.0.0.1:5173/` and connected to Django REST health check.

---

### Phase 2: Authentication, Biometrics Onboarding & Active Gym Player [COMPLETED]
* **Date**: 2026-10-09
* **Status**: Completed & Verified Build (Zero Errors)
* **Frontend Overhaul**:
  * Executed architectural standardization to **React 19 + TypeScript + Vite + Tailwind CSS** as mandated by ADR-004.
  * Created global obsidian HUD with Sanskrit branding (`साधना`), live Aura XP counter, and online connectivity monitor (`HeaderHud.tsx`).
  * Built typed 4-step Biometric Onboarding Wizard (`OnboardingView.tsx`) connecting directly to backend classifier (`POST /api/classes/evaluate/`).
  * Implemented cinematic RPG Class Reveal screen (`ClassRevealView.tsx`) with radiant discipline glow, Sanskrit titles, and radar breakdown.
  * Built Daily Sādhanā Practice Hub (`TodayWorkoutView.tsx`) featuring 30-second pre-training check-in (15m express vs 45m standard, energy readiness scale).
  * Built Active Workout Execution Player (`WorkoutPlayerView.tsx`) with bold exercise focus, interactive set completion awarding live XP to Django REST (`POST /api/workouts/complete-set/`), automated rest countdown ring, and Level-Up ascension modal.
  * Integrated collapsible Gemini AI Fitness Coach drawer (`AiCoachDrawer.tsx`) for instant exercise swaps and biomechanical form guidance.
  * Verified production build cleanly compiling with Vite and TypeScript (`npm run build`).

---

### Phase 4: Free Exercise DB Integration & Visual Movement HUD [COMPLETED]
* **Date**: 2026-10-10
* **Status**: Completed & Verified End-to-End
* **Accomplishments**:
  * Integrated open-source **Free Exercise DB** (`yuhonas/free-exercise-db`) via custom management command `import_free_exercises.py`.
  * Ingested **876 verified exercises** mapped into the 5 Sādhanā Sanskrit disciplines:
    * **Yodha** (Strength): 560 exercises
    * **Vistāra** (Flexibility): 123 exercises
    * **Sthira** (Balance): 107 exercises
    * **Dhruva** (Endurance): 22 exercises
    * **Samanvaya** (Coordination): 64 exercises
  * Extended `Exercise` schema with `force` (push/pull), `mechanic` (compound/isolation), and CDN image URLs (`image_url_0`, `image_url_1`). Applied migration `exercises.0002`.
  * Upgraded workout generator to dynamically compose multi-pillar sessions (mobility warmup, primary compound lifts, core stabilizer, accessory).
  * Upgraded React Active Gym Player (`WorkoutPlayerView.tsx`) to render side-by-side start and finish demonstration photos with form cues.

---

## 4. Master Phase Tracker

| Phase | Milestone Name | Backend Status | Frontend Status | Overall Gate |
|:---:|---|:---:|:---:|:---:|
| **1** | **Foundation & Project Scaffolding** | ✅ Completed | ✅ Completed | 🟢 **PASS** |
| **2** | **Authentication & Fitness Profile Onboarding** | ✅ Completed | ✅ Completed | 🟢 **PASS** |
| **3** | **Rule-Based Class Assignment & Reveal** | ✅ Completed | ✅ Completed | 🟢 **PASS** |
| **4** | **Controlled Exercise Catalog & Workout Schemas** | ✅ Completed | ✅ Completed | 🟢 **PASS** |
| **5** | **RPG Progression Engine (Levels & Aura)** | ✅ Completed | ✅ Completed | 🟢 **PASS** |
| **6** | **Weekly Direction & Daily Context Check-In** | ⏳ Integrated | ✅ Completed | 🟢 **PASS** |
| **7** | **AI Engine Core (Gemini Service & Validation)** | ⏳ Queued | ✅ Integrated | 🟡 Active |
| **8** | **Dynamic Daily Workout Generation** | ⏳ In Progress | ✅ Completed | 🟡 Active |
| **9** | **Active Workout Execution & Player** | ✅ Completed | ✅ Completed | 🟢 **PASS** |
| **10** | **Biofeedback & Closed-Loop Adaptation** | ⚪ Planned | ⚪ Planned | ⚪ Pending |
| **11** | **Quests, Unlocks & Achievement Engine** | ⚪ Planned | ⚪ Planned | ⚪ Pending |
| **12** | **In-App AI Fitness Coach Chat** | ⏳ In Progress | ✅ Completed | 🟡 Active |
| **13** | **Analytics, History & Progression Hub** | ⚪ Planned | ⚪ Planned | ⚪ Pending |
| **14** | **Hardening, Mobile Ergonomics & MVP Polish** | ⚪ Planned | ⚪ Planned | ⚪ Pending |

---

## 5. Environment & Runtime Manifest

| Component | Specification | Notes |
|---|---|---|
| **Operating System** | Windows 11 / AMD64 | Shell: PowerShell |
| **Python Runtime** | CPython 3.13.7 | Virtualenv at `sadhana_backend\venv` |
| **Node.js Runtime** | Node v24.18.0 / npm 11.16.0 | Package manager for `sadhana_frontend` |
| **Backend Framework** | Django 6.1.2 + DRF 3.18.3 | Port `8000` |
| **Frontend Framework** | React 19 + TypeScript 5.8 + Vite 8.3 | Port `5173` |
| **Styling & Design System** | Tailwind CSS + Figma Design Master | Custom Obsidian dark theme & archetype glows |
| **State & Networking** | React Hooks + Axios + React Router | Typed client with Bearer interceptors |
| **AI SDK** | `google-genai` 2.29.0 | Gemini API client |
| **Database Driver** | PyMySQL 1.2.3 | Configured as `MySQLdb` replacement |
| **Primary Databases** | SQLite3 (`db.sqlite3`) / MySQL 8.x | Fallback enabled via environment |

---
*Last updated: 2026-10-09 — Phase 1 completed.*
