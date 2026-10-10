# SĀDHANĀ — Synchronized Phase-by-Phase Build Plan

> **Core Principle**: Each phase delivers a complete, cohesive vertical slice with clearly defined **Backend** and **Frontend** responsibilities, ensuring continuous testing and demonstrable progress at every milestone.

---

## Architecture Matrix at a Glance

| Layer | Technology | Primary Role |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS + Figma | Responsive Obsidian HUD, Active Workout Tracker, RPG Interface |
| **Backend** | Python 3 + Django + Django REST Framework (DRF) | System of Control, Validation, Rules Engine, Database ORM |
| **Database** | MySQL | Persistent store for Users, Profiles, Exercises, Plans, Logs |
| **AI Layer** | Google Gemini API (`google-genai`) | Contextual Reasoning, Workout Design, In-App Coaching |
| **Design System**| Figma | Mobile-first Design Tokens, Dark HUD Prototypes, Ergonomics |

---

## Phase 1: Foundation & Project Scaffolding

### Objective
Establish the development environment, repositories, and baseline communication between Django and React (TypeScript + Tailwind CSS).

### Backend (`sadhana_backend`)
- **Django Project Setup**: Initialize `sadhana_backend` with modular apps:
  - `users/`
  - `classes/`
  - `exercises/`
  - `workouts/`
  - `ai_coach/`
- **Configuration**:
  - Setup `config/settings.py` with `rest_framework`, `corsheaders`, and environment variable loading (`python-dotenv`).
  - Configure database connection for MySQL (with SQLite dev fallback).
  - Configure CORS whitelist for the React dev server (`http://localhost:5173` / `http://127.0.0.1:5173`).
- **Health Check API**:
  - `GET /api/health/` returning server status and DB connection health.

### Frontend (`sadhana_frontend`)
- **React + TypeScript Setup**: Initialize Vite-based React 19 SPA with TypeScript (`react-ts` template) and React Router DOM.
- **Figma Design System & Tailwind CSS Tokens**:
  - Configure `tailwind.config.ts` with design tokens mapped from the Figma master file:
    - Base Theme: Obsidian Charcoal (`#07090e`), Surface Deep (`#0d1117`), Elevated Card (`#131924`), Glass Border (`rgba(255,255,255,0.08)`).
    - Aura Accent: Amber/Gold (`#f59e0b`).
    - 5 Sādhanā Class Tokens:
      - Sthira (Balance): `#06b6d4` (Teal Glow)
      - Vistāra (Flexibility): `#10b981` (Emerald Aura)
      - Yodha (Strength): `#ef4444` (Crimson Flame)
      - Dhruva (Endurance): `#3b82f6` (Azure Surge)
      - Samanvaya (Coordination): `#a855f7` (Purple Pulse)
  - Typography: Google Fonts (*Outfit* for bold display & Sanskrit headings, *Plus Jakarta Sans* for clean tabular metrics).
  - Responsive Shell: Ergonomic Mobile-first layout with bottom thumb-zone navigation and desktop sidebar drawer.
- **API Client Layer**:
  - Typed Axios client (`src/services/api.ts`) with baseURL, timeout, Bearer token interceptor, and standard response envelopes.
- **Root Shell**:
  - `App.tsx`: Header HUD with Sādhanā branding (`साधना`), dynamic Aura counter pill, and live backend connection health monitor.

### Exit Criteria
- Frontend successfully fetches and renders `{ status: "ok" }` from backend `GET /api/health/` with Tailwind styling and strict TypeScript types.

---

## Phase 2: Authentication & Fitness Profile Onboarding

### Objective
Enable secure user accounts and capture comprehensive physical, lifestyle, and fitness capability metrics using typed React components.

