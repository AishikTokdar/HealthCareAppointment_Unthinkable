# Healthcare Appointment & Follow-up Manager

A comprehensive full-stack healthcare appointment and follow-up management platform built with separate portals for Patients, Doctors, and Administrators. It allows patients to book slots and submit symptoms, provides doctors with pre-visit AI symptom briefings, facilitates doctor-initiated live chat consultations with online presence indicators, evaluates prescription safety with real-time AI drug interaction warnings, compiles 1-Click PDF clinical prescriptions, visualizes medical history timelines with Recharts analytics, and manages doctor leave approvals with automated conflict resolution.

### Live Deployment URLs
- **Frontend URL**: [https://healthcareappointment.pages.dev/](https://healthcareappointment.pages.dev/)
- **Backend URL**: [https://healthcareappointment.onrender.com/](https://healthcareappointment.onrender.com/)

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
> **Note**: `DATABASE_URL` is the **only compulsory variable** required to start the server. `JWT_SECRET` is auto-generated if omitted. All external API integration keys (Gemini, Groq, Resend, Google Calendar) are optional and fall back gracefully if missing.

```env
# 🔴 COMPULSORY
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db?schema=public"

# 🟢 OPTIONAL (Auto-generated or feature-specific fallbacks)
JWT_SECRET="your_jwt_secret_key_at_least_32_characters_long"
FRONTEND_URL="http://localhost:5173"
GEMINI_API_KEY="your_gemini_api_key"
GROQ_API_KEY="your_groq_api_key"
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
3. Locate **Connection Details** -> **Prisma / Direct Connection** mode.
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
   - **Build Command** *(Includes zero-shell automated admin seeding)*:
     ```bash
     npm install && npx prisma generate && npx prisma migrate deploy && node scripts/seed-admin.js
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
4. Set Environment Variables:
   - `DATABASE_URL` = Your Neon connection string *(Compulsory)*
   - `JWT_SECRET` = *(Optional, auto-generated if omitted)*
   - `GEMINI_API_KEY` = Google AI Studio Key *(Optional)*
   - `GROQ_API_KEY` = Groq Console Key *(Optional)*
   - `RESEND_API_KEY` = Resend Email API Key *(Optional)*
   - `EMAIL_FROM` = `onboarding@resend.dev`
   - `FRONTEND_URL` = `https://healthcare-appointment-frontend.pages.dev`
   - `NODE_ENV` = `production`
5. Click **Create Web Service**. Render will build the service and automatically seed your default admin account without requiring shell access!

#### Option B: Deploying Backend on Railway
1. Register at [Railway Console](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo** -> Select repository.
3. Set **Root Directory** to `backend`.
4. Add Environment Variables under **Variables** tab matching the backend table.
5. Set Build Command: `npm install && npx prisma generate && npx prisma migrate deploy && node scripts/seed-admin.js`.
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

## 6. Database Schema Overview

```prisma
enum Role {
  PATIENT
  DOCTOR
  ADMIN
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum ChatStatus {
  NOT_STARTED
  ACTIVE
  CLOSED
}

enum LeaveRequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum LLMStatus {
  PENDING
  SUCCESS
  FAILED
}

enum NotificationType {
  BOOKING_CONFIRM
  APPOINTMENT_REMINDER
  CANCELLATION
  LEAVE_CONFLICT
  LEAVE_REQUESTED
  LEAVE_APPROVED
  MED_REMINDER
  DOCTOR_APPROVED
  DOCTOR_REJECTED
}

enum NotificationStatus {
  QUEUED
  SENT
  FAILED
}

enum DoctorApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id              String               @id @default(uuid())
  email           String               @unique
  passwordHash    String
  role            Role
  name            String
  phone           String?
  gcalTokens      Json?
  createdAt       DateTime             @default(now())
  appointments    Appointment[]        @relation("PatientAppointments")
  doctorProfile   DoctorProfile?
  notifications   Notification[]
  reminders       MedicationReminder[]
  chatMessages    ChatMessage[]
}

model DoctorProfile {
  id             String               @id @default(uuid())
  userId         String               @unique
  user           User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  specialisation String
  slotDuration   Int
  workingHours   Json
  bio            String?
  avatarUrl      String?
  approvalStatus DoctorApprovalStatus @default(PENDING)
  isActive       Boolean              @default(true)
  appointments   Appointment[]
  leaveDays      LeaveDay[]
  leaveRequests  LeaveRequest[]
}

model LeaveDay {
  id       String        @id @default(uuid())
  doctorId String
  doctor   DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  date     DateTime      @db.Date
  reason   String?

  @@unique([doctorId, date])
}

model LeaveRequest {
  id        String             @id @default(uuid())
  doctorId  String
  doctor    DoctorProfile      @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  date      DateTime           @db.Date
  reason    String?
  status    LeaveRequestStatus @default(PENDING)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
}

model Appointment {
  id                String            @id @default(uuid())
  patientId         String
  patient           User              @relation("PatientAppointments", fields: [patientId], references: [id], onDelete: Cascade)
  doctorId          String
  doctor            DoctorProfile     @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  startsAt          DateTime
  endsAt            DateTime
  status            AppointmentStatus @default(PENDING)
  holdExpiresAt     DateTime?
  gcalEventId       String?
  gcalDoctorEventId String?
  chatStatus        ChatStatus        @default(NOT_STARTED)
  patientLastSeen   DateTime?
  doctorLastSeen    DateTime?
  createdAt         DateTime          @default(now())
  symptomForm       SymptomForm?
  visitNote         VisitNote?
  chatMessages      ChatMessage[]

  @@unique([doctorId, startsAt])
  @@index([patientId])
  @@index([doctorId, startsAt])
}

model ChatMessage {
  id            String      @id @default(uuid())
  appointmentId String
  appointment   Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  senderId      String
  sender        User        @relation(fields: [senderId], references: [id], onDelete: Cascade)
  message       String
  createdAt     DateTime    @default(now())
}

model SymptomForm {
  id             String      @id @default(uuid())
  appointmentId  String      @unique
  appointment    Appointment @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  rawSymptoms    String
  urgency        String?
  chiefComplaint String?
  suggestedQs    Json?
  llmRawOutput   String?
  llmStatus      LLMStatus   @default(PENDING)
  createdAt      DateTime    @default(now())
}

model VisitNote {
  id             String               @id @default(uuid())
  appointmentId  String               @unique
  appointment    Appointment          @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  clinicalNotes  String
  prescription   Json
  patientSummary String?
  llmRawOutput   String?
  llmStatus      LLMStatus            @default(PENDING)
  createdAt      DateTime             @default(now())
  reminders      MedicationReminder[]
}

model MedicationReminder {
  id           String    @id @default(uuid())
  visitNoteId  String
  visitNote    VisitNote @relation(fields: [visitNoteId], references: [id], onDelete: Cascade)
  patientId    String
  patient      User      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  drug         String
  dose         String
  frequency    String
  nextRemindAt DateTime
  doneAt       DateTime?
}

model Notification {
  id          String             @id @default(uuid())
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        NotificationType
  status      NotificationStatus @default(QUEUED)
  attempts    Int                @default(0)
  nextRetryAt DateTime           @default(now())
  payload     Json
  sentAt      DateTime?
  createdAt   DateTime           @default(now())

  @@index([status, nextRetryAt])
}
```

---

## 7. LLM Prompt Templates

### Pre-Visit Symptoms Prompt
```text
Perform a clinical triage analysis on the following patient symptoms in clean Indian English clinical style. Classify urgency strictly into one of three categories: High, Medium, or Low. Return valid JSON only with keys "urgency", "chiefComplaint", and "suggestedQuestions". Symptoms: <symptoms>
```

### Post-Visit Clinical Notes Prompt
```text
Convert these clinical notes into a patient-friendly summary in clean Indian English with medication schedule and follow-up steps: <notes>. Prescription info: <prescriptionJSON>. Return valid JSON only with keys "patientSummary", "medicationSchedule", and "followUpSteps".
```

### Doctor AI Note Refiner Prompt
```text
Refine the rough doctor notes/draft into an empathetic, highly professional, clear, and clinically precise response in clean Indian English. Stick strictly to the patient's reported symptoms and diagnosis/treatment guidance. Doctor's rough draft: <draftText>
```

### AI Drug Interaction Safety Analysis Prompt
```text
Analyze the prescribed medication list for drug-drug interactions, contraindications, or dosage anomalies in clean Indian English clinical context. Return valid JSON only with keys "safetyStatus" (SAFE | WARNING | CRITICAL), "hasInteractions", "warnings", and "dosageAdvice". Prescribed Medications: <prescriptionJSON>
```
