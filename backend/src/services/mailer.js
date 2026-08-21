const resend = require('../config/mailer');
const bookingConfirmation = require('./templates/bookingConfirmation');
const appointmentReminder = require('./templates/appointmentReminder');
const cancellationNotice = require('./templates/cancellationNotice');
const leaveConflict = require('./templates/leaveConflict');
const medicationReminder = require('./templates/medicationReminder');
const doctorApproved = require('./templates/doctorApproved');
const doctorRejected = require('./templates/doctorRejected');
const doctorLeaveApproved = require('./templates/doctorLeaveApproved');
const adminLeaveApproved = require('./templates/adminLeaveApproved');
const doctorLeaveRejected = require('./templates/doctorLeaveRejected');
const doctorLeaveScheduled = require('./templates/doctorLeaveScheduled');

const templateMap = {
  BOOKING_CONFIRM: bookingConfirmation,
  APPOINTMENT_REMINDER: appointmentReminder,
  CANCELLATION: cancellationNotice,
  LEAVE_CONFLICT: leaveConflict,
  MED_REMINDER: medicationReminder,
  DOCTOR_APPROVED: doctorApproved,
  DOCTOR_REJECTED: doctorRejected,
  LEAVE_APPROVED: (payload) => payload.isAdminSummary ? adminLeaveApproved(payload) : doctorLeaveApproved(payload),
  LEAVE_REJECTED: doctorLeaveRejected,
  LEAVE_REQUESTED: (payload) => ({
    subject: `[ADMIN ALERT] New Doctor Leave Request from ${payload.doctorName}`,
    html: `<div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;"><h3 style="color:#7c5cfc;">New Doctor Leave Request</h3><p>${payload.doctorName} requested leave for <strong>${payload.leaveDate}</strong>.</p><p>Reason: ${payload.reason || 'N/A'}</p><p>Please review and approve in Admin Portal.</p></div>`
  })
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