### Backend (`users`)
- **Models**:
  - `UserProfile` (1:1 with Django `User`):
    - `age`, `height_cm`, `weight_kg`
    - `experience_level` (`beginner`, `intermediate`, `advanced`)
    - `primary_goal` (`general_fitness`, `strength`, `endurance`, `athletic`, `mobility`)
    - `current_activity_level` (`sedentary`, `light`, `moderate`, `high`)
    - `available_days_per_week`, `default_time_minutes`
    - `equipment_access` (JSON array: e.g., `["bodyweight", "dumbbells", "barbell", "pullup_bar"]`)
    - `physical_limitations` (JSON array / text for injuries/joint issues)
- **APIs**:
  - `POST /api/auth/register/`
  - `POST /api/auth/login/` (Token / Session)
  - `POST /api/auth/logout/`
  - `GET  /api/profile/` & `PUT /api/profile/`

### Frontend (React + TypeScript + Tailwind)
- **Figma Design Spec**: Multi-step onboarding flows with accessible radio cards, range sliders, and chip selectors designed to minimize cognitive load.
- **Components & Pages**:
  - `LoginView.tsx` and `RegisterView.tsx` with Tailwind validation states, loading skeletons, and accessible form labels.
  - `OnboardingWizard.tsx`: 4-step interactive questionnaire with step indicator:
    1. Baselines (Age, Height, Weight).
    2. Experience & Goal selection (interactive archetype preview cards).
    3. Logistics (Days/week, typical session time, available equipment checklist).
    4. Physical constraints / injuries toggle with muscle exclusion tags.
- **State Management & Types**:
  - `src/types/user.ts`: Strict TypeScript interfaces for `UserProfile`, `AuthCredentials`, and `AuthResponse`.
  - Typed custom hook `useAuth` or lightweight store (`useAuthStore`) managing JWT tokens, profile state, and autosave.

### Exit Criteria
- User can register, complete the onboarding wizard with full client-side type validation, and see their profile saved in MySQL.

---

## Phase 3: Rule-Based Class Assignment & Reveal

### Objective
Classify user profile into one of the 5 Sādhanā Classes via deterministic rules and present the class assignment with cinematic RPG flair and Tailwind motion.

### Backend (`classes`)
- **Models**:
  - `Class`: `name` (`Sthira`, `Vistāra`, `Yodha`, `Dhruva`, `Samanvaya`), `core_focus` (`Balance`, `Flexibility`, `Strength`, `Cardio / Endurance`, `Coordination`), `description`, `component_weights` (JSON).
  - `ClassAssignment`: `user` (FK), `class` (FK), `assigned_at`, `reasoning_notes`.
- **Classification Engine (`services/classifier.py`)**:
  - Deterministic evaluation matrix:
    - Balance, core stability, body control focus $\rightarrow$ **Sthira** (Balance)
    - Flexibility, range-of-motion, movement quality $\rightarrow$ **Vistāra** (Flexibility)
    - Strength goals, resistance training preference $\rightarrow$ **Yodha** (Strength)
    - Cardio-respiratory, stamina, endurance preference $\rightarrow$ **Dhruva** (Cardio / Endurance)
    - Athletic performance, agility, balance + power coordination $\rightarrow$ **Samanvaya** (Coordination)
- **APIs**:
  - `GET  /api/classes/` (list the 5 specializations).
  - `GET  /api/my-class/` (current assigned class).
  - `POST /api/my-class/assign/` (trigger classification after onboarding).
  - `POST /api/my-class/reassess/` (re-evaluate based on updated profile).

### Frontend (React + TypeScript + Tailwind)
- **Figma Design Spec**: High-impact RPG class reveal card with radiant backlight glow, Sanskrit typography, and primary/supporting balance charts.
- **Components & Pages**:
  - `ClassRevealView.tsx`:
    - Atmospheric reveal animation displaying the assigned Class emblem and title: **Sthira**, **Vistāra**, **Yodha**, **Dhruva**, or **Samanvaya**.
    - Radar/Bar Breakdown: Primary specialization vs. Supporting components across all 5 domains using Tailwind SVG visualization.
    - "Accept Sādhanā" CTA button with class-specific gradient hover effects linking directly to the main dashboard.
