# Healthcare Platform System Design Architecture Write-Up

## 1. Double-Booking Prevention Strategy

Preventing double-booking in a multi-user healthcare platform requires multi-layered concurrency enforcement to eliminate race conditions during simultaneous slot reservation attempts.

### Multi-Layer Concurrency Control
1. **Pessimistic Locking & Slot Hold Transaction**:
   When a patient selects a slot, the system executes a database transaction using explicit row locking (`SELECT ... FOR UPDATE` pattern via raw transaction query or atomic Prisma check). The system checks if an existing active appointment (`CONFIRMED`) or an unexpired hold (`PENDING` with `holdExpiresAt > NOW()`) occupies the exact doctor and start time window (`doctorId`, `startsAt`).
2. **Database Unique Constraint**:
   At the data storage layer, the `Appointment` table enforces a composite unique index constraint: `@@unique([doctorId, startsAt])`. Even if application-level locking is bypassed or suffers unexpected latency, PostgreSQL will reject duplicate inserts with a constraint violation error code (`P2002`). The API catches this error and gracefully translates it into a `409 Conflict` HTTP response.
3. **Real-time Slot Exclusion Filtering**:
   When generating available slots for a given date, the system queries all appointments for the doctor on that day and excludes any slot matching an active booking or active hold window.

---

## 2. Doctor Leave Conflict Handling

When an administrator marks a doctor as on leave for a specific date, existing patient appointments scheduled on that date must be resolved safely and atomically.

### Transactional Resolution & Notification Outbox
1. **Atomic State Mutation**:
   The admin leave creation operation (`POST /api/v1/admin/doctors/:id/leave`) is executed inside a single PostgreSQL database transaction.
   - A `LeaveDay` record is created for the specified doctor and date.
   - All existing appointments matching that doctor and date with status `CONFIRMED` or `PENDING` are updated to status `CANCELLED`.
   - For every affected appointment, an outbox `Notification` record of type `LEAVE_CONFLICT` is automatically generated and inserted into the `Notification` table within the same transaction.
2. **Calendar Clean-Up & Async Notifications**:
   Following the commit of the database transaction:
   - Synchronous calendar event removal requests are dispatched to Google Calendar API for patients and doctors who have authorized OAuth tokens.
   - Background notification workers pick up the queued `LEAVE_CONFLICT` notification records and dispatch email alerts containing details of the schedule change and instructions to rebook.

---

## 3. Slot Hold Mechanism

A temporary slot hold mechanism prevents two patients from filling out symptom forms simultaneously for the same slot while avoiding permanent slot blocking from abandoned sessions.

### Temporary Hold Lifecycle
1. **Hold Reservation (`POST /api/v1/appointments/hold`)**:
   A patient selects an available slot. The backend creates an `Appointment` record with status `PENDING` and sets `holdExpiresAt` to `NOW() + 2 minutes`. The API returns a unique `holdToken` (appointment UUID) to the client.
2. **Confirmation Within TTL (`POST /api/v1/appointments`)**:
   The client submits the symptom details along with the `holdToken`. The server verifies that the appointment remains in `PENDING` status and `holdExpiresAt` has not elapsed. Upon validation, the status changes to `CONFIRMED`, `holdExpiresAt` is cleared (`null`), and LLM pre-visit symptom analysis is dispatched asynchronously.
3. **Automated Expiry Cleanup**:
   A background cron job (`holdExpiry.js`) runs every 5 minutes and updates any `PENDING` appointment whose `holdExpiresAt` timestamp is less than or equal to the current time to `CANCELLED`, immediately restoring slot availability to the public calendar.

---

## 4. Notification Failure Handling & Reliability

Email dispatch to external providers (such as Resend or SMTP) is inherently vulnerable to network hiccups, rate limits, or service outages.

### Outbox Pattern with Retry Worker
1. **Transactional Outbox Persistence**:
   Notifications are never sent directly in the synchronous HTTP request-response cycle. Instead, events insert a `Notification` record with status `QUEUED`, attempt count `0`, and a payload containing all template variables.
2. **Asynchronous Background Worker**:
   A background cron process (`notificationWorker.js`) runs every 2 minutes. It queries records where `status IN ('QUEUED', 'FAILED')`, `attempts < 3`, and `nextRetryAt <= NOW()`.
3. **Exponential Backoff & Dead-Letter Audit**:
   If an email dispatch attempt fails, the worker increments `attempts`, sets `status = 'FAILED'`, and calculates an exponential backoff timestamp (`nextRetryAt = NOW() + attempts * 5 minutes`). If 3 attempts fail consecutively, the notification enters a permanent `FAILED` state, allowing administrators to audit undelivered messages via the Admin Notification Log dashboard.
