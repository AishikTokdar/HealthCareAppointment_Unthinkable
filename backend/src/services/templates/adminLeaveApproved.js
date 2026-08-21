function adminLeaveApprovedTemplate(payload) {
  const { doctorName, leaveDate, reason, cancelledCount } = payload;
  const formattedDate = new Date(leaveDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full' });

  return {
    subject: `[ADMIN CONFIRMATION] You Approved Leave for ${doctorName}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c5cfc; margin-top: 0;">Leave Approval Confirmation</h2>
        <p>You have approved a doctor leave request with the following details:</p>
        <div style="background: #0f1623; border: 1px solid rgba(124, 92, 252, 0.3); padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Doctor:</strong> ${doctorName}</p>
          <p style="margin: 4px 0;"><strong>Leave Date:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0;"><strong>Reason:</strong> ${reason || 'N/A'}</p>
          <p style="margin: 4px 0; color: #f43f5e; font-weight: 600;"><strong>Cancelled Patient Visits:</strong> ${cancelledCount}</p>
        </div>
        <p style="color: #8b9db5; font-size: 13px;">Automated approval notification was dispatched to ${doctorName}.</p>
      </div>
    `
  };
}

module.exports = adminLeaveApprovedTemplate;