- **Types**:
  - `src/types/classes.ts`: Interfaces for `SadhanaClass`, `ClassAssignmentResponse`, and `ArchetypeColors`.

### Exit Criteria
- New user completes onboarding $\rightarrow$ system automatically computes and assigns class $\rightarrow$ user experiences the typed reveal flow styled to Figma spec.

---

## Phase 4: Controlled Exercise Catalog & Workout Schemas

### Objective
Establish the closed exercise database so that AI never hallucinates non-existent movements, and model workout structures with strict TypeScript contracts.

### Backend (`exercises` & `workouts`)
- **Models (`exercises`)**:
  - `Exercise`: `id`, `name`, `type` (`strength`, `cardio`, `mobility`, `core`, `balance`), `muscle_group` (`chest`, `back`, `legs`, `shoulders`, `arms`, `core`, `full_body`), `difficulty` (`beginner`, `intermediate`, `advanced`), `equipment_required` (`none`, `dumbbells`, `barbell`, `pullup_bar`, `mat`, `bench`), `instructions`, `safety_notes`.
- **Seed Fixtures**:
  - Initial curated library of ~60 fundamental exercises covering all movement patterns (Push, Pull, Hinge, Squat, Carry, Core, Mobility).
- **Models (`workouts`)**:
  - `WorkoutPlan`: `user`, `title`, `target_duration`, `class_type`, `scheduled_date`, `status` (`pending`, `completed`, `skipped`).
  - `WorkoutExercise`: `workout` (FK), `exercise` (FK), `order`, `sets`, `reps`, `duration_seconds`, `rest_seconds`, `notes`.
- **APIs**:
  - `GET /api/exercises/` (filterable by muscle group, equipment, difficulty).
  - `GET /api/exercises/{id}/`.

### Frontend (React + TypeScript + Tailwind)
- **Components**:
  - `ExerciseLibraryModal.tsx`: Filterable searchable directory of movements with instant debounce search and category chips.
  - `ExerciseCard.tsx`: Clean Tailwind card displaying equipment badges, target muscle pills, and movement cues with glassmorphic borders.
- **Types**:
  - `src/types/exercises.ts`: Strict `Exercise` and `ExerciseFilters` interfaces matching backend serializer fields.

### Exit Criteria
- Database populated with 60 verified exercises; typed React catalog displays filtered list with rapid search.

---

## Phase 5: RPG Progression Engine (Levels & Aura)

### Objective
Create the progression layer where actual workout adherence translates into Class Levels, Aura points, and rank tiers.

### Backend (`classes`)
- **Models**:
  - `ClassProgression`:
    - `user` (OneToOne)
    - `assigned_class` (FK)
    - `level` (Default 1)
    - `aura` (Current accumulated Aura points)
    - `current_stage_title` (e.g., Novice $\rightarrow$ Initiate $\rightarrow$ Warrior)
    - `total_workouts_completed`
- **Progression Logic (`services/progression.py`)**:
  - Explicit non-gameable point formula: Points awarded solely upon verified workout completion, consistency streaks, and difficulty tiers.
  - Level calculation formula: $Level = \lfloor\sqrt{Aura / 100}\rfloor + 1$.
- **APIs**:
  - `GET /api/my-class/progression/` (current level, aura, progress to next level, stage title).

### Frontend (React + TypeScript + Tailwind)
- **Figma Design Spec**: Sleek RPG Status Bar styled with gold accent gradients and atmospheric backdrops.
- **Components**:
  - `RpgHeaderHud.tsx`: Fixed/Top dashboard component featuring:
    - User avatar and Class emblem with class-specific glow ring.
    - Level badge (`LVL 1`).
    - Animated Aura counter with glowing golden gradient text.
    - XP/Progress bar with percentage indicator toward next level using Tailwind transition widths.
- **Types**:
  - `src/types/progression.ts`: Interfaces for `ClassProgression` and `ProgressionTier`.

### Exit Criteria
- Progression API returns live level/aura statistics; HUD updates cleanly with reactive state.

