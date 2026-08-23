require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'healthcare_appointment_auto_generated_jwt_secret_2026_key';
}

const REQUIRED_ENV = ['DATABASE_URL'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET === 'healthcare_appointment_auto_generated_jwt_secret_2026_key') {
  console.warn('WARNING: Using default JWT_SECRET is insecure. Set a strong secret in production.');
}

const authRouter = require('./modules/auth/auth.router');
const adminRouter = require('./modules/admin/admin.router');
const doctorsRouter = require('./modules/doctors/doctors.router');
const appointmentsRouter = require('./modules/appointments/appointments.router');
const symptomsRouter = require('./modules/symptoms/symptoms.router');
const visitsRouter = require('./modules/visits/visits.router');
const calendarRouter = require('./modules/calendar/calendar.router');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const startNotificationWorker = require('./jobs/notificationWorker');
const startHoldExpiryJob = require('./jobs/holdExpiry');
const startAppointmentReminderJob = require('./jobs/appointmentReminder');
const startMedicationReminderJob = require('./jobs/medicationReminder');
const startKeepAliveJob = require('./jobs/keepAlive');

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !process.env.FRONTEND_URL || process.env.FRONTEND_URL === '*' || origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(apiLimiter);

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/doctors', doctorsRouter);
app.use('/api/v1/appointments', appointmentsRouter);
app.use('/api/v1/symptoms', symptomsRouter);
app.use('/api/v1/visits', visitsRouter);
app.use('/api/v1/calendar', calendarRouter);

app.use(errorHandler);

startNotificationWorker();
startHoldExpiryJob();
startAppointmentReminderJob();
startMedicationReminderJob();
startKeepAliveJob();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Healthcare Backend running on port ${PORT}`);
});
