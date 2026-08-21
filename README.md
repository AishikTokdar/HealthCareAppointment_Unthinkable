# Healthcare Appointment & Follow-up Manager

A comprehensive full-stack healthcare appointment and follow-up management platform built with separate portals for Patients, Doctors, and Administrators. It allows patients to book slots and submit symptoms, provides doctors with pre-visit AI symptom briefings, generates patient-friendly post-visit summaries, tracks medication prescriptions with automated reminders, and synchronizes with Google Calendar and email notifications.

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
        ADMIN["Admin Management Module"]
        CAL_MOD["Google Calendar Integration"]
        JOBS["Background Cron Job Runner"]
    end

    subgraph DB ["Database Layer"]
        PG[("PostgreSQL Database (Neon)")]
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
    AUTH --> ADMIN
    AUTH --> CAL_MOD

    APPT -->|Pessimistic Lock & Transactions| PG
    SYMP -->|Read / Write| PG
    VISIT -->|Read / Write| PG
    ADMIN -->|Read / Write| PG

    SYMP -->|Generate Triage Summary| GEMINI
    SYMP -.->|Fallback Triage| GROQ

    VISIT -->|Generate Patient Summary| GEMINI
    VISIT -.->|Fallback Summary| GROQ

    JOBS -->|Process Outbox Notifications| RESEND
    JOBS -->|Process Medication Reminders| PG
    JOBS -->|Clean Expired Holds| PG

    CAL_MOD -->|Create / Update / Delete Events| GCAL
```

---

## 2. Architecture Component Breakdown

### A. Client Applications (Frontend)
- **Patient Portal**: Enables patient registration, doctor lookup by specialisation, real-time slot selection with 2-minute hold reservation, pre-visit symptom entry, appointment detail timeline, and post-visit summary viewing.
- **Doctor Portal**: Presents a chronological list of daily appointments, AI-generated pre-visit triage briefings (urgency badge, chief complaint, suggested questions), clinical note recording interface, and dynamic prescription builder.
- **Admin Portal**: Manages doctor self-registration approval queue, creates and updates doctor profiles, schedules doctor leave days with automatic conflict resolution, monitors system analytics, and audits notification outbox delivery.

### B. Backend API Server (Express)
- **Auth Module & Middleware**: Manages JWT signing, password hashing using bcrypt (12 rounds), and enforces role-based access control (`PATIENT`, `DOCTOR`, `ADMIN`). Validates doctor approval status via `requireApproved` middleware.
- **Appointment & Concurrency Controller**: Implements pessimistic transaction locking (`SELECT ... FOR UPDATE`), enforces 2-minute slot holds (`PENDING` with `holdExpiresAt`), and manages reschedule and cancellation workflows.
- **Symptom Triage Module**: Receives raw patient symptom descriptions and triggers asynchronous LLM processing to produce clinical triage insights.
- **Visit & Prescription Module**: Stores doctor clinical notes, processes prescription items, triggers LLM post-visit summary generation, and populates medication reminder schedules.
- **Admin Management Module**: Handles doctor onboarding, leave day entry, automated booking cancellations for conflicting leave dates, and statistics aggregation.
- **Google Calendar Integration Module**: Manages OAuth 2.0 token storage, handles authorization code exchanges, and dispatches event creation, update, and deletion requests.
- **Background Cron Job Runner**: Operates isolated scheduled jobs for retrying queued notifications, clearing expired slot holds, sending 24h appointment reminders, and dispatching hourly medication reminders.

### C. Database Layer (PostgreSQL)
- **PostgreSQL**: Stores relational models for Users, Doctor Profiles, Appointments, Leave Days, Symptom Forms, Visit Notes, Medication Reminders, and Notifications. Enforces composite unique constraints `@@unique([doctorId, startsAt])` and `@@unique([doctorId, date])`.

### D. External Services
- **Google Gemini 1.5 Flash API**: Primary LLM engine used for rapid pre-visit symptom analysis and post-visit clinical note translation.
- **Groq Llama-3.1-70B API**: Secondary LLM engine providing automatic failover if Gemini rate limits or quotas are exceeded.
- **Resend Email API**: Transactional email dispatch service delivering booking confirmations, cancellation notices, leave conflict alerts, doctor approval updates, and medication reminders.
- **Google Calendar API**: External calendar service syncing scheduled visits directly to patient and doctor personal Google Calendars.

---

## 3. Environment Variables Reference

### Backend (`backend/.env.example`)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db?schema=public"
JWT_SECRET="your_jwt_secret_key"
APP_SECRET="your_32_byte_secret_key"
GEMINI_API_KEY="your_gemini_api_key"
GROQ_API_KEY="your_groq_api_key"
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="onboarding@resend.dev"
GOOGLE_CLIENT_ID="your_gcp_client_id"
GOOGLE_CLIENT_SECRET="your_gcp_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/v1/calendar/callback"
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@clinic.com"
ADMIN_PASSWORD="AdminPassword123!"
PORT=5000
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_BASE_URL="http://localhost:5000"
```

