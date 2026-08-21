function leaveConflictTemplate(payload) {
  if (payload.isAdminSummary) {
    const { doctorName, specialisation, leaveDate, reason, cancelledCount, cancelledAppointments } = payload;
    const formattedLeaveDate = new Date(leaveDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' });

    const rows = (cancelledAppointments || []).map(appt => {
      const timeStr = new Date(appt.startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' });
      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding: 12px; color: #f1f5f9; font-weight: 500;">${appt.patientName}</td>
          <td style="padding: 12px; color: #22d3ee;">${appt.patientEmail}</td>
          <td style="padding: 12px; color: #94a3b8;">${appt.patientPhone}</td>
          <td style="padding: 12px; color: #fbbf24; font-weight: 600;">${timeStr} (IST)</td>
        </tr>
      `;
    }).join('');

    return {
      subject: `[ADMIN ALERT] Doctor Leave Recorded - ${cancelledCount} Appointment(s) Cancelled for ${doctorName}`,
      html: `
        <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 680px; margin: 0 auto;">
          <div style="border-bottom: 2px solid #7c5cfc; padding-bottom: 16px; margin-bottom: 24px;">
            <h2 style="color: #7c5cfc; margin: 0; font-size: 22px;">Doctor Leave & Cancellation Audit Summary</h2>
            <span style="color: #8b9db5; font-size: 13px;">Clinic Management System Notification</span>
          </div>

          <p style="font-size: 15px; color: #e2e8f0; margin-bottom: 20px;">
            A leave day has been recorded for <strong>${doctorName}</strong>. All conflicting patient appointments have been automatically cancelled.
          </p>

          <div style="background: #0f1623; border: 1px solid rgba(124, 92, 252, 0.3); padding: 20px; border-radius: 12px; margin-bottom: 28px;">
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Doctor:</strong> ${doctorName} (${specialisation})</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Leave Date:</strong> ${formattedLeaveDate}</p>
            <p style="margin: 4px 0; color: #cbd5e1;"><strong>Reason:</strong> ${reason}</p>
            <p style="margin: 4px 0; color: #f43f5e; font-weight: 600;"><strong>Total Affected Appointments:</strong> ${cancelledCount}</p>
          </div>

          ${cancelledAppointments && cancelledAppointments.length > 0 ? `
            <h3 style="color: #f1f5f9; font-size: 16px; margin-bottom: 12px;">Cancelled Patient Appointments Details</h3>
            <div style="overflow-x: auto; background: #0f1623; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
              <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                <thead>
                  <tr style="background: rgba(255,255,255,0.04); color: #8b9db5; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <th style="padding: 12px;">Patient Name</th>
                    <th style="padding: 12px;">Email</th>
                    <th style="padding: 12px;">Phone</th>
                    <th style="padding: 12px;">Slot Time (IST)</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          ` : '<p style="color: #8b9db5; font-size: 14px;">No existing patient bookings were affected by this leave day.</p>'}

          <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #8b9db5;">
            Individual cancellation notices have been dispatched to all affected patients.
          </div>
        </div>
      `
    };
  }

  const { patientName, doctorName, startsAt, date } = payload;
  const formattedStart = startsAt ? new Date(startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' }) : date;

  return {
    subject: `Doctor Schedule Change - Appointment Cancellation`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #fbbf24; margin-top: 0;">Doctor Schedule Update</h2>
        <p>Dear ${patientName},</p>
        <p>${doctorName} is unavailable on <strong>${formattedStart} (IST)</strong> due to scheduled leave.</p>
        <p>We apologize for any inconvenience. Your appointment has been cancelled and you may select an alternative slot on our portal.</p>
      </div>
    `
  };
}

module.exports = leaveConflictTemplate;
