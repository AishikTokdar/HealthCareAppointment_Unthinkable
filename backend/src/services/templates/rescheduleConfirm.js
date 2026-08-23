module.exports = function rescheduleConfirm(payload) {
  const newDateStr = payload.newStartsAt ? new Date(payload.newStartsAt).toLocaleString('en-IN') : 'N/A';

  return {
    subject: `[CONFIRMATION] Your appointment with Dr. ${payload.doctorName || 'Doctor'} has been rescheduled`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">Appointment Reschedule Confirmed</h2>
        <p>Dear ${payload.patientName || 'Patient'},</p>
        <p>Your appointment with <strong>Dr. ${payload.doctorName || 'Doctor'}</strong> has been successfully rescheduled.</p>
        <div style="background: #0f172a; padding: 16px; border-radius: 10px; margin: 20px 0; border: 1px solid #334155;">
          <p style="margin: 4px 0; color: #38bdf8; font-size: 14px;"><strong>Updated Schedule:</strong> ${newDateStr}</p>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">If you connected Google Calendar, your calendar invite has been updated automatically.</p>
      </div>
    `
  };
};
