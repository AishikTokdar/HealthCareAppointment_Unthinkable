function doctorLeaveRejectedTemplate(payload) {
  const { doctorName, leaveDate, reason } = payload;
  const formattedDate = new Date(leaveDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' });

  return {
    subject: `Leave Request Status Update - ${formattedDate}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f43f5e; margin-top: 0;">Leave Request Declined</h2>
        <p>Dear ${doctorName},</p>
        <p>Your leave request for <strong>${formattedDate}</strong> could not be approved at this time.</p>
        ${reason ? `<div style="background: #0f1623; padding: 16px; border-radius: 8px; border-left: 4px solid #f43f5e; margin: 20px 0;"><strong style="color: #f43f5e;">Admin Feedback:</strong> ${reason}</div>` : ''}
        <p style="color: #8b9db5; font-size: 13px;">If you have any questions, please reach out to clinic administration.</p>
      </div>
    `
  };
}

module.exports = doctorLeaveRejectedTemplate;
