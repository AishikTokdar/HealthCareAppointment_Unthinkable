function getLandingPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Healthcare Appointment API — Documentation</title>
  <meta name="description" content="REST API documentation for the Healthcare Appointment Platform. Covers auth, appointments, doctors, visits, calendar sync and admin endpoints.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #080c14;
      --bg-card: #0f1623;
      --bg-card-hover: #162033;
      --bg-card-section: #111827;
      --border: rgba(255,255,255,0.07);
      --border-accent: rgba(16,185,129,0.3);
      --accent: #10b981;
      --accent-subtle: rgba(16,185,129,0.1);
      --accent-glow: rgba(16,185,129,0.15);
      --blue: #60a5fa;
      --blue-subtle: rgba(59,130,246,0.12);
      --blue-border: rgba(59,130,246,0.25);
      --green: #34d399;
      --green-subtle: rgba(52,211,153,0.12);
      --yellow: #fbbf24;
      --yellow-subtle: rgba(245,158,11,0.12);
      --yellow-border: rgba(245,158,11,0.25);
      --purple: #a78bfa;
      --purple-subtle: rgba(139,92,246,0.12);
      --purple-border: rgba(139,92,246,0.25);
      --red: #f87171;
      --red-subtle: rgba(239,68,68,0.12);
      --red-border: rgba(239,68,68,0.25);
      --orange: #fb923c;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --font-sans: 'Inter', system-ui, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --radius: 12px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-sans);
      line-height: 1.6;
      min-height: 100vh;
    }

    /* ─── Layout ─── */
    .sidebar {
      position: fixed;
      top: 0; left: 0;
      width: 240px;
      height: 100vh;
      background: var(--bg-card);
      border-right: 1px solid var(--border);
      overflow-y: auto;
      padding: 24px 0;
      z-index: 100;
    }
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 20px 20px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 16px;
    }
    .logo-icon {
      width: 30px; height: 30px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 16px; color: #fff;
      flex-shrink: 0;
    }
    .logo-text { font-size: 13px; font-weight: 700; line-height: 1.2; }
    .logo-sub { font-size: 10px; color: var(--text-dim); font-weight: 400; }
    .nav-group { margin-bottom: 4px; }
    .nav-group-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-dim);
      padding: 10px 20px 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 20px;
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.15s ease;
      border-left: 2px solid transparent;
    }
    .nav-item:hover { color: var(--text-main); background: var(--accent-subtle); border-left-color: var(--accent); }
    .nav-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; opacity: 0.5; }

    .main-content {
      margin-left: 240px;
      min-height: 100vh;
    }

    /* ─── Hero ─── */
    .hero {
      background: linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 60%);
      border-bottom: 1px solid var(--border);
      padding: 56px 48px 40px;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -80px; right: -80px;
      width: 400px; height: 400px;
      background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .hero-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }
    .hero-title {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.15;
      background: linear-gradient(135deg, #f1f5f9 30%, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle { font-size: 15px; color: var(--text-muted); margin-top: 8px; max-width: 500px; }
    .status-live {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--accent-subtle);
      border: 1px solid var(--border-accent);
      color: var(--accent);
      padding: 8px 16px;
      border-radius: 99px;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
    }
    .pulse {
      width: 8px; height: 8px;
      background: var(--accent);
      border-radius: 50%;
      box-shadow: 0 0 0 0 rgba(16,185,129,0.4);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
      70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
      100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }

    /* ─── Health Stats Bar ─── */
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      transition: border-color 0.2s;
    }
    .stat-card:hover { border-color: rgba(16,185,129,0.25); }
    .stat-value {
      font-size: 26px;
      font-weight: 800;
      font-family: var(--font-mono);
      color: var(--text-main);
      letter-spacing: -0.02em;
      line-height: 1;
      margin-bottom: 4px;
    }
    .stat-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .stat-status { font-size: 10px; color: var(--accent); font-weight: 600; margin-top: 6px; }

    /* ─── Action Buttons ─── */
    .action-bar { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 16px;
      border-radius: 8px;
      font-size: 13px; font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer; border: none;
    }
    .btn-primary { background: var(--accent); color: #042f2e; }
    .btn-primary:hover { background: #34d399; transform: translateY(-1px); }
    .btn-ghost { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); }
    .btn-ghost:hover { color: var(--text-main); border-color: rgba(255,255,255,0.15); }

    /* ─── Section ─── */
    .section { padding: 40px 48px; border-bottom: 1px solid var(--border); }
    .section:last-child { border-bottom: none; }
    .section-title {
      font-size: 20px; font-weight: 700;
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 6px;
    }
    .section-title-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px;
    }
    .section-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }

    /* ─── Endpoint Groups ─── */
    .group-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-dim);
      margin: 28px 0 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .group-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    /* ─── Endpoint Row ─── */
    .endpoint-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin-bottom: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .endpoint-card:hover { border-color: rgba(255,255,255,0.12); }
    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      cursor: pointer;
      flex-wrap: wrap;
    }
    .method {
      font-family: var(--font-mono);
      font-size: 11px; font-weight: 700;
      padding: 4px 10px;
      border-radius: 5px;
      text-transform: uppercase;
      min-width: 60px; text-align: center;
      flex-shrink: 0;
    }
    .m-get    { background: var(--blue-subtle);   color: var(--blue);   border: 1px solid var(--blue-border); }
    .m-post   { background: var(--green-subtle);  color: var(--green);  border: 1px solid rgba(52,211,153,0.3); }
    .m-put    { background: var(--yellow-subtle); color: var(--yellow); border: 1px solid var(--yellow-border); }
    .m-patch  { background: var(--purple-subtle); color: var(--purple); border: 1px solid var(--purple-border); }
    .m-delete { background: var(--red-subtle);    color: var(--red);    border: 1px solid var(--red-border); }
    .path {
      font-family: var(--font-mono);
      font-size: 13px; font-weight: 500;
      color: var(--text-main);
      flex: 1;
    }
    .endpoint-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-left: auto; }
    .role-badge {
      font-size: 10px; font-weight: 700;
      padding: 3px 8px; border-radius: 4px;
      letter-spacing: 0.04em;
    }
    .role-public  { background: rgba(100,116,139,0.2); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3); }
    .role-patient { background: rgba(59,130,246,0.12); color: #93c5fd; border: 1px solid rgba(59,130,246,0.25); }
    .role-doctor  { background: rgba(16,185,129,0.12); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.25); }
    .role-admin   { background: rgba(245,158,11,0.12); color: #fcd34d; border: 1px solid rgba(245,158,11,0.25); }
    .role-auth    { background: rgba(139,92,246,0.12); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.25); }
    .endpoint-desc {
      font-size: 13px; color: var(--text-muted);
      padding: 0 18px 14px;
      padding-left: 102px;
    }
    .endpoint-body {
      border-top: 1px solid var(--border);
      padding: 16px 18px;
      background: rgba(0,0,0,0.2);
      display: none;
    }
    .endpoint-card.open .endpoint-body { display: block; }
    .endpoint-card.open .endpoint-header { border-bottom: none; }
    .detail-label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--text-dim); margin-bottom: 6px; margin-top: 12px;
    }
    .detail-label:first-child { margin-top: 0; }
    pre {
      font-family: var(--font-mono);
      font-size: 12px;
      background: rgba(0,0,0,0.4);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      overflow-x: auto;
      color: #a5f3fc;
      line-height: 1.7;
      white-space: pre-wrap;
    }
    .tag-auth { color: #fbbf24; }
    .tag-str  { color: #86efac; }
    .tag-num  { color: #93c5fd; }
    .tag-key  { color: #e2e8f0; }
    .tag-bool { color: #f9a8d4; }
    .error-row {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    .error-row:last-child { border-bottom: none; }
    .error-code {
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--red);
      min-width: 40px;
    }
    .error-name { font-weight: 600; color: var(--text-main); min-width: 160px; }
    .error-desc { color: var(--text-muted); }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
    }
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: all 0.2s ease;
    }
    .feature-card:hover { border-color: rgba(16,185,129,0.25); transform: translateY(-2px); }
    .feature-icon { font-size: 22px; margin-bottom: 10px; }
    .feature-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .feature-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
    .chip {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 99px;
      font-size: 11px; font-weight: 600;
      background: var(--accent-subtle);
      border: 1px solid var(--border-accent);
      color: var(--accent);
    }
    footer {
      padding: 28px 48px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-left { font-size: 13px; color: var(--text-dim); }
    .footer-right { display: flex; gap: 16px; font-size: 12px; color: var(--text-dim); }
    .footer-right a { color: var(--text-muted); text-decoration: none; }
    .footer-right a:hover { color: var(--text-main); }
    .health-status-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; font-family: var(--font-mono);
      padding: 6px 0;
      border-bottom: 1px solid var(--border);
    }
    .health-status-row:last-child { border-bottom: none; }
    .dot-ok  { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 6px var(--accent); flex-shrink: 0; }
    .dot-warn { width: 8px; height: 8px; border-radius: 50%; background: var(--yellow); flex-shrink: 0; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
      .main-content { margin-left: 0; }
      .hero, .section, footer { padding-left: 20px; padding-right: 20px; }
      .endpoint-desc { padding-left: 18px; }
    }
  </style>
</head>
<body>

  <!-- Sidebar Navigation -->
  <nav class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">+</div>
      <div>
        <div class="logo-text">Healthcare API</div>
        <div class="logo-sub">REST Documentation</div>
      </div>
    </div>

    <div class="nav-group">
      <div class="nav-group-label">Overview</div>
      <a href="#overview" class="nav-item"><span class="nav-dot"></span>Getting Started</a>
      <a href="#health" class="nav-item"><span class="nav-dot"></span>Health Check</a>
      <a href="#features" class="nav-item"><span class="nav-dot"></span>System Features</a>
    </div>
    <div class="nav-group">
      <div class="nav-group-label">Endpoints</div>
      <a href="#auth" class="nav-item"><span class="nav-dot"></span>Authentication</a>
      <a href="#doctors" class="nav-item"><span class="nav-dot"></span>Doctors</a>
      <a href="#appointments" class="nav-item"><span class="nav-dot"></span>Appointments</a>
      <a href="#symptoms" class="nav-item"><span class="nav-dot"></span>Symptoms / AI</a>
      <a href="#visits" class="nav-item"><span class="nav-dot"></span>Visit Notes</a>
      <a href="#calendar" class="nav-item"><span class="nav-dot"></span>Google Calendar</a>
      <a href="#admin" class="nav-item"><span class="nav-dot"></span>Admin</a>
    </div>
    <div class="nav-group">
      <div class="nav-group-label">Reference</div>
      <a href="#errors" class="nav-item"><span class="nav-dot"></span>Error Codes</a>
      <a href="#ratelimit" class="nav-item"><span class="nav-dot"></span>Rate Limiting</a>
    </div>
  </nav>

  <!-- Main Content -->
  <div class="main-content">

    <!-- Hero -->
    <section class="hero" id="overview">
      <div class="hero-top">
        <div>
          <div class="hero-title">Healthcare Appointment<br>API Documentation</div>
          <div class="hero-subtitle">A production-grade REST API for scheduling, AI triage, consultation chat, and Google Calendar sync. All endpoints run on <code style="font-family:var(--font-mono);font-size:12px;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">/api/v1/</code></div>
        </div>
        <div class="status-live"><span class="pulse"></span>Backend Engine Online</div>
      </div>

      <!-- Live stats populated by /api/v1/health -->
      <div class="stats-bar" id="stats-bar">
        <div class="stat-card"><div class="stat-value" id="stat-doctors">—</div><div class="stat-label">Active Doctors</div></div>
        <div class="stat-card"><div class="stat-value" id="stat-patients">—</div><div class="stat-label">Registered Patients</div></div>
        <div class="stat-card"><div class="stat-value" id="stat-confirmed">—</div><div class="stat-label">Live Appointments</div></div>
        <div class="stat-card"><div class="stat-value" id="stat-completed">—</div><div class="stat-label">Completed Visits</div></div>
        <div class="stat-card"><div class="stat-value" id="stat-uptime">—</div><div class="stat-label">Uptime</div><div class="stat-status" id="stat-db">Checking...</div></div>
        <div class="stat-card"><div class="stat-value" id="stat-node">—</div><div class="stat-label">Node Version</div><div class="stat-status" id="stat-env">—</div></div>
      </div>

      <div class="action-bar">
        <a href="https://healthcareappointment.pages.dev/" target="_blank" class="btn btn-primary">Open Frontend App ↗</a>
        <a href="/api/v1/health" target="_blank" class="btn btn-ghost">Live Health JSON ↗</a>
        <a href="https://github.com/AishikTokdar/HealthCareAppointment_Unthinkable" target="_blank" class="btn btn-ghost">GitHub Repo ↗</a>
      </div>
    </section>

    <!-- System Features -->
    <section class="section" id="features">
      <div class="section-title">
        <div class="section-title-icon" style="background:rgba(16,185,129,0.12)">AI</div>
        Core System Services
      </div>
      <div class="section-desc">All intelligence runs asynchronously so booking confirmation is always instant.</div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">AI</div>
          <div class="feature-title">Pre-Visit AI Symptom Triage</div>
          <div class="feature-desc">Async Google Gemini / Groq pipeline produces urgency levels (LOW / MEDIUM / HIGH / URGENT), chief complaints, and diagnostic questions from raw patient input.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">DB</div>
          <div class="feature-title">Concurrency-Safe Slot Holds</div>
          <div class="feature-desc">Pessimistic locking via PostgreSQL unique constraint + 10-minute hold expiry job. Max 3 simultaneous holds per patient to prevent abuse.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">CH</div>
          <div class="feature-title">Real-time Consultation Chat</div>
          <div class="feature-desc">Doctor-patient live sessions with 4-second heartbeat presence polling, AI message refinement, and immutable transcript preservation post-closure.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">RX</div>
          <div class="feature-title">AI Drug Interaction Safety</div>
          <div class="feature-desc">Pre-submission prescription analysis flags contraindications and dosage anomalies using LLM before visit notes are saved to the database.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">GC</div>
          <div class="feature-title">Google Calendar Bidirectional Sync</div>
          <div class="feature-desc">OAuth 2.0 flow syncs appointments to both patient and doctor calendars. Events are updated on reschedule and deleted on cancellation automatically.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">NT</div>
          <div class="feature-title">Notification Outbox + Email</div>
          <div class="feature-desc">Every domain event (booking, cancellation, reschedule, leave) enqueues a Resend email notification with retry logic (3 attempts, exponential backoff).</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">LV</div>
          <div class="feature-title">Leave Conflict Resolution</div>
          <div class="feature-desc">When admin approves doctor leave, affected appointments are cancelled transactionally and all impacted patients receive immediate email notifications.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">RT</div>
          <div class="feature-title">CSAT Rating System</div>
          <div class="feature-desc">Patients submit 1–5 star ratings and written feedback after completed appointments. Ratings are visible on the doctor portal and aggregated in the admin dashboard.</div>
        </div>
      </div>
    </section>

    <!-- Health Check -->
    <section class="section" id="health">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--green-subtle)">HB</div>
        Health Check
      </div>
      <div class="section-desc">Returns live platform statistics, uptime, and database connectivity status. Safe to call without authentication.</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/health</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Public</span></div>
        </div>
        <div class="endpoint-desc">Returns server status, uptime, Node version, environment, live DB stats (doctor/patient/appointment counts), and background job statuses.</div>
        <div class="endpoint-body" style="display:block">
          <div class="detail-label">200 OK — Response</div>
          <pre>{
  <span class="tag-key">"status"</span>: <span class="tag-str">"ok"</span>,
  <span class="tag-key">"timestamp"</span>: <span class="tag-str">"2026-08-24T14:45:00.000Z"</span>,
  <span class="tag-key">"uptime"</span>: {
    <span class="tag-key">"seconds"</span>: <span class="tag-num">3600</span>,
    <span class="tag-key">"human"</span>: <span class="tag-str">"1h 0m 0s"</span>
  },
  <span class="tag-key">"environment"</span>: <span class="tag-str">"production"</span>,
  <span class="tag-key">"version"</span>: <span class="tag-str">"1.0.0"</span>,
  <span class="tag-key">"node"</span>: <span class="tag-str">"v20.11.0"</span>,
  <span class="tag-key">"database"</span>: <span class="tag-str">"connected"</span>,
  <span class="tag-key">"stats"</span>: {
    <span class="tag-key">"approvedDoctors"</span>: <span class="tag-num">12</span>,
    <span class="tag-key">"pendingDoctors"</span>: <span class="tag-num">2</span>,
    <span class="tag-key">"totalPatients"</span>: <span class="tag-num">148</span>,
    <span class="tag-key">"confirmedAppointments"</span>: <span class="tag-num">31</span>,
    <span class="tag-key">"completedAppointments"</span>: <span class="tag-num">219</span>,
    <span class="tag-key">"pendingNotifications"</span>: <span class="tag-num">0</span>
  },
  <span class="tag-key">"services"</span>: {
    <span class="tag-key">"notificationWorker"</span>: <span class="tag-str">"running"</span>,
    <span class="tag-key">"holdExpiryJob"</span>: <span class="tag-str">"running"</span>,
    <span class="tag-key">"appointmentReminderJob"</span>: <span class="tag-str">"running"</span>,
    <span class="tag-key">"medicationReminderJob"</span>: <span class="tag-str">"running"</span>,
    <span class="tag-key">"keepAliveWorker"</span>: <span class="tag-str">"running"</span>
  }
}</pre>
          <div class="detail-label">503 Service Unavailable — Database down</div>
          <pre>{
  <span class="tag-key">"status"</span>: <span class="tag-str">"degraded"</span>,
  <span class="tag-key">"database"</span>: <span class="tag-str">"disconnected"</span>,
  <span class="tag-key">"error"</span>: <span class="tag-str">"Database connectivity issue"</span>
}</pre>
        </div>
      </div>
    </section>

    <!-- AUTH -->
    <section class="section" id="auth">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--purple-subtle)">AU</div>
        Authentication
      </div>
      <div class="section-desc">All protected routes require <code style="font-family:var(--font-mono);font-size:12px;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">Authorization: Bearer &lt;JWT&gt;</code> header. Tokens expire after 7 days.</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/auth/register</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Public</span></div>
        </div>
        <div class="endpoint-desc">Register a new patient account. Returns JWT token immediately after registration.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"email"</span>: <span class="tag-str">"patient@example.com"</span>, <span class="tag-key">"password"</span>: <span class="tag-str">"min6chars"</span>, <span class="tag-key">"name"</span>: <span class="tag-str">"Jane Doe"</span>, <span class="tag-key">"phone"</span>: <span class="tag-str">"+91-9876543210"</span> }</pre>
          <div class="detail-label">201 Created</div>
          <pre>{ <span class="tag-key">"token"</span>: <span class="tag-str">"eyJ..."</span>, <span class="tag-key">"user"</span>: { <span class="tag-key">"id"</span>: <span class="tag-str">"uuid"</span>, <span class="tag-key">"email"</span>: <span class="tag-str">"..."</span>, <span class="tag-key">"name"</span>: <span class="tag-str">"..."</span>, <span class="tag-key">"role"</span>: <span class="tag-str">"PATIENT"</span> } }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/auth/register/doctor</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Public</span></div>
        </div>
        <div class="endpoint-desc">Submit a doctor application. Account is created immediately but requires admin approval before accessing doctor-only endpoints. Status returned as <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">approvalStatus: "PENDING"</code>.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"email"</span>: <span class="tag-str">"dr.smith@hospital.com"</span>, <span class="tag-key">"password"</span>: <span class="tag-str">"securepass"</span>, <span class="tag-key">"name"</span>: <span class="tag-str">"Dr. Smith"</span>, <span class="tag-key">"specialisation"</span>: <span class="tag-str">"Cardiology"</span>, <span class="tag-key">"slotDuration"</span>: <span class="tag-num">30</span>, <span class="tag-key">"workingHours"</span>: { <span class="tag-key">"MON"</span>: { <span class="tag-key">"start"</span>: <span class="tag-str">"10:00"</span>, <span class="tag-key">"end"</span>: <span class="tag-str">"18:00"</span> }, ... }, <span class="tag-key">"bio"</span>: <span class="tag-str">"Optional bio"</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/auth/login</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Public</span></div>
        </div>
        <div class="endpoint-desc">Authenticate any user (patient, doctor, admin). Returns JWT + profile including <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">hasGcalConnected</code> flag and last 10 notifications.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"email"</span>: <span class="tag-str">"user@example.com"</span>, <span class="tag-key">"password"</span>: <span class="tag-str">"password123"</span> }</pre>
          <div class="detail-label">200 OK</div>
          <pre>{ <span class="tag-key">"token"</span>: <span class="tag-str">"eyJ..."</span>, <span class="tag-key">"user"</span>: { <span class="tag-key">"id"</span>: <span class="tag-str">"uuid"</span>, <span class="tag-key">"role"</span>: <span class="tag-str">"DOCTOR"</span>, <span class="tag-key">"hasGcalConnected"</span>: <span class="tag-bool">false</span>, <span class="tag-key">"doctorProfile"</span>: { <span class="tag-key">"approvalStatus"</span>: <span class="tag-str">"APPROVED"</span> }, <span class="tag-key">"notifications"</span>: [...] } }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/auth/me</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Authenticated</span></div>
        </div>
        <div class="endpoint-desc">Returns the current user's profile, doctor profile (if doctor), and recent notifications. Used by frontend on page load to verify session.</div>
      </div>
    </section>

    <!-- DOCTORS -->
    <section class="section" id="doctors">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--blue-subtle)">DR</div>
        Doctors
      </div>
      <div class="section-desc">Public doctor search and slot availability. Doctor-specific schedule management requires authentication.</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/doctors?specialisation=Cardiology</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Public</span></div>
        </div>
        <div class="endpoint-desc">Search all approved, active doctors. Optional query param <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">?specialisation=</code> filters by case-insensitive partial match.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/doctors/:id</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Public</span></div>
        </div>
        <div class="endpoint-desc">Get a single doctor's public profile (name, specialisation, working hours, bio, avatar). Returns 404 if not found or inactive.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/doctors/:id/slots?date=2026-08-25</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Public</span></div>
        </div>
        <div class="endpoint-desc">Returns time slots for a doctor on a given date (10:00–18:00 window, based on slotDuration). Each slot includes <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">available</code>, <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">isBooked</code>, <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">isPast</code>.</div>
        <div class="endpoint-body">
          <div class="detail-label">200 OK</div>
          <pre>{
  <span class="tag-key">"available"</span>: <span class="tag-bool">true</span>,
  <span class="tag-key">"slots"</span>: [
    { <span class="tag-key">"startsAt"</span>: <span class="tag-str">"2026-08-25T04:30:00.000Z"</span>, <span class="tag-key">"endsAt"</span>: <span class="tag-str">"2026-08-25T05:00:00.000Z"</span>, <span class="tag-key">"available"</span>: <span class="tag-bool">true</span>, <span class="tag-key">"isBooked"</span>: <span class="tag-bool">false</span>, <span class="tag-key">"isPast"</span>: <span class="tag-bool">false</span> },
    { <span class="tag-key">"startsAt"</span>: <span class="tag-str">"2026-08-25T05:00:00.000Z"</span>, ..., <span class="tag-key">"available"</span>: <span class="tag-bool">false</span>, <span class="tag-key">"isBooked"</span>: <span class="tag-bool">true</span> }
  ]
}</pre>
          <div class="detail-label">200 OK — Doctor on leave</div>
          <pre>{ <span class="tag-key">"available"</span>: <span class="tag-bool">false</span>, <span class="tag-key">"reason"</span>: <span class="tag-str">"Doctor is on leave on this date"</span>, <span class="tag-key">"slots"</span>: [] }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/doctors/me/appointments</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Returns all appointments assigned to the authenticated doctor, ordered chronologically. Includes patient details, symptom forms, and visit notes.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/doctors/me/leave-requests</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Submit a leave request for admin approval. One pending request per date is allowed. Admin and doctor both receive email notifications.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"date"</span>: <span class="tag-str">"2026-09-10"</span>, <span class="tag-key">"reason"</span>: <span class="tag-str">"Family emergency"</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/doctors/me/leave-requests</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Returns all leave requests submitted by the authenticated doctor (PENDING / APPROVED / REJECTED), ordered by submission date.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/doctors/patient-history/:patientId</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">View a patient's full appointment and medical history. Access is restricted to doctors who have an existing appointment with the patient to protect privacy.</div>
      </div>
    </section>

    <!-- APPOINTMENTS -->
    <section class="section" id="appointments">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--accent-subtle)">AP</div>
        Appointments
      </div>
      <div class="section-desc">Two-phase booking flow: hold a slot (10 min timer), then confirm with symptoms. Reschedule and cancel handle Google Calendar sync automatically.</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments/hold</span>
          <div class="endpoint-meta"><span class="role-badge role-patient">Patient</span></div>
        </div>
        <div class="endpoint-desc">Temporarily reserves a slot for 10 minutes. Returns a <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">holdToken</code> (appointment ID) required for confirmation. Max 3 simultaneous holds per patient.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"doctorId"</span>: <span class="tag-str">"uuid"</span>, <span class="tag-key">"startsAt"</span>: <span class="tag-str">"2026-08-25T10:00:00.000Z"</span> }</pre>
          <div class="detail-label">201 Created</div>
          <pre>{ <span class="tag-key">"holdToken"</span>: <span class="tag-str">"uuid"</span>, <span class="tag-key">"expiresAt"</span>: <span class="tag-str">"2026-08-25T09:10:00.000Z"</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments</span>
          <div class="endpoint-meta"><span class="role-badge role-patient">Patient</span></div>
        </div>
        <div class="endpoint-desc">Confirms a held slot. Triggers async AI symptom triage and Google Calendar event creation for both patient and doctor. Sends booking confirmation email.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"holdToken"</span>: <span class="tag-str">"uuid"</span>, <span class="tag-key">"symptoms"</span>: <span class="tag-str">"Persistent headache and mild fever for 3 days..."</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/appointments</span>
          <div class="endpoint-meta"><span class="role-badge role-patient">Patient</span></div>
        </div>
        <div class="endpoint-desc">Returns all appointments for the authenticated patient, ordered most recent first. Includes doctor info, symptom form, and visit note.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/appointments/:id</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Patient / Doctor / Admin</span></div>
        </div>
        <div class="endpoint-desc">Returns full appointment detail. Access: patients can only view own appointments; doctors can only view appointments assigned to them; admins can view all.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-put">PUT</span>
          <span class="path">/api/v1/appointments/:id/reschedule</span>
          <div class="endpoint-meta"><span class="role-badge role-patient">Patient</span></div>
        </div>
        <div class="endpoint-desc">Reschedules a CONFIRMED appointment to a new slot. Validates conflicts, checks doctor leave, updates or creates Google Calendar events for both parties. Notifies doctor by email.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"startsAt"</span>: <span class="tag-str">"2026-08-28T11:00:00.000Z"</span> }</pre>
          <div class="detail-label">Errors</div>
          <pre><span class="tag-num">409</span> — "The doctor already has another appointment scheduled at this time."
