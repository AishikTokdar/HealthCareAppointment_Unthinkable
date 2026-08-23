function getLandingPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Healthcare Appointment API Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0b0f19;
      --bg-card: #111827;
      --bg-card-hover: #1f2937;
      --border-color: rgba(255, 255, 255, 0.08);
      --accent: #10b981;
      --accent-subtle: rgba(16, 185, 129, 0.12);
      --accent-border: rgba(16, 185, 129, 0.3);
      --text-main: #f9fafb;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding: 32px 16px;
      min-height: 100vh;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #fff;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--accent-subtle);
      border: 1px solid var(--accent-border);
      color: var(--accent);
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--accent);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent);
    }
    .action-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: #10b981;
      color: #042f2e;
    }
    .btn-primary:hover {
      background: #34d399;
    }
    .btn-secondary {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
    }
    .btn-secondary:hover {
      background: var(--bg-card-hover);
    }
    .grid-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 40px;
    }
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
    }
    .feature-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-main);
    }
    .feature-desc {
      font-size: 13px;
      color: var(--text-muted);
    }
    .section-heading {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .endpoints-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 40px;
    }
    .endpoint-row {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .endpoint-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .method {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      min-width: 58px;
      text-align: center;
    }
    .method-get { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .method-post { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .method-put { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .method-patch { background: rgba(139, 92, 246, 0.15); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
    .method-delete { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .path {
      font-family: var(--font-mono);
      font-size: 13px;
      color: var(--text-main);
      font-weight: 500;
    }
    .role-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 4px;
      background: var(--bg-card-hover);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
    }
    .desc {
      font-size: 13px;
      color: var(--text-muted);
    }
    footer {
      border-top: 1px solid var(--border-color);
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      color: var(--text-dim);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand-title">
        <div class="brand-icon">+</div>
        Healthcare API Server
      </div>
      <div class="status-badge">
        <div class="status-dot"></div>
        Backend Engine Live
      </div>
    </header>

    <div class="action-bar">
      <a href="https://healthcareappointment.pages.dev/" target="_blank" class="btn btn-primary">Open Frontend App ↗</a>
      <a href="/api/v1/health" target="_blank" class="btn btn-secondary">Health Check Endpoint</a>
      <a href="https://github.com/AishikTokdar/HealthCareAppointment_Unthinkable/blob/main/system-design.md" target="_blank" class="btn btn-secondary">System Architecture Doc ↗</a>
    </div>

    <div class="section-heading">Core System Services & Intelligence</div>
    <div class="grid-features">
      <div class="feature-card">
        <div class="feature-title">Pre-Visit AI Symptom Triage</div>
        <div class="feature-desc">Asynchronous Google Gemini 1.5 Flash / Groq pipeline producing urgency levels, chief complaints, and diagnostic questions.</div>
      </div>
      <div class="feature-card">
        <div class="feature-title">Concurrency & Slot Holds</div>
        <div class="feature-desc">Pessimistic row locking, 10-minute temporary holds, and PostgreSQL unique constraints avoiding double-booking.</div>
      </div>
      <div class="feature-card">
        <div class="feature-title">Real-time Presence & Consultation Chat</div>
        <div class="feature-desc">Doctor-patient live consultation sessions with 15-second presence heartbeat indicators and read-only transcript preservation.</div>
      </div>
      <div class="feature-card">
        <div class="feature-title">AI Drug Interaction Safety Checker</div>
        <div class="feature-desc">Real-time prescription analysis flagging contraindications and dosage anomalies before final visit record submission.</div>
      </div>
      <div class="feature-card">
        <div class="feature-title">Doctor Leave Conflict Resolution</div>
        <div class="feature-desc">Transactional leave approvals that automatically update conflicting bookings and dispatch notification outbox alerts.</div>
      </div>
      <div class="feature-card">
        <div class="feature-title">Self-Ping Keep-Alive Worker</div>
        <div class="feature-desc">Automated 12-minute keep-alive worker preventing free cloud deployment cold starts.</div>
      </div>
    </div>

    <div class="section-heading">API Endpoint Directory</div>
    <div class="endpoints-list">
      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/auth/register-patient</span>
        </div>
        <div class="desc">Registers a new patient account</div>
        <span class="role-badge">Public</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/auth/register-doctor</span>
        </div>
        <div class="desc">Submits doctor application for admin approval</div>
        <span class="role-badge">Public</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/auth/login</span>
        </div>
        <div class="desc">Authenticates user & returns JWT session token</div>
        <span class="role-badge">Public</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="path">/api/v1/doctors</span>
        </div>
        <div class="desc">Search & filter approved doctors by specialisation</div>
        <span class="role-badge">Public</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="path">/api/v1/doctors/:id/slots</span>
        </div>
        <div class="desc">Returns available time slots for a given date</div>
        <span class="role-badge">Public</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/appointments/hold</span>
        </div>
        <div class="desc">Reserves a 10-minute temporary slot hold</div>
        <span class="role-badge">Patient</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/appointments</span>
        </div>
        <div class="desc">Confirms appointment & triggers AI triage</div>
        <span class="role-badge">Patient</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-get">GET</span>
          <span class="path">/api/v1/appointments/:id</span>
        </div>
        <div class="desc">Fetches appointment details & symptom briefing</div>
        <span class="role-badge">Patient / Doctor</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/appointments/:id/start-chat</span>
        </div>
        <div class="desc">Initiates live consultation chat room</div>
        <span class="role-badge">Approved Doctor</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/appointments/:id/heartbeat</span>
        </div>
        <div class="desc">Polls messages & updates user online presence</div>
        <span class="role-badge">Patient / Doctor</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/visits/check-safety</span>
        </div>
        <div class="desc">Runs AI drug interaction & dosage safety check</div>
        <span class="role-badge">Approved Doctor</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-post">POST</span>
          <span class="path">/api/v1/visits</span>
        </div>
        <div class="desc">Saves visit note, prescription & triggers patient summary</div>
        <span class="role-badge">Approved Doctor</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-patch">PATCH</span>
          <span class="path">/api/v1/admin/doctors/:id/approve</span>
        </div>
        <div class="desc">Approves pending doctor registration profile</div>
        <span class="role-badge">Admin</span>
      </div>

      <div class="endpoint-row">
        <div class="endpoint-left">
          <span class="method method-patch">PATCH</span>
          <span class="path">/api/v1/admin/leave-requests/:id/approve</span>
        </div>
        <div class="desc">Approves doctor leave & cancels conflicting visits</div>
        <span class="role-badge">Admin</span>
      </div>
    </div>

    <footer>
      <div>Healthcare Platform Core Engine</div>
      <div>Node.js · Express · Prisma · PostgreSQL</div>
    </footer>
  </div>
</body>
</html>`;
}

module.exports = getLandingPageHtml;
