# Healthcare Platform System Design Architecture Write-Up

This document details the architectural decisions, concurrency patterns, and fail-safe mechanisms implemented in the Healthcare Appointment & Follow-up Manager.

---

## 1. Double-Booking & Concurrency Control Strategy

Preventing double-booking in a multi-user clinical scheduling app is one of the most critical challenges. If two patients attempt to select the same doctor slot at the exact same second, naive database checks will fail due to race conditions.

To guarantee zero double-bookings under concurrent traffic, we use a three-tier protection model:

### A. Transactional Hold Checks & Row Lock Queries
When a patient clicks an open slot, the backend opens a database transaction (`holdSlot`). It checks if there is already a `CONFIRMED` visit or an active `PENDING` hold at that exact `startsAt` time for the doctor. If another patient is currently reserving the slot, the request is rejected immediately with a `409 Conflict` status.

### B. PostgreSQL Composite Unique Index
At the database layer, the `Appointment` table enforces a composite unique constraint:
`@@unique([doctorId, startsAt])`

PostgreSQL guarantees that no two rows can share the same doctor ID and start time. Even if two concurrent API requests bypass application checks simultaneously, the database engine enforces isolation and rejects the second insert with a unique constraint violation error (`P2002`).

### C. Re-using Cancelled Slot Records
Because PostgreSQL enforces uniqueness on `(doctorId, startsAt)`, cancelling a booking does not delete the row—it updates its status to `CANCELLED`. If a patient later tries to book that previously cancelled slot, a standard `INSERT` query would trigger a unique constraint collision.

To solve this, our `holdSlot` transaction checks if a `CANCELLED` or expired `PENDING` row exists at `(doctorId, startsAt)`. If found, it safely reuses and updates that existing database row (`status: 'PENDING'`, new `patientId`, fresh `holdExpiresAt`, and reset chat/calendar fields) instead of failing.

---

## 2. Temporary Slot Hold Mechanism

Allowing patients to fill out symptom questionnaires without holding the slot causes frustration if the slot is snagged right before checkout. Conversely, holding slots indefinitely leads to abandoned sessions that block legitimate patients.

### Lifecycle of a Slot Hold:
1. **Hold Creation (`POST /api/v1/appointments/hold`)**:
   Reserves the slot for 10 minutes (`holdExpiresAt = NOW() + 10 mins`). A `holdToken` (appointment UUID) is returned to the client.
2. **Booking Confirmation (`POST /api/v1/appointments`)**:
   The patient submits their symptom details along with the `holdToken`. The backend validates that the hold belongs to the user, has status `PENDING`, and has not expired. The status transitions to `CONFIRMED`, `holdExpiresAt` is cleared to `null`, and AI triage analysis is triggered.
3. **Automated Hold Cleanup (`jobs/holdExpiry.js`)**:
   A background cron job runs every minute. Any `PENDING` appointment whose `holdExpiresAt` timestamp has passed is automatically marked as `CANCELLED`, returning the slot to the public schedule.

---

## 3. Doctor Leave Approvals & Conflict Resolution

When a doctor requests leave and an administrator approves it (`POST /api/v1/admin/leave-requests/:id/approve`), all patient visits previously booked on those leave dates must be handled atomically.

### How Conflict Resolution Works:
1. **Single Database Transaction**:
   The approval process runs inside a single database transaction. The system adds the leave dates to the doctor's profile, updates all conflicting `CONFIRMED` and `PENDING` visits to `CANCELLED`, and inserts `LEAVE_CONFLICT` outbox records into the `Notification` table.
2. **Calendar Event Removal**:
   For any canceled visits synced with Google Calendar, the server dispatches removal requests to the Google Calendar API.
3. **Automated Patient Emails**:
   The background notification worker picks up the `LEAVE_CONFLICT` outbox entries and emails each patient explaining that their doctor is on approved leave, providing instructions to rebook.

---

## 4. Live Consultation Chat & Presence Heartbeats

Remote consultations require real-time communication between doctor and patient, clear session boundaries, and accurate online presence indicators.

### Session Lifecycle & Presence Tracking:
- **State Flow**: `NOT_STARTED` ➔ `ACTIVE` ➔ `CLOSED`.
- **Doctor Control**: Only the assigned doctor can initiate the chat (`startChat`). Live chat can only be opened if the visit status is `CONFIRMED`.
- **Heartbeat & Presence**: While in an active chat, the frontend sends a heartbeat payload every 4 seconds (`POST /api/v1/appointments/:id/heartbeat`). The server records `patientLastSeen` and `doctorLastSeen`. If a user's timestamp is within 15 seconds of `NOW()`, the UI shows a green "Online" indicator.
- **Transcript Preservation**: When a doctor or patient ends the chat, `chatStatus` changes to `CLOSED`. The send-message input is hidden, but the entire message transcript remains accessible in read-only mode so both parties can review consultation notes anytime.

---

## 5. AI Triage, Drug Interaction Safety & Clean Text Formatting

The platform incorporates artificial intelligence to streamline clinical workflows while enforcing safety boundaries.

### A. Dual LLM Pipeline with Failover
We use **Google Gemini 1.5 Flash** as our primary model for symptom triage, post-visit summary generation, and doctor message refinement. If Gemini experiences rate limits or network issues, the system automatically fails over to **Groq (Llama-3.3-70B)**. If both LLM services are unreachable, deterministic rule engines take over (e.g. basic red-flag symptom checks and clinical safety rules) so the app never crashes.

### B. Prescription Safety Checker
Before a doctor saves a prescription, they can run an AI Safety Check (`POST /api/v1/visits/check-safety`). The engine evaluates prescribed drug combinations against patient symptoms and known contraindications (e.g. Warfarin + Aspirin hemorrhage risks, Sildenafil + Nitrates blood pressure drops). It flags warnings categorized into `SAFE`, `WARNING`, or `CRITICAL`.

### C. Clean Text Sanitization
Language models frequently return raw markdown syntax (such as `* **Hydration:** ...`). To prevent ugly markdown symbols from leaking into text textareas or patient view cards, both the backend LLM service and frontend components pass AI outputs through a `cleanText()` sanitizer, converting raw asterisks into clean plain-text bullet points (`• Hydration:`).

---

## 6. Notification Outbox Pattern & Background Workers

Sending emails synchronously during HTTP requests creates latency and causes user-facing errors if the email service suffers a hiccup.

### Outbox Pattern Implementation:
1. **Transactional Insertion**:
   Whenever an event occurs (booking confirmation, cancellation, leave conflict, medication reminder), the system writes a `Notification` record to the database with `status: 'QUEUED'` and `attempts: 0`.
2. **Background Worker (`jobs/notificationWorker.js`)**:
   A background worker queries pending notifications every minute and sends them via Resend API.
3. **Exponential Backoff & Dead-Letter Handling**:
   If an email fails to send, the worker increments the attempt counter and sets a retry delay (`nextRetryAt = NOW() + attempts * 5 mins`). After 3 failed attempts, the notification is marked as `FAILED` for administrative review.

---

## 7. Free-Tier Keep-Alive Service

To prevent cold-start delays on free cloud hosting platforms like Render (where web services spin down after 15 minutes of inactivity), the backend includes an automated keep-alive worker (`jobs/keepAlive.js`).

Every 12 minutes, the worker sends an HTTP `GET` request to its own `/api/v1/health` endpoint. This light self-ping keeps the Node.js event loop active and ensures the backend stays warm 24/7 without extra infrastructure costs.
