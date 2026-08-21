require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter = require('./modules/auth/auth.router');
const adminRouter = require('./modules/admin/admin.router');
const doctorsRouter = require('./modules/doctors/doctors.router');
const appointmentsRouter = require('./modules/appointments/appointments.router');
const symptomsRouter = require('./modules/symptoms/symptoms.router');
const visitsRouter = require('./modules/visits/visits.router');
const calendarRouter = require('./modules/calendar/calendar.router');

const errorHandler = require('./middleware/errorHandler');

const startNotificationWorker = require('./jobs/notificationWorker');
const startHoldExpiryJob = require('./jobs/holdExpiry');
const startAppointmentReminderJob = require('./jobs/appointmentReminder');
const startMedicationReminderJob = require('./jobs/medicationReminder');

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Healthcare Backend running on port ${PORT}`);
});
