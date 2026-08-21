const resend = require('../config/mailer');
const bookingConfirmation = require('./templates/bookingConfirmation');
const appointmentReminder = require('./templates/appointmentReminder');
const cancellationNotice = require('./templates/cancellationNotice');
const leaveConflict = require('./templates/leaveConflict');
const medicationReminder = require('./templates/medicationReminder');
const doctorApproved = require('./templates/doctorApproved');
const doctorRejected = require('./templates/doctorRejected');

const templateMap = {
  BOOKING_CONFIRM: bookingConfirmation,
  APPOINTMENT_REMINDER: appointmentReminder,
  CANCELLATION: cancellationNotice,
  LEAVE_CONFLICT: leaveConflict,
  MED_REMINDER: medicationReminder,
  DOCTOR_APPROVED: doctorApproved,
  DOCTOR_REJECTED: doctorRejected
};

async function sendNotification(notificationRecord, userEmail) {
  const getTemplate = templateMap[notificationRecord.type];
  if (!getTemplate) {
    throw new Error(`Unknown notification type: ${notificationRecord.type}`);
  }

  const { subject, html } = getTemplate(notificationRecord.payload);

  if (!resend) {
    console.log(`[Simulated Email to ${userEmail}]: ${subject}`);
    return { success: true, simulated: true };
  }

  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  
  const response = await resend.emails.send({
    from: fromEmail,
    to: [userEmail],
    subject,
    html
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return { success: true, id: response.data?.id };
}

module.exports = {
  sendNotification
};