---

## Phase 6: Weekly Direction & Daily Context Check-In

### Objective
Define weekly volume targets and build the 30-second daily check-in that captures today's real-life constraints.

### Backend (`workouts`)
- **Models & Logic**:
  - `WeeklyPlan`: `user`, `week_start_date`, `target_sessions` (JSON: e.g. `{"strength": 3, "cardio": 2, "mobility": 1}`), `status`.
  - `services/weekly_planner.py`: Generates weekly targets based on Class and profile days.
- **Daily Context Contract**:
  - Schema for today's input: `available_time_minutes`, `available_equipment`, `energy_level` (1-5), `soreness_areas` (list of muscle tags).
- **APIs**:
  - `GET /api/weekly-plan/`
  - `POST /api/weekly-plan/generate/`

### Frontend (React + TypeScript + Tailwind)
- **Figma Design Spec**: 30-second quick-tap bottom sheet drawer optimized for mobile ergonomics.
- **Components**:
  - `WeeklyTargetCard.tsx`: Dashboard widget showing progress toward weekly component targets (e.g., 2/3 Strength sessions) with progress rings.
  - `DailyCheckInModal.tsx`: The 30-second pre-workout selector:
    - Time slider / pills (`15m`, `30m`, `45m`, `60m`).
    - Equipment selector chips (defaults to profile gear, toggleable).
    - Energy & Readiness scale (1 to 5 with visual flame icons).
    - Soreness body selector (tagging sore muscles for AI avoidance).
- **Types**:
  - `src/types/workouts.ts`: `DailyContextInput` and `WeeklyPlan` interfaces.

### Exit Criteria
- User triggers daily check-in and packages today's context into a typed payload ready for the AI generator.

---

## Phase 7: AI Engine Core (Gemini Service & Strict Validation)

### Objective
Set up the Google Gemini AI client, structured prompt pipelines, and strict Django validation rules to eliminate hallucinations.

### Backend (`ai_coach`)
- **`services/gemini_service.py`**:
  - Wrapper using the `google-genai` SDK with `GEMINI_API_KEY`.
- **`services/context_builder.py`**:
  - Gathers: User profile + Class + Progression level + Weekly target remaining + Today's check-in constraints + Available DB exercise IDs.
- **`services/prompt_builder.py`**:
  - Constructs system prompt instructing Gemini to return strict JSON using only supplied exercise IDs.
- **`services/validator.py`**:
  - Validates that:
    1. Every `exercise_id` in response exists in MySQL.
    2. Estimated workout duration does not exceed user's available time.
    3. Volume (sets/reps) falls within safety boundaries for user's experience.
- **Unit Tests**:
  - Test validation rejection when Gemini returns invalid IDs or invalid formats.

### Frontend (React + TypeScript + Tailwind)
- **Figma Design Spec**: Atmospheric meditation/aura loading screen with soothing pulse animation and motivational Sanskrit wisdom.
- **Components**:
  - `GeneratingWorkoutModal.tsx`: Fullscreen or modal backdrop with dynamic SVG pulse ring styled via Tailwind animation utilities.

### Exit Criteria
- Backend test script successfully calls Gemini, passes valid context, validates structured JSON, and rejects mock hallucinated outputs.

---

## Phase 8: Dynamic Daily Workout Generation

### Objective
Full end-to-end generation and display of tailored daily workouts on the user's dashboard.

### Backend (`workouts` & `ai_coach`)
- **API Endpoint**:
  - `POST /api/workouts/generate/`:
    - Receives today's context $\rightarrow$ calls `ai_coach` pipeline $\rightarrow$ validates JSON $\rightarrow$ saves `WorkoutPlan` and `WorkoutExercise` records in MySQL $\rightarrow$ returns structured workout object.
  - `GET /api/workouts/today/`: Returns today's active plan if already generated.

