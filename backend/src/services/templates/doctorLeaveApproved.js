function doctorLeaveApprovedTemplate(payload) {
  const { doctorName, leaveDate, reason } = payload;
  const formattedDate = new Date(leaveDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' });

  return {
    subject: `Leave Request Approved - ${formattedDate}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981; margin-top: 0;">Leave Request Approved ✅</h2>
        <p>Dear ${doctorName},</p>
        <p>Your leave request for <strong>${formattedDate}</strong> has been approved by clinic administration.</p>
        ${reason ? `<p style="background: #0f1623; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;"><strong>Reason:</strong> ${reason}</p>` : ''}
        <p style="color: #8b9db5; font-size: 13px;">Any conflicting patient appointments on this date have been automatically cancelled and notified.</p>
      </div>
    `
  };
}

module.exports = doctorLeaveApprovedTemplate;