<span class="tag-num">400</span> — "The doctor is marked on leave for this date."
<span class="tag-num">400</span> — "Only confirmed appointments can be rescheduled."</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-delete">DELETE</span>
          <span class="path">/api/v1/appointments/:id</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Patient / Doctor / Admin</span></div>
        </div>
        <div class="endpoint-desc">Cancels an appointment. Deletes Google Calendar events from both patient and doctor calendars. Frees the slot for other bookings immediately. Sends cancellation email.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body (optional)</div>
          <pre>{ <span class="tag-key">"reason"</span>: <span class="tag-str">"Personal emergency"</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-patch">PATCH</span>
          <span class="path">/api/v1/appointments/:id/complete</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Marks a CONFIRMED appointment as COMPLETED and closes the chat session. Only the assigned doctor may call this endpoint.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments/:id/rate</span>
          <div class="endpoint-meta"><span class="role-badge role-patient">Patient</span></div>
        </div>
        <div class="endpoint-desc">Submit a CSAT rating (1–5) and optional written feedback for a COMPLETED appointment. Ratings are visible on doctor and admin dashboards.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"rating"</span>: <span class="tag-num">5</span>, <span class="tag-key">"feedback"</span>: <span class="tag-str">"Dr. was very thorough and kind."</span> }</pre>
        </div>
      </div>

      <div class="group-label">Consultation Chat</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments/:id/start-chat</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Opens the live consultation chat room for a CONFIRMED appointment. Chat status transitions from NOT_STARTED to ACTIVE.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments/:id/heartbeat</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Patient / Doctor</span></div>
        </div>
        <div class="endpoint-desc">Updates user presence timestamp and returns latest messages, chat status, and counterpart online indicator. Called every 4 seconds by the frontend polling loop.</div>
        <div class="endpoint-body">
          <div class="detail-label">200 OK</div>
          <pre>{ <span class="tag-key">"chatStatus"</span>: <span class="tag-str">"ACTIVE"</span>, <span class="tag-key">"isCounterpartOnline"</span>: <span class="tag-bool">true</span>, <span class="tag-key">"messages"</span>: [...] }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments/:id/messages</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Patient / Doctor</span></div>
        </div>
        <div class="endpoint-desc">Sends a chat message. Only allowed when chatStatus is ACTIVE. Messages are persisted and immutable after chat closes.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"message"</span>: <span class="tag-str">"Hello doctor, my pain is now a 7/10."</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/appointments/:id/messages</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Patient / Doctor</span></div>
        </div>
        <div class="endpoint-desc">Returns all chat messages for an appointment in chronological order. Includes sender name and role.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments/:id/close-chat</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Patient / Doctor</span></div>
        </div>
        <div class="endpoint-desc">Closes the active chat session. After this, no new messages can be sent. Transcript is preserved permanently.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/appointments/:id/ai-refine</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Passes a doctor's draft chat message through an LLM to produce a clearer, more professional clinical phrasing while preserving medical intent.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"draft"</span>: <span class="tag-str">"The patient should avoid ibuprofen"</span> }</pre>
          <div class="detail-label">200 OK</div>
          <pre>{ <span class="tag-key">"refinedText"</span>: <span class="tag-str">"Based on your history, NSAIDs including ibuprofen are contraindicated. Please use paracetamol as an alternative."</span> }</pre>
        </div>
      </div>
    </section>

    <!-- SYMPTOMS -->
    <section class="section" id="symptoms">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--yellow-subtle)">AI</div>
        Symptoms & AI Triage
      </div>
      <div class="section-desc">Symptom forms are auto-created during appointment confirmation. These endpoints allow re-submission and viewing of AI-generated triage summaries.</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/symptoms</span>
          <div class="endpoint-meta"><span class="role-badge role-patient">Patient</span></div>
        </div>
        <div class="endpoint-desc">Manually submit or update a symptom form for an appointment. Triggers async AI triage pipeline (urgency classification, chief complaint extraction, suggested diagnostic questions).</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"appointmentId"</span>: <span class="tag-str">"uuid"</span>, <span class="tag-key">"rawSymptoms"</span>: <span class="tag-str">"Severe chest tightness and shortness of breath since yesterday morning."</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/symptoms/:appointmentId</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Authenticated</span></div>
        </div>
        <div class="endpoint-desc">Returns the AI-enriched symptom form for an appointment. Includes urgency level, chief complaint, and suggested diagnostic questions when LLM processing is complete.</div>
        <div class="endpoint-body">
          <div class="detail-label">200 OK</div>
          <pre>{
  <span class="tag-key">"rawSymptoms"</span>: <span class="tag-str">"..."</span>,
  <span class="tag-key">"urgency"</span>: <span class="tag-str">"HIGH"</span>,
  <span class="tag-key">"chiefComplaint"</span>: <span class="tag-str">"Chest pain and dyspnea"</span>,
  <span class="tag-key">"suggestedQs"</span>: [<span class="tag-str">"Any family history of cardiac disease?"</span>, <span class="tag-str">"Does pain radiate to the arm?"</span>],
  <span class="tag-key">"llmStatus"</span>: <span class="tag-str">"SUCCESS"</span>
}</pre>
        </div>
      </div>
    </section>

    <!-- VISITS -->
    <section class="section" id="visits">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--red-subtle)">RX</div>
        Visit Notes & Prescriptions
      </div>
      <div class="section-desc">Doctors submit structured clinical notes and prescriptions after completing a consultation. An AI patient summary is generated asynchronously.</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/visits/check-safety</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Run an AI drug interaction and dosage safety check before submitting visit notes. Returns warnings, contraindications, and dosage anomalies.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"prescription"</span>: [{ <span class="tag-key">"drug"</span>: <span class="tag-str">"Warfarin"</span>, <span class="tag-key">"dose"</span>: <span class="tag-str">"5mg"</span>, <span class="tag-key">"frequency"</span>: <span class="tag-str">"once daily"</span> }, { <span class="tag-key">"drug"</span>: <span class="tag-str">"Aspirin"</span>, <span class="tag-key">"dose"</span>: <span class="tag-str">"100mg"</span> }] }</pre>
          <div class="detail-label">200 OK</div>
          <pre>{ <span class="tag-key">"safe"</span>: <span class="tag-bool">false</span>, <span class="tag-key">"warnings"</span>: [<span class="tag-str">"Warfarin + Aspirin: Increased bleeding risk. Use with caution."</span>] }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/visits</span>
          <div class="endpoint-meta"><span class="role-badge role-doctor">Approved Doctor</span></div>
        </div>
        <div class="endpoint-desc">Submit the final visit note and prescription. Triggers async AI patient summary generation and creates medication reminder jobs for the patient.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"appointmentId"</span>: <span class="tag-str">"uuid"</span>, <span class="tag-key">"clinicalNotes"</span>: <span class="tag-str">"Patient presents with..."</span>, <span class="tag-key">"prescription"</span>: [{ <span class="tag-key">"drug"</span>: <span class="tag-str">"Amoxicillin"</span>, <span class="tag-key">"dose"</span>: <span class="tag-str">"500mg"</span>, <span class="tag-key">"frequency"</span>: <span class="tag-str">"3x daily"</span> }] }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/visits/:appointmentId</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Authenticated</span></div>
        </div>
        <div class="endpoint-desc">Returns the visit note and AI-generated patient-friendly summary for an appointment. Available to the assigned patient and doctor.</div>
      </div>
    </section>

    <!-- CALENDAR -->
    <section class="section" id="calendar">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--blue-subtle)">GC</div>
        Google Calendar Sync
      </div>
      <div class="section-desc">OAuth 2.0 flow. Once connected, appointment bookings, reschedules, and cancellations automatically reflect in both patient and doctor Google Calendars.</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/calendar/auth-url</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Authenticated</span></div>
        </div>
        <div class="endpoint-desc">Generates the Google OAuth 2.0 authorization URL for the authenticated user. Frontend should redirect the user to this URL to initiate the consent flow.</div>
        <div class="endpoint-body">
          <div class="detail-label">200 OK</div>
          <pre>{ <span class="tag-key">"url"</span>: <span class="tag-str">"https://accounts.google.com/o/oauth2/auth?..."</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/calendar/callback?code=...&state=userId</span>
          <div class="endpoint-meta"><span class="role-badge role-public">Google Redirect</span></div>
        </div>
        <div class="endpoint-desc">Handles Google OAuth callback. Exchanges the auth code for tokens, stores them in the user record, and redirects to <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">/calendar-success</code> on the frontend.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-delete">DELETE</span>
          <span class="path">/api/v1/calendar/disconnect</span>
          <div class="endpoint-meta"><span class="role-badge role-auth">Authenticated</span></div>
        </div>
        <div class="endpoint-desc">Revokes Google Calendar access by clearing stored OAuth tokens. Future appointments will not sync until the user reconnects.</div>
      </div>
    </section>

    <!-- ADMIN -->
    <section class="section" id="admin">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--yellow-subtle)">AD</div>
        Admin Portal
      </div>
      <div class="section-desc">All admin endpoints require the <code style="font-size:12px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">ADMIN</code> role. Admin accounts are seeded directly in the database.</div>

      <div class="group-label">Doctor Management</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/admin/doctors/pending</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Returns all doctor accounts with <code style="font-size:11px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:3px;">approvalStatus: "PENDING"</code> awaiting review.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/admin/doctors/:id/approve</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Approves a pending doctor registration. Doctor receives a confirmation email and gains access to all doctor-only endpoints immediately.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/admin/doctors/:id/reject</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Rejects a pending doctor application with an optional reason. Doctor receives a rejection email.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"reason"</span>: <span class="tag-str">"Credentials could not be verified"</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/admin/doctors</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Lists all doctors with full profile, leave history, and aggregated CSAT ratings (only appointments that have ratings).</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/admin/doctors</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Creates a doctor account directly with APPROVED status, bypassing the application queue. Useful for onboarding existing staff.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-put">PUT</span>
          <span class="path">/api/v1/admin/doctors/:id</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Update a doctor's profile fields: specialisation, slotDuration, workingHours, bio, isActive status.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/admin/doctors/:id/leave</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Schedules a leave day directly for a doctor (bypassing the approval queue). Cancels all conflicting appointments transactionally. Deletes Google Calendar events for all affected appointments.</div>
        <div class="endpoint-body">
          <div class="detail-label">Request Body</div>
          <pre>{ <span class="tag-key">"date"</span>: <span class="tag-str">"2026-09-15"</span>, <span class="tag-key">"reason"</span>: <span class="tag-str">"Medical conference"</span> }</pre>
          <div class="detail-label">200 OK</div>
          <pre>{ <span class="tag-key">"leave"</span>: { ... }, <span class="tag-key">"affectedCount"</span>: <span class="tag-num">3</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-delete">DELETE</span>
          <span class="path">/api/v1/admin/doctors/:id/leave/:leaveId</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Removes a scheduled leave day, restoring the doctor's availability for that date.</div>
      </div>

      <div class="group-label">Leave Request Management</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/admin/leave-requests</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Returns all PENDING doctor leave requests awaiting admin decision, ordered by submission date.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/admin/leave-requests/:id/approve</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Approves a leave request. Inserts leave day, cancels conflicting appointments, removes Google Calendar events, and sends email notifications to all affected patients and the doctor.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-post">POST</span>
          <span class="path">/api/v1/admin/leave-requests/:id/reject</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Rejects a leave request with an optional reason. Doctor receives a rejection email notification.</div>
      </div>

      <div class="group-label">Analytics & Monitoring</div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/admin/stats</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Returns platform-wide statistics: approved/pending doctors, total patients, today's appointments, queued notifications, pending leave requests.</div>
        <div class="endpoint-body">
          <div class="detail-label">200 OK</div>
          <pre>{ <span class="tag-key">"totalDoctors"</span>: <span class="tag-num">12</span>, <span class="tag-key">"pendingDoctors"</span>: <span class="tag-num">2</span>, <span class="tag-key">"totalPatients"</span>: <span class="tag-num">148</span>, <span class="tag-key">"appointmentsToday"</span>: <span class="tag-num">9</span>, <span class="tag-key">"queuedNotifications"</span>: <span class="tag-num">0</span>, <span class="tag-key">"pendingLeaveRequests"</span>: <span class="tag-num">1</span> }</pre>
        </div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/admin/notifications</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Returns the last 50 notification records from the outbox (QUEUED / SENT / FAILED), with recipient name and email. Used for monitoring email delivery.</div>
      </div>

      <div class="endpoint-card">
        <div class="endpoint-header">
          <span class="method m-get">GET</span>
          <span class="path">/api/v1/admin/history</span>
          <div class="endpoint-meta"><span class="role-badge role-admin">Admin</span></div>
        </div>
        <div class="endpoint-desc">Returns the full appointment history across all patients and doctors, ordered by most recent first. Includes symptom forms, visit notes, and CSAT ratings.</div>
      </div>
    </section>

    <!-- ERROR CODES -->
    <section class="section" id="errors">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--red-subtle)">ER</div>
        Error Code Reference
      </div>
      <div class="section-desc">All errors return JSON with an <code style="font-size:12px;font-family:var(--font-mono);background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;">"error"</code> field containing a human-readable message.</div>

      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-top:4px;">
        <div class="error-row"><span class="error-code">400</span><span class="error-name">Bad Request</span><span class="error-desc">Invalid input data, validation failure (Joi), or business rule violation (e.g. slot in past, not-future reschedule)</span></div>
        <div class="error-row"><span class="error-code">401</span><span class="error-name">Unauthorized</span><span class="error-desc">Missing, invalid, or expired JWT token. Renew by calling POST /auth/login</span></div>
        <div class="error-row"><span class="error-code">403</span><span class="error-name">Forbidden</span><span class="error-desc">Token valid but role is insufficient (e.g. patient calling doctor endpoint) or accessing another user's resource</span></div>
        <div class="error-row"><span class="error-code">404</span><span class="error-name">Not Found</span><span class="error-desc">Resource does not exist or has been deleted (maps to Prisma P2025 error)</span></div>
        <div class="error-row"><span class="error-code">409</span><span class="error-name">Conflict</span><span class="error-desc">Duplicate resource (e.g. email already registered, slot already booked, leave already scheduled on date)</span></div>
        <div class="error-row"><span class="error-code">410</span><span class="error-name">Gone</span><span class="error-desc">Hold token expired. The 10-minute reservation window has passed. Start a new hold</span></div>
        <div class="error-row"><span class="error-code">413</span><span class="error-name">Payload Too Large</span><span class="error-desc">Request body exceeds the 1MB limit</span></div>
        <div class="error-row"><span class="error-code">429</span><span class="error-name">Too Many Requests</span><span class="error-desc">Rate limit exceeded (100 req/15min global, 10 req/15min for auth/booking) or max 3 active holds reached</span></div>
        <div class="error-row"><span class="error-code">500</span><span class="error-name">Internal Server Error</span><span class="error-desc">Unexpected server error. Production responses omit internal details. Check server logs for full trace</span></div>
        <div class="error-row"><span class="error-code">503</span><span class="error-name">Service Unavailable</span><span class="error-desc">Database is unreachable. Check /api/v1/health for "database: disconnected" status</span></div>
      </div>
    </section>

    <!-- RATE LIMITING -->
    <section class="section" id="ratelimit">
      <div class="section-title">
        <div class="section-title-icon" style="background:var(--purple-subtle)">RL</div>
        Rate Limiting
      </div>
      <div class="section-desc">Express-rate-limit is applied per IP address using in-memory sliding window counters. All limits reset after the window expires.</div>
      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;margin-top:4px;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;font-size:12px;">
          <div style="padding:10px 16px;background:rgba(255,255,255,0.03);font-weight:700;color:var(--text-muted);border-bottom:1px solid var(--border);">Tier</div>
          <div style="padding:10px 16px;background:rgba(255,255,255,0.03);font-weight:700;color:var(--text-muted);border-bottom:1px solid var(--border);">Routes</div>
          <div style="padding:10px 16px;background:rgba(255,255,255,0.03);font-weight:700;color:var(--text-muted);border-bottom:1px solid var(--border);">Limit</div>
          <div style="padding:10px 16px;border-bottom:1px solid var(--border);">Global API</div>
          <div style="padding:10px 16px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:11px;">All /api/v1/* routes</div>
          <div style="padding:10px 16px;border-bottom:1px solid var(--border);color:var(--blue);">100 req / 15 min</div>
          <div style="padding:10px 16px;border-bottom:1px solid var(--border);">Auth Limiter</div>
          <div style="padding:10px 16px;border-bottom:1px solid var(--border);font-family:var(--font-mono);font-size:11px;">/auth/login, /auth/register</div>
          <div style="padding:10px 16px;border-bottom:1px solid var(--border);color:var(--yellow);">10 req / 15 min</div>
          <div style="padding:10px 16px;">Booking Limiter</div>
          <div style="padding:10px 16px;font-family:var(--font-mono);font-size:11px;">/appointments/hold, /appointments (POST), /reschedule</div>
          <div style="padding:10px 16px;color:var(--red);">10 req / 15 min</div>
        </div>
      </div>
    </section>

    <footer>
      <div class="footer-left">Healthcare Appointment Platform &mdash; Node.js · Express · Prisma · PostgreSQL · Google AI</div>
      <div class="footer-right">
        <a href="/api/v1/health">Health JSON</a>
        <a href="https://github.com/AishikTokdar/HealthCareAppointment_Unthinkable" target="_blank">GitHub</a>
        <a href="https://healthcareappointment.pages.dev/" target="_blank">Frontend App</a>
      </div>
    </footer>
  </div>

  <script>
    // Fetch live health data and populate stats
    fetch('/api/v1/health')
      .then(r => r.json())
      .then(d => {
        const s = d.stats || {};
        document.getElementById('stat-doctors').textContent = s.approvedDoctors ?? '—';
        document.getElementById('stat-patients').textContent = s.totalPatients ?? '—';
        document.getElementById('stat-confirmed').textContent = s.confirmedAppointments ?? '—';
        document.getElementById('stat-completed').textContent = s.completedAppointments ?? '—';
        document.getElementById('stat-uptime').textContent = d.uptime?.human || '—';
        document.getElementById('stat-node').textContent = d.node || '—';
        document.getElementById('stat-db').textContent = d.database === 'connected' ? 'DB Connected' : 'DB Offline';
        document.getElementById('stat-db').style.color = d.database === 'connected' ? '#10b981' : '#f87171';
        document.getElementById('stat-env').textContent = d.environment || '—';
      })
      .catch(() => {
        document.getElementById('stat-db').textContent = 'Unable to reach server';
        document.getElementById('stat-db').style.color = '#f87171';
      });

    // Collapsible endpoint cards
    document.querySelectorAll('.endpoint-header').forEach(header => {
      const body = header.parentElement.querySelector('.endpoint-body');
      if (!body || body.style.display === 'block') return;
      header.style.cursor = 'pointer';
      header.addEventListener('click', () => {
        const card = header.parentElement;
        const isOpen = card.classList.contains('open');
        card.classList.toggle('open', !isOpen);
        body.style.display = isOpen ? 'none' : 'block';
      });
    });
  </script>
</body>
</html>`;
}

module.exports = getLandingPageHtml;
