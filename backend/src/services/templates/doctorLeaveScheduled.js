function doctorLeaveScheduledTemplate(payload) {
  const { doctorName, leaveDate, reason } = payload;
  const formattedDate = new Date(leaveDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' });

  return {
    subject: `Notice: Schedule Update - Leave Assigned for ${formattedDate}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #fbbf24; margin-top: 0;">Clinic Schedule Notice</h2>
        <p>Dear ${doctorName},</p>
        <p>A leave day has been directly assigned to your schedule for <strong>${formattedDate}</strong> by clinic administration.</p>
        ${reason ? `<div style="background: #0f1623; padding: 16px; border-radius: 8px; border-left: 4px solid #fbbf24; margin: 20px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
        <p style="color: #8b9db5; font-size: 13px;">Any conflicting patient appointments on this date have been automatically managed and notified.</p>
      </div>
    `
  };
}

module.exports = doctorLeaveScheduledTemplate;
