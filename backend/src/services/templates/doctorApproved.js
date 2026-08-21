function doctorApprovedTemplate(payload) {
  const { doctorName } = payload;

  return {
    subject: 'Doctor Account Approved - Welcome to the Platform',
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981; margin-top: 0;">Account Approved</h2>
        <p>Dear ${doctorName},</p>
        <p>Your doctor registration application has been reviewed and approved by clinic administration.</p>
        <p>You can now log in to your portal to manage your schedule and review pre-visit AI patient briefings.</p>
      </div>
    `
  };
}

module.exports = doctorApprovedTemplate;
