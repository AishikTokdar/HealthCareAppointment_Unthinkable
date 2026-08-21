function doctorApprovedTemplate(payload) {
  const { doctorName } = payload;

  return {
    subject: `Doctor Account Approved`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #10b981; margin-top: 0;">Account Approved</h2>
        <p>Dear Dr. ${doctorName},</p>
        <p>Your doctor profile on our Healthcare Platform has been reviewed and approved by the administrator.</p>
        <p>You can now log in to view your schedule and accept patient appointments.</p>
      </div>
    `
  };
}

module.exports = doctorApprovedTemplate;
