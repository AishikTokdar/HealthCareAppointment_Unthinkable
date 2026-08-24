# Healthcare Appointment & Follow-up Manager

A comprehensive full-stack healthcare appointment and follow-up management platform built with separate portals for Patients, Doctors, and Administrators. It allows patients to book slots and submit symptoms, provides doctors with pre-visit AI symptom briefings, facilitates doctor-initiated live chat consultations with online presence indicators, evaluates prescription safety with real-time AI drug interaction warnings, compiles 1-Click PDF clinical prescriptions, visualizes medical history timelines with Recharts analytics, and manages doctor leave approvals with automated conflict resolution.

### Quick Links & Deployment URLs
- **Frontend URL**: [https://healthcareappointment.pages.dev/](https://healthcareappointment.pages.dev/)
- **Backend URL**: [https://healthcareappointment.onrender.com/](https://healthcareappointment.onrender.com/)
- **System Design Architecture Write-Up**: [system-design.md](system-design.md)

---

### Demo Test Credentials

| Role | Email | Password | Access Portal |
|:---|:---|:---|:---|
| **Admin** | `admin@clinic.com` | `AdminPassword123!` | System Admin Portal |
| **Doctor** | `doctor@clinic.com` | `123456` | Doctor Clinical Portal |
| **Doctor (Aarav)** | `aarav@clinic.in` | `123456` | Doctor Clinical Portal |
| **Patient** | `patient@clinic.com` | `123456` | Patient Booking Portal |

> [!WARNING]
> **Google Calendar OAuth Authorization Notice**: Since the Google Cloud OAuth app is configured in Testing Mode, Google restricts authorization strictly to pre-registered test user emails explicitly authorized in the Google Cloud Console. Connecting Google Calendar with an unauthorized third-party Gmail address will return an `access_denied` error from Google. Please test calendar synchronization using the pre-configured test account credentials provided above.

---

## 1. System Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients ["Client Applications"]
        PP["Patient Portal (React + Vite)"]
        DP["Doctor Portal (React + Vite)"]
        AP["Admin Portal (React + Vite)"]
    end

    subgraph Backend ["Express API Server"]
        AUTH["Auth Module & Role Middleware"]
        APPT["Appointment & Concurrency Controller"]
        SYMP["Symptom Triage Module"]
        VISIT["Visit & Prescription Module"]
        CHAT["Live Consultation Chat Engine"]
        SAFETY["AI Drug Interaction & Safety Engine"]
        LEAVE["Doctor Leave Request & Approval Module"]
        ADMIN["Admin Management Module"]
        CAL_MOD["Google Calendar Integration"]
        JOBS["Background Cron Job Runner"]
    end

    subgraph DB ["Database Layer"]
        PG[("PostgreSQL Database (Neon)")]
    end

    subgraph PDF ["PDF Document Compiler"]
        HTML2PDF["html2pdf.js Engine"]
    end

    subgraph External ["External Services"]
        GEMINI["Google Gemini 1.5 Flash API"]
        GROQ["Groq Llama-3.1-70B API (Fallback)"]
        RESEND["Resend Email API"]
        GCAL["Google Calendar API v3"]
    end

    PP -->|HTTP / REST| AUTH
    DP -->|HTTP / REST| AUTH
    AP -->|HTTP / REST| AUTH

    AUTH --> APPT
    AUTH --> SYMP
    AUTH --> VISIT
    AUTH --> CHAT
    AUTH --> SAFETY
    AUTH --> LEAVE
    AUTH --> ADMIN
    AUTH --> CAL_MOD

    APPT -->|Pessimistic Lock & Transactions| PG
    SYMP -->|Read / Write| PG
    VISIT -->|Read / Write| PG
    CHAT -->|Store / Poll Messages & Heartbeat| PG
    SAFETY -->|Clinical Rules & LLM Analysis| PG
    LEAVE -->|Leave Requests & Conflict Management| PG
    ADMIN -->|Read / Write Audit Logs| PG

    SYMP -->|Generate Triage Summary| GEMINI
    SYMP -.->|Fallback Triage| GROQ

    VISIT -->|Generate Patient Summary| GEMINI
    VISIT -.->|Fallback Summary| GROQ

    SAFETY -->|Evaluate Drug Interactions| GEMINI
    SAFETY -.->|Fallback Safety Check| GROQ

    PP -->|Compile 1-Click Prescription PDF| HTML2PDF
    DP -->|Compile 1-Click Clinical Summary PDF| HTML2PDF
    AP -->|Compile 1-Click Audit Record PDF| HTML2PDF

    JOBS -->|Process Outbox Notifications| RESEND
    JOBS -->|Process Medication Reminders| PG
    JOBS -->|Clean Expired Holds| PG

    CAL_MOD -->|Create / Update / Delete Events| GCAL
```

> **Technical Architecture Deep-Dive**: For a detailed explanation of concurrency control, 10-minute slot holds, doctor leave conflict resolution, AI safety checks, and keep-alive background workers, read the complete [System Design Write-Up](system-design.md).

---

## 2. Architecture Component Breakdown

### A. Client Applications (Frontend)
- **Patient Portal**: Enables patient registration, doctor lookup by specialisation, real-time slot selection with 2-minute hold reservation, pre-visit symptom entry, live consultation chat room with online/offline presence indicators, interactive Recharts medical history timeline, and 1-Click PDF prescription compilation (`Prescription_{DoctorName}_{Date}.pdf`).
- **Doctor Portal**: Presents a chronological list of daily appointments, AI-generated pre-visit triage briefings (urgency badge, chief complaint, diagnostic questions), doctor-initiated live chat room with AI doctor text refiner, real-time AI drug interaction safety verification, leave request submission modal, and 1-Click clinical summary PDF export (`ClinicalSummary_{PatientName}_{Date}.pdf`).
- **Admin Portal**: Manages doctor self-registration approval queue, creates and updates doctor profiles, reviews doctor leave requests with 1-click approval/rejection and automated appointment cancellation email dispatches, monitors medical visit history logs, and audits notification delivery.

### B. Backend API Server (Express)
- **Auth Module & Middleware**: Manages JWT signing, password hashing using bcrypt (12 rounds), rate-limiting, Joi input validation, and enforces role-based access control (`PATIENT`, `DOCTOR`, `ADMIN`). Validates doctor approval status via `requireApproved` middleware.
- **Appointment & Concurrency Controller**: Implements pessimistic transaction locking (`SELECT ... FOR UPDATE`), enforces 2-minute slot holds (`PENDING` with `holdExpiresAt`), max 3 active holds limit, 30-day advance booking cap, status checks, and manages reschedule/cancellation workflows.
- **Symptom Triage Module**: Receives raw patient symptom descriptions and triggers asynchronous LLM processing to produce clinical triage insights in clean Indian English.
- **Live Consultation Chat & Presence Engine**: Manages doctor-initiated chat states (`NOT_STARTED` -> `ACTIVE` -> `CLOSED`), logs chat messages, and processes heartbeat timestamps to determine online/offline presence status within 15 seconds.
- **AI Drug Interaction & Safety Engine**: Evaluates multi-drug prescriptions against symptoms and known contraindication rules (e.g. Warfarin + Aspirin, Sildenafil + Nitroglycerin) using LLM and deterministic clinical fallbacks.
- **Doctor Leave Request & Approval Module**: Enables doctors to request leave days, allows admins to approve or decline requests, automatically cancels conflicting appointments, and dispatches detailed audit emails to admin and doctor.
- **Visit & Prescription Module**: Stores doctor clinical notes, processes prescription items, triggers LLM post-visit summary generation, and populates medication reminder schedules.
- **Google Calendar Integration Module**: Manages OAuth 2.0 token storage, handles authorization code exchanges, and dispatches event creation, update, and deletion requests.
- **Background Cron Job Runner**: Operates isolated scheduled jobs for retrying queued notifications, clearing expired slot holds, sending 24h appointment reminders, and dispatching hourly medication reminders.

### C. Database Layer (PostgreSQL)
- **PostgreSQL**: Stores relational models for Users, Doctor Profiles, Appointments, Leave Days, Leave Requests, Symptom Forms, Visit Notes, Chat Messages, Medication Reminders, and Notifications. Enforces composite unique constraints `@@unique([doctorId, startsAt])` and `@@unique([doctorId, date])`.

### D. External Services
- **Google Gemini 1.5 Flash API**: Primary LLM engine used for rapid pre-visit symptom analysis, post-visit clinical note translation, doctor message refinement, and AI drug interaction verification in clean Indian English.
- **Groq Llama-3.1-70B API**: Secondary LLM engine providing automatic failover if Gemini rate limits or quotas are exceeded.
- **Resend Email API**: Transactional email dispatch service delivering booking confirmations, cancellation notices, detailed leave conflict alerts, leave approval confirmations, and medication reminders.
- **Google Calendar API**: External calendar service syncing scheduled visits directly to patient and doctor personal Google Calendars.

---

## 3. Environment Variables Reference

### Backend (`backend/.env`)
> **Note**: `DATABASE_URL` and an AI LLM API Key (`GEMINI_API_KEY` or `GROQ_API_KEY`) are **compulsory variables** required to start the server. `JWT_SECRET` is auto-generated if omitted. Resend and Google Calendar keys are optional and fall back gracefully if missing.

```env
# COMPULSORY
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db?schema=public"
GEMINI_API_KEY="your_gemini_api_key"

# OPTIONAL (Auto-generated or feature-specific fallbacks)
GROQ_API_KEY="your_groq_api_key"
JWT_SECRET="your_jwt_secret_key_at_least_32_characters_long"
FRONTEND_URL="http://localhost:5173"
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="onboarding@resend.dev"
GOOGLE_CLIENT_ID="your_gcp_client_id"
GOOGLE_CLIENT_SECRET="your_gcp_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/v1/calendar/callback"
ADMIN_EMAIL="admin@clinic.com"
ADMIN_PASSWORD="AdminPassword123!"
PORT=5000
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL="http://localhost:5000"
```

---

## 4. Local Deployment & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **PostgreSQL**: Local PostgreSQL instance OR a free cloud database instance from [Neon](https://neon.tech).

---

### Step-by-Step Local Setup

#### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/HealthCareAppointment.git
cd HealthCareAppointment
```

#### Step 2: Configure & Launch Backend Server
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install backend node packages:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```

4. Open `.env` in your code editor and populate your connection string:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - *(Optional for basic local testing)* `GEMINI_API_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

5. Run Prisma Database Migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

6. Seed Initial System Admin User:
   ```bash
   npm run seed:admin
   ```
   *Default Admin Credentials:*
   - **Email**: `admin@clinic.com`
   - **Password**: `Admin@123`

7. Start Backend Development Server:
   ```bash
   npm run dev
   ```
   The backend server will launch on `http://localhost:5000`.

---

#### Step 3: Configure & Launch Frontend Web App
1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend node packages:
   ```bash
   npm install
   ```

3. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Verify `.env` contents:
   ```env
   VITE_API_BASE_URL="http://localhost:5000"
   ```

5. Start Frontend Development Server:
   ```bash
   npm run dev
   ```
   The frontend app will launch on `http://localhost:5173`.

---

## 5. Detailed Production Deployment Instructions

### Step 1: Acquire External Service API Keys & OAuth Credentials (Optional)

#### A. Google Gemini 1.5 Flash API Key
1. Visit [Google AI Studio](https://aistudio.google.com).
2. Sign in with your Google account.
3. Click **Get API Key** in the top navigation bar, then click **Create API Key in new project**.
4. Copy the generated string into `GEMINI_API_KEY`.

#### B. Groq Fallback LLM API Key
1. Visit [Groq Console](https://console.groq.com).
2. Sign up or log in.
3. Navigate to **API Keys** in the left sidebar.
4. Click **Create API Key**, name it `Healthcare-Fallback`, and copy the string into `GROQ_API_KEY`.

#### C. Resend Email API Key
1. Register at [Resend](https://resend.com).
2. Navigate to **API Keys** -> **Create API Key**.
3. Set Permission to **Full Access** and copy the key into `RESEND_API_KEY`. Set `EMAIL_FROM=onboarding@resend.dev` (or your verified domain).

#### D. Google Calendar API OAuth 2.0 Credentials
1. Visit [Google Cloud Console](https://console.cloud.google.com).
2. Click **Select a Project** -> **New Project** (`Healthcare-App`).
3. Navigate to **APIs & Services** -> **Library**. Search for **Google Calendar API** and click **Enable**.
4. Navigate to **APIs & Services** -> **OAuth Consent Screen**:
   - User Type: **External**
   - App Name: `Healthcare Appointment Manager`
   - User Support Email & Developer Info: Your email address
   - Save and Continue through Scopes (`.../auth/calendar.events`).
5. Navigate to **APIs & Services** -> **Credentials** -> **Create Credentials** -> **OAuth Client ID**:
   - Application Type: **Web Application**
   - **Authorized JavaScript Origins**:
     - `http://localhost:5173` (Development)
     - `https://healthcare-appointment-frontend.vercel.app` (Production Vercel URL)
     - `https://healthcare-appointment-frontend.pages.dev` (Production Cloudflare Pages URL)
   - **Authorized Redirect URIs**:
     - `http://localhost:5000/api/v1/calendar/callback` (Development)
     - `https://healthcare-appointment-backend.onrender.com/api/v1/calendar/callback` (Production Render URL)
6. Click **Create** and copy **Client ID** (`GOOGLE_CLIENT_ID`) and **Client Secret** (`GOOGLE_CLIENT_SECRET`).

---

### Step 2: Database Setup (Neon PostgreSQL)
1. Sign up for a free account at [Neon Database Console](https://console.neon.tech).
2. Click **Create Project**, name it `healthcare-appointment-db`, and select PostgreSQL version 16.
3. Locate **Connection Details**. Toggle the mode selector to **Direct Connection** (or ensure host does not contain `-pooler`).
   > **Important Note for Neon + Prisma**: Pooled URLs (`-pooler`) do not support PostgreSQL advisory locks used by `migrate deploy`. Use the **Direct Connection URL** for `DATABASE_URL` or use `npx prisma db push` in your build command.
4. Copy the connection URL:
   `postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/healthcare-db?sslmode=require`
5. Keep this string ready for your backend `DATABASE_URL`.

---

### Step 3: Backend Deployment Options

#### Option A: Deploying Backend on Render (Recommended - Free Tier Friendly)
1. Sign up at [Render Console](https://dashboard.render.com).
2. Click **New +** -> **Web Service** -> Connect your GitHub repository.
3. Configure settings:
   - **Name**: `healthcare-appointment-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command** *(Includes pooler-safe DB sync and zero-shell admin seeding)*:
     ```bash
     npm install && npx prisma generate && npx prisma db push && node scripts/seed-admin.js
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
4. Set Environment Variables:
   - `DATABASE_URL` = Your Neon Direct connection string *(Compulsory)*
   - `JWT_SECRET` = *(Optional, auto-generated if omitted)*
   - `GEMINI_API_KEY` = Google AI Studio Key *(Optional)*
   - `GROQ_API_KEY` = Groq Console Key *(Optional)*
   - `RESEND_API_KEY` = Resend Email API Key *(Optional)*
   - `EMAIL_FROM` = `onboarding@resend.dev`
   - `FRONTEND_URL` = `https://healthcareappointment.pages.dev`
   - `NODE_ENV` = `production`
5. Click **Create Web Service**. Render will build the service, sync your database schema, and automatically seed your default admin account without requiring shell access!

#### Option B: Deploying Backend on Railway
1. Register at [Railway Console](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo** -> Select repository.
3. Set **Root Directory** to `backend`.
4. Add Environment Variables under **Variables** tab matching the backend table.
5. Set Build Command: `npm install && npx prisma generate && npx prisma db push && node scripts/seed-admin.js`.
6. Set Start Command: `npm start`.

---

### Step 4: Frontend Deployment Options

#### Option A: Deploying Frontend on Cloudflare Pages (`pages.dev`) (Recommended)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your GitHub repository and branch (`main`).
4. Configure build settings:
   - **Project Name**: `healthcare-appointment-frontend`
   - **Framework Preset**: **Vite**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Add Environment Variable:
   - Variable name: `VITE_API_BASE_URL`
   - Value: `https://healthcare-appointment-backend.onrender.com` (Your Render backend URL)
6. Click **Save and Deploy**. Cloudflare Pages automatically handles client-side React Router navigation via `frontend/public/_redirects` (`/* /index.html 200`). Your live site will be served on `https://healthcare-appointment-frontend.pages.dev`.

#### Option B: Deploying Frontend on Vercel
1. Register/Log in at [Vercel Console](https://vercel.com).
2. Click **Add New...** -> **Project** -> Import your GitHub repository.
3. Configure deployment options:
   - **Framework Preset**: **Vite**
   - **Root Directory**: Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variable:
   - `VITE_API_BASE_URL` = `https://healthcare-appointment-backend.onrender.com` (Your backend URL)
5. Click **Deploy**. Vercel will automatically process SPA routing rewrites via `frontend/vercel.json`.

#### Option C: Deploying Frontend on GitHub Pages
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install `gh-pages` helper package:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add deploy scripts to `frontend/package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build && cp dist/index.html dist/404.html",
     "deploy": "gh-pages -d dist"
   }
   ```
4. Set `VITE_API_BASE_URL` in your environment or build script.
5. Run deployment command:
   ```bash
   npm run deploy
   ```
6. In your GitHub Repository Settings -> **Pages**, set source branch to `gh-pages`.

---

## 6. Database Schema

### Enumerations

| Enum | Values |
|:---|:---|
| `Role` | `PATIENT`, `DOCTOR`, `ADMIN` |
| `AppointmentStatus` | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `ChatStatus` | `NOT_STARTED`, `ACTIVE`, `CLOSED` |
| `LLMStatus` | `PENDING`, `SUCCESS`, `FAILED` |
| `DoctorApprovalStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `LeaveRequestStatus` | `PENDING`, `APPROVED`, `REJECTED` |
| `NotificationType` | `BOOKING_CONFIRM`, `APPOINTMENT_REMINDER`, `CANCELLATION`, `LEAVE_CONFLICT`, `MED_REMINDER`, `DOCTOR_APPROVED`, `DOCTOR_REJECTED`, `LEAVE_REQUESTED`, `LEAVE_APPROVED`, `LEAVE_REJECTED` |
| `NotificationStatus` | `QUEUED`, `SENT`, `FAILED` |

### Tables

#### User
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `email` | `String` | Unique |
| `passwordHash` | `String` | bcrypt hashed |
| `role` | `Role` | PATIENT / DOCTOR / ADMIN |
| `name` | `String` | |
| `phone` | `String?` | Optional |
| `gcalTokens` | `Json?` | Google OAuth token store |
| `createdAt` | `DateTime` | Auto-set |

#### DoctorProfile
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `userId` | `String` | FK to User (unique, cascade) |
| `specialisation` | `String` | |
| `slotDuration` | `Int` | In minutes |
| `workingHours` | `Json` | `{ monday: { start, end }, ... }` |
| `bio` | `String?` | |
| `avatarUrl` | `String?` | |
| `approvalStatus` | `DoctorApprovalStatus` | Defaults PENDING |
| `isActive` | `Boolean` | Defaults true |

#### Appointment
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `patientId` | `String` | FK to User |
| `doctorId` | `String` | FK to DoctorProfile |
| `startsAt` | `DateTime` | Slot start time |
| `endsAt` | `DateTime` | Slot end time |
| `status` | `AppointmentStatus` | Defaults PENDING |
| `chatStatus` | `ChatStatus` | Defaults NOT_STARTED |
| `holdExpiresAt` | `DateTime?` | 10-min pessimistic lock expiry |
| `gcalEventId` | `String?` | Patient Calendar event ID |
| `gcalDoctorEventId` | `String?` | Doctor Calendar event ID |
| `rating` | `Int?` | 1-5 CSAT score |
| `feedback` | `String?` | Patient recovery feedback text |
| `ratedAt` | `DateTime?` | Feedback submission timestamp |
| `createdAt` | `DateTime` | Auto-set |
| **Unique** | `[doctorId, startsAt]` | Prevents double-booking |

#### SymptomForm
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `appointmentId` | `String` | FK to Appointment (unique) |
| `rawSymptoms` | `String` | Patient-entered symptoms |
| `urgency` | `String?` | LLM: Low / Medium / High |
| `chiefComplaint` | `String?` | LLM-generated summary |
| `suggestedQs` | `Json?` | LLM: 3 doctor questions |
| `llmRawOutput` | `String?` | Raw LLM response |
| `llmStatus` | `LLMStatus` | Defaults PENDING |

#### VisitNote
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `appointmentId` | `String` | FK to Appointment (unique) |
| `clinicalNotes` | `String` | Doctor-entered notes |
| `prescription` | `Json` | Array of `{ drug, dose, frequency }` |
| `patientSummary` | `String?` | LLM-generated patient-friendly summary |
| `llmStatus` | `LLMStatus` | Defaults PENDING |

#### MedicationReminder
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `visitNoteId` | `String` | FK to VisitNote |
| `patientId` | `String` | FK to User |
| `drug` | `String` | Medication name |
| `dose` | `String` | e.g. "500mg" |
| `frequency` | `String` | e.g. "Twice daily" |
| `nextRemindAt` | `DateTime` | Next scheduled reminder time |
| `doneAt` | `DateTime?` | Completion timestamp |

#### Notification
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `userId` | `String` | FK to User |
| `type` | `NotificationType` | Email template selector |
| `status` | `NotificationStatus` | Defaults QUEUED |
| `attempts` | `Int` | Retry counter |
| `nextRetryAt` | `DateTime` | Exponential backoff timestamp |
| `payload` | `Json` | Template data (subject, body, recipient) |
| `sentAt` | `DateTime?` | Successful dispatch timestamp |
| **Index** | `[status, nextRetryAt]` | Worker polling index |

#### LeaveDay
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `doctorId` | `String` | FK to DoctorProfile |
| `date` | `DateTime (Date)` | Leave date |
| `reason` | `String?` | Optional reason |
| **Unique** | `[doctorId, date]` | Prevents duplicate leave entries |

#### LeaveRequest
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `doctorId` | `String` | FK to DoctorProfile |
| `date` | `DateTime (Date)` | Requested leave date |
| `reason` | `String?` | Optional reason |
| `status` | `LeaveRequestStatus` | Defaults PENDING |

#### ChatMessage
| Column | Type | Notes |
|:---|:---|:---|
| `id` | `String (UUID)` | Primary key |
| `appointmentId` | `String` | FK to Appointment |
| `senderId` | `String` | FK to User |
| `message` | `String` | Message content |
| `createdAt` | `DateTime` | Auto-set |
| **Index** | `[appointmentId]` | Chat polling index |

---

## 7. LLM Prompt Templates

### Pre-Visit Symptom Triage
```text
Perform a clinical triage analysis on the following patient symptoms in clean Indian English clinical style.
Classify urgency strictly into one of three categories:
- "High": Critical red-flag symptoms, severe pain, breathing issues, or acute distress.
- "Medium": Moderate ongoing symptoms, infection signs, or discomfort requiring timely medical review.
- "Low": Mild, chronic, routine checkup, or minor non-urgent symptoms.

Return valid JSON only with keys:
"urgency": ("Low" | "Medium" | "High"),
"chiefComplaint": (concise 1-sentence summary of main symptom),
"suggestedQuestions": (array of 3 targeted diagnostic questions for the doctor).

Symptoms: <symptoms>
```

**Fallback behavior**: If both Gemini and Groq are unavailable, the system applies a local keyword-matching rule engine. Red-flag terms (chest pain, breathing, seizure, unconscious, stroke, severe bleeding, anaphylaxis) automatically set urgency to `High`. Otherwise urgency defaults to `Medium` for descriptions over 30 characters, or `Low` for shorter ones.

---

### Post-Visit Patient Summary
```text
Convert these clinical notes into a patient-friendly summary in clean Indian English with medication schedule
and follow-up steps. Do NOT use markdown asterisks (* or **). Use clean plain text bullet points (â€¢) if needed.
Clinical notes: <clinicalNotes>.
Prescription info: <prescriptionJSON>.
Return valid JSON only with keys "patientSummary", "medicationSchedule", and "followUpSteps".
```

**Fallback behavior**: If LLM is unavailable, the raw clinical notes are returned as `patientSummary`, and the prescription array is formatted as `Drug - Dose (Frequency)` strings for `medicationSchedule`.

---

### Doctor Message AI Refiner
```text
You are an expert medical physician conducting a patient consultation.
Refine the following rough doctor notes/draft into an empathetic, highly professional, clear, and clinically
precise response in clean Indian English.

STRICT INSTRUCTIONS:
1. Stick strictly to the patient's reported symptoms and diagnosis/treatment guidance.
2. Maintain an empathetic, authoritative medical tone.
3. Do NOT use markdown symbols (such as *, **, #, etc.). Use clean plain text with bullet points (â€¢) if listing items.
4. Do NOT include generic filler or meta comments. Output ONLY the polished message text.

Doctor's rough draft: <draftText>
```

**Fallback behavior**: If LLM is unavailable, the original draft text is returned after stripping markdown symbols.

---

### AI Prescription Drug Safety Checker
```text
Analyze the following prescribed medication list for drug-drug interactions, contraindications, or dosage
anomalies in clean Indian English clinical context.
Patient Symptoms/Complaint: "<symptoms>"
Prescribed Medications: <prescriptionJSON>

STRICT INSTRUCTIONS:
Return valid JSON only with keys:
"safetyStatus": ("SAFE" | "WARNING" | "CRITICAL"),
"hasInteractions": boolean,
"warnings": array of objects with keys { "severity": ("CRITICAL" | "MODERATE" | "INFO"), "drugPair": string,
  "message": string, "recommendation": string },
"dosageAdvice": string.
```

**Fallback behavior**: If LLM is unavailable, a local clinical rule engine checks for high-risk drug pairs: Warfarin + NSAIDs/Aspirin (hemorrhage risk), PDE5 Inhibitors + Nitrates (fatal hypotension), and Fluoxetine + Tramadol (serotonin syndrome).

---

## 8. API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `POST` | `/auth/register` | Public | Register a new patient or doctor account |
| `POST` | `/auth/login` | Public | Login and receive a JWT token |
| `GET` | `/auth/me` | Any | Return current authenticated user profile |

---

### Appointments

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `POST` | `/appointments/hold` | PATIENT | Reserve a 10-minute slot hold |
| `POST` | `/appointments/confirm` | PATIENT | Confirm a held slot into a booking |
| `GET` | `/appointments` | PATIENT | List all patient appointments |
| `GET` | `/appointments/:id` | PATIENT / DOCTOR | Get full appointment detail |
| `PATCH` | `/appointments/:id/reschedule` | PATIENT | Reschedule a confirmed appointment |
| `PATCH` | `/appointments/:id/cancel` | PATIENT / DOCTOR | Cancel an appointment |
| `PATCH` | `/appointments/:id/complete` | DOCTOR | Mark appointment as completed |
| `POST` | `/appointments/:id/rate` | PATIENT | Submit a 1-5 star CSAT recovery rating |
| `POST` | `/appointments/:id/ai-refine` | DOCTOR | AI-refine a rough message draft |

---

### Symptoms

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `POST` | `/symptoms/:appointmentId` | PATIENT | Submit symptom form; triggers LLM pre-visit triage |
| `GET` | `/symptoms/:appointmentId` | PATIENT / DOCTOR | Retrieve the symptom form and AI triage result |

---

### Visits

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `POST` | `/visits/:appointmentId` | DOCTOR | Submit clinical notes and prescription; triggers LLM post-visit summary |
| `GET` | `/visits/:appointmentId` | PATIENT / DOCTOR | Retrieve visit note with patient-friendly summary |
| `POST` | `/visits/check-safety` | DOCTOR | AI drug interaction safety check before submitting prescription |

---

### Doctors

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/doctors` | Public | List all approved and active doctors |
| `GET` | `/doctors/search` | Public | Filter doctors by specialisation or name |
| `GET` | `/doctors/:id` | Public | Get a single doctor profile |
| `GET` | `/doctors/:id/slots` | Public | Get available booking slots for a date |
| `GET` | `/doctors/me/appointments` | DOCTOR | Get own appointment schedule |
| `POST` | `/doctors/leave` | DOCTOR | Request a leave day |
| `GET` | `/doctors/leave/requests` | DOCTOR | List own leave requests |

---

### Admin

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/admin/doctors` | ADMIN | List all doctors with approval status |
| `PATCH` | `/admin/doctors/:id/approve` | ADMIN | Approve a doctor account |
| `PATCH` | `/admin/doctors/:id/reject` | ADMIN | Reject a doctor account |
| `GET` | `/admin/leave-requests` | ADMIN | List all doctor leave requests |
| `PATCH` | `/admin/leave-requests/:id/approve` | ADMIN | Approve a leave request and notify affected patients |
| `PATCH` | `/admin/leave-requests/:id/reject` | ADMIN | Reject a leave request |
| `GET` | `/admin/appointments` | ADMIN | View all appointments system-wide |
| `GET` | `/admin/stats` | ADMIN | System usage statistics |

---

### Google Calendar

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/calendar/auth-url` | PATIENT / DOCTOR | Generate Google OAuth 2.0 consent URL |
| `GET` | `/calendar/callback` | Public | Handle OAuth callback and store tokens |
| `GET` | `/calendar/status` | PATIENT / DOCTOR | Check if Calendar is connected |
| `DELETE` | `/calendar/disconnect` | PATIENT / DOCTOR | Revoke Calendar access |

---

### Chat (Live Consultation)

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `POST` | `/appointments/:id/chat/start` | DOCTOR | Open a live consultation chat session |
| `POST` | `/appointments/:id/chat/close` | DOCTOR | Close the chat session |
| `POST` | `/appointments/:id/chat/heartbeat` | PATIENT / DOCTOR | Update last-seen presence timestamp |
| `POST` | `/appointments/:id/chat/messages` | PATIENT / DOCTOR | Send a message |
| `GET` | `/appointments/:id/chat/messages` | PATIENT / DOCTOR | Poll for new messages |

---

### Health

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `GET` | `/health` | Public | Server liveness check; returns `{ status: "ok" }` |

