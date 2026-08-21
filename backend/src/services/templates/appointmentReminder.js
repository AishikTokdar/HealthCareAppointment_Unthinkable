function appointmentReminderTemplate(payload) {
  const { patientName, doctorName, startsAt } = payload;
  const formattedStart = new Date(startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });

  return {
    subject: `Reminder: Upcoming Appointment with ${doctorName}`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #22d3ee; margin-top: 0;">Appointment Reminder</h2>
        <p>Namaste ${patientName},</p>
        <p>This is a reminder for your upcoming medical visit scheduled for tomorrow.</p>
        <div style="background: #0f1623; border: 1px solid rgba(255,255,255,0.06); padding: 20px; border-radius: 12px; margin: 24px 0;">
          <p style="margin: 4px 0;"><strong>Doctor:</strong> ${doctorName}</p>
          <p style="margin: 4px 0;"><strong>Time (IST):</strong> ${formattedStart}</p>
        </div>
        <p style="color: #8b9db5; font-size: 14px;">Please arrive 10 minutes prior to your scheduled slot.</p>
      </div>
    `
  };
}

module.exports = appointmentReminderTemplate;