### Frontend (React + TypeScript + Tailwind)
- **Components & Pages**:
  - `TodayWorkoutView.tsx`:
    - Workout Hero: Title, estimated duration, target focus, warm-up note.
    - Exercise Sequence: Ordered list with sets, reps, rest intervals, equipment icon, and form tips.
    - "Adapt Workout" action button (trigger quick adjustments via AI).
    - "Start Training" primary CTA button with high-contrast Tailwind gradient.
- **Types**:
  - `src/types/workouts.ts`: `DailyWorkoutPlan`, `WorkoutExerciseItem`.

### Exit Criteria
- User clicks "Generate Workout" with custom constraints $\rightarrow$ Gemini designs a custom routine matching those exact parameters $\rightarrow$ displays on screen cleanly typed.

---

## Phase 9: Active Workout Execution & Player

### Objective
Provide an interactive, frictionless in-gym or home training screen for executing the session with single-thumb mobile ergonomics.

### Backend (`workouts`)
- **Models**:
  - `WorkoutHistory`: `user`, `workout_plan` (FK), `planned_duration`, `actual_duration`, `started_at`, `completed_at`, `completion_status` (`completed`, `partially_completed`, `abandoned`).
- **APIs**:
  - `POST /api/workouts/{id}/complete/` accepting actual duration and completed exercise counts.

### Frontend (React + TypeScript + Tailwind)
- **Figma Design Spec**: High-contrast, distraction-free player with jumbo typography for weights/reps, tactile check-off buttons, and high-visibility countdown timers.
- **Components & Pages**:
  - `ActiveWorkoutPlayer.tsx`:
    - Fullscreen focused mobile-optimized mode.
    - Exercise card carousel with large set/rep display.
    - Interactive "Set Complete" checkboxes with haptic/sound feedback hooks.
    - Dynamic Rest Timer countdown with visual ring and skip button.
    - "End Workout Early" / "Complete Workout" action flows.
- **Hook**:
  - `useWorkoutSession.ts`: Manages current exercise index, set completion checkboxes, elapsed timer, and rest interval countdowns with local storage persistence.

### Exit Criteria
- User can start workout, check off sets, run rest timers, and hit complete; performance record is stored in DB.

---

## Phase 10: Biofeedback & Closed-Loop Adaptation

### Objective
Capture post-workout biofeedback and use it to adapt subsequent workout generation (adaptive, not permissive).

### Backend (`workouts`)
- **Models**:
  - `Feedback`: `workout_history` (1:1), `perceived_exertion_rpe` (1-10), `difficulty_rating` (`too_easy`, `appropriate`, `too_hard`), `completion_reason` (if cut short: `time`, `fatigue`, `pain`, `other`), `notes`.
- **Adaptation Loop in `context_builder.py`**:
  - Reads last 3 workout history records and feedback.
  - If previous session had `too_easy` $\rightarrow$ increases density/reps.
  - If previous session had `too_hard` or incomplete due to fatigue $\rightarrow$ modulates volume.
  - If marked `pain` on joint $\rightarrow$ inserts contraindication filter into next prompt.
- **APIs**:
  - `POST /api/workouts/{id}/feedback/`

### Frontend (React + TypeScript + Tailwind)
- **Components**:
  - `PostWorkoutFeedbackModal.tsx`:
    - Quick RPE slider (1 = Very Easy to 10 = Maximum Effort).
    - Difficulty rating chips (`Too Easy`, `Just Right`, `Too Hard`).
    - Joint soreness or issue flags.
    - Session performance summary (time spent vs planned time, total sets completed).

### Exit Criteria
- Completing a workout with "20 min completed out of 40 min planned due to time" directly influences the context for tomorrow's generated session.

---

## Phase 11: Quests, Unlocks & Achievement Engine

### Objective
Bring the RPG quest system alive with daily objectives, class-specific challenges, and celebratory unlock events.

### Backend (`classes` & `workouts`)
- **Models & Logic**:
  - `Quest`: `title`, `description`, `type` (`daily`, `class_weekly`, `milestone`), `target_count`, `aura_reward`.
  - `UserQuestProgress`: `user`, `quest`, `current_progress`, `is_completed`.
  - `services/quest_engine.py`: Evaluates workout logs upon completion and awards rewards.
