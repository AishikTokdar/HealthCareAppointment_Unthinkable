module.exports = function rescheduleDoctorAlert(payload) {
  const oldDateStr = payload.oldStartsAt ? new Date(payload.oldStartsAt).toLocaleString('en-IN') : 'N/A';
  const newDateStr = payload.newStartsAt ? new Date(payload.newStartsAt).toLocaleString('en-IN') : 'N/A';

  return {
    subject: `[APPOINTMENT RESCHEDULED] ${payload.patientName || 'Patient'} has rescheduled their appointment`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #6366f1; margin-top: 0;">Appointment Rescheduled Alert</h2>
        <p>Dear Dr. ${payload.doctorName || 'Doctor'},</p>
        <p>Patient <strong>${payload.patientName || 'Patient'}</strong> has rescheduled their appointment slot.</p>
        <div style="background: #0f172a; padding: 16px; border-radius: 10px; margin: 20px 0; border: 1px solid #334155;">
          <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;"><strong>Previous Schedule:</strong> ${oldDateStr}</p>
          <p style="margin: 4px 0; color: #38bdf8; font-size: 14px;"><strong>New Rescheduled Schedule:</strong> ${newDateStr}</p>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">Your schedule and Google Calendar have been updated automatically.</p>
      </div>
    `
  };
};