---

## 4. Local Installation & Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/HealthCareAppointment.git
   cd HealthCareAppointment
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npx prisma migrate dev --name init
   npm run seed:admin
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

---

## 5. Detailed Step-by-Step Deployment Instructions

### Step 1: Deploy Database (Neon PostgreSQL)
1. Sign up for a free account at [Neon](https://neon.tech).
2. Click **Create Project**, name it `healthcare-db`, and select PostgreSQL version 16.
3. Once created, navigate to the **Dashboard** and locate the **Connection Details**.
4. Copy the full connection string (e.g., `postgresql://alex:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require`).
5. Save this URL to use as your `DATABASE_URL` in backend deployment.

### Step 2: Acquire External Service Credentials
1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com).
   - Click **Get API Key** -> **Create API Key**.
   - Copy key into `GEMINI_API_KEY`.

2. **Groq Fallback API Key**:
   - Visit [Groq Console](https://console.groq.com).
   - Navigate to **API Keys** -> **Create API Key**.
   - Copy key into `GROQ_API_KEY`.

3. **Resend Email API Key**:
   - Register at [Resend](https://resend.com).
   - Navigate to **API Keys** -> **Create API Key**.
   - Copy key into `RESEND_API_KEY`. Set `EMAIL_FROM=onboarding@resend.dev` (or your verified domain).

4. **Google OAuth 2.0 Credentials**:
   - Visit [Google Cloud Console](https://console.cloud.google.com).
   - Create project `HealthcareApp`.
   - Under **APIs & Services** -> **Library**, search for and enable **Google Calendar API**.
   - Go to **Credentials** -> **Create Credentials** -> **OAuth 2.0 Client ID**.
   - Set Application Type to **Web Application**.
   - Add Authorized Redirect URIs:
     - Development: `http://localhost:5000/api/v1/calendar/callback`
     - Production: `https://your-backend-render-app.onrender.com/api/v1/calendar/callback`
   - Copy Client ID and Client Secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Step 3: Deploy Backend Server (Render)
1. Register/Log in to [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository and set the Root Directory to `backend`.
4. Configure service settings:
   - **Name**: `healthcare-appointment-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
5. Scroll to **Environment Variables** and add all values from `backend/.env.example`:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET` (random 32+ character string)
   - `APP_SECRET` (random 32+ character string)
   - `GEMINI_API_KEY`
   - `GROQ_API_KEY`
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` (`https://your-backend-render-app.onrender.com/api/v1/calendar/callback`)
   - `FRONTEND_URL` (`https://your-frontend-app.vercel.app`)
   - `ADMIN_EMAIL` (`admin@clinic.com`)
   - `ADMIN_PASSWORD` (`AdminPassword123!`)
6. Click **Create Web Service**. Wait for the build and deployment to finish.
7. Run initial admin seed by opening the Render shell tab and running: `node scripts/seed-admin.js`.

### Step 4: Deploy Frontend Application (Vercel)
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Select `frontend` as the **Root Directory**.
5. Framework Preset: **Vite**.
6. Open **Environment Variables** and set:
   - `VITE_API_BASE_URL`: `https://your-backend-render-app.onrender.com`
7. Click **Deploy**.
8. Once deployed, copy your production Vercel URL and ensure it matches the `FRONTEND_URL` variable in your Render backend settings.

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
}

model LeaveDay {
  id       String        @id @default(uuid())
  doctorId String
  doctor   DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  date     DateTime      @db.Date
  reason   String?

  @@unique([doctorId, date])
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
  createdAt         DateTime          @default(now())
  symptomForm       SymptomForm?
  visitNote         VisitNote?

  @@unique([doctorId, startsAt])
  @@index([patientId])
  @@index([doctorId, startsAt])
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
Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Return valid JSON only with keys "urgency", "chiefComplaint", and "suggestedQuestions". Symptoms: <symptoms>
```

### Post-Visit Clinical Notes Prompt
```text
Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: <notes>. Prescription info: <prescriptionJSON>. Return valid JSON only with keys "patientSummary", "medicationSchedule", and "followUpSteps".
```