- **APIs**:
  - `GET /api/quests/active/`
  - `POST /api/quests/{id}/claim/`

### Frontend (React + TypeScript + Tailwind)
- **Components**:
  - `QuestListCard.tsx`: Displays active Daily Quest (e.g. "Complete today's 25m practice") and Class Quest (e.g. "Complete 3 Strength sessions").
  - `LevelUpCelebrationModal.tsx`: Full-screen particle/glow celebration when user crosses level thresholds or unlocks new stage titles.

### Exit Criteria
- Finishing a workout triggers quest completion, awards Aura, and updates HUD progress in real time.

---

## Phase 12: In-App AI Fitness Coach Chat

### Objective
Provide a context-aware chat assistant dedicated exclusively to fitness advice, routine adjustment, and motivation.

### Backend (`ai_coach`)
- **Logic**:
  - `services/coach_chat_service.py`: Leverages user's active profile, current workout, and injury history as system instructions.
  - Guardrails: Refuses medical diagnosis; redirects safely if acute pain is reported.
- **APIs**:
  - `POST /api/ai/coach/chat/` (user message $\rightarrow$ contextual response).
  - `POST /api/workouts/{id}/modify/` (conversational modification e.g., "swap out barbell for dumbbells").

### Frontend (React + TypeScript + Tailwind)
- **Components**:
  - `AiCoachDrawer.tsx`: Collapsible bottom sheet / floating assistant panel with backdrop blur.
  - Chat thread with quick suggestion chips ("I'm short on time", "Substitute an exercise", "Explain form").
  - Direct action buttons inside chat (e.g., "Apply Modified Workout").

### Exit Criteria
- User can open the Coach, ask "I don't have pullup bar today, what can I do?", receive an intelligent swap, and update the session.

---

## Phase 13: Analytics, History & Progression Hub

### Objective
Visualize consistency, component distribution, and physical development trends over time.

### Backend (`workouts`)
- **APIs**:
  - `GET /api/progress/summary/` (weekly adherence, total minutes trained, completion rate).
  - `GET /api/progress/history/` (paginated workout history).
  - `GET /api/progress/components/` (balance across Strength, Cardio, Mobility, Balance, Coordination).

### Frontend (React + TypeScript + Tailwind)
- **Components & Pages**:
  - `ProgressHubView.tsx`:
    - Consistency Heatmap / Streak tracker.
    - Component Radar Chart (visualizing balanced development vs specialization) via SVG or lightweight canvas.
    - Workout History Log (with expandable exercise details and feedback).
    - Shareable "Sādhanā Card" generator (exportable visual card of Class, Level, and Aura).

### Exit Criteria
- User can view their past training history, consistency streak, and visual distribution of fitness components trained.

---

## Phase 14: Hardening, Mobile Ergonomics & MVP Polish

### Objective
Finalize system stability, edge case handling, and demo readiness.

### Backend
- Ensure database transactions on workout completion and aura rewards.
- API performance review and query optimization (`select_related` / `prefetch_related` on exercises and plans).
- Graceful error handling for Gemini API outages or timeouts (fallback workout templates).

### Frontend (React + TypeScript + Tailwind)
- Comprehensive responsive testing across Figma-specified viewports (Mobile 375px–430px, Tablet, Desktop).
- Tactile feedback: Micro-transitions, clean loading skeletons, toast alerts.
- Offline prevention: Local storage session persistence so accidental page reloads do not lose active set data.

### Exit Criteria
- Fully functional end-to-end hackathon / production-ready MVP flow: Register $\rightarrow$ Onboard $\rightarrow$ Class Reveal $\rightarrow$ Daily Check-in $\rightarrow$ AI Generate $\rightarrow$ Execute $\rightarrow$ Feedback $\rightarrow$ Level Up $\rightarrow$ Coach Interaction.

