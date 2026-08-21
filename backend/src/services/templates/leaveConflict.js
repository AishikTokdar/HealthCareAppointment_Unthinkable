function leaveConflictTemplate(payload) {
  const { patientName, doctorName, startsAt, date } = payload;
  const formattedStart = startsAt ? new Date(startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' }) : date;

  return {
    subject: `Doctor Schedule Change - Appointment Cancellation`,
    html: `
      <div style="font-family: sans-serif; background: #080c14; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <h2 style="color: #fbbf24; margin-top: 0;">Doctor Schedule Update</h2>
        <p>Dear ${patientName},</p>
        <p>Dr. ${doctorName} is unavailable on <strong>${formattedStart} (IST)</strong> due to scheduled leave.</p>
        <p>We apologize for any inconvenience. Your appointment has been cancelled and you may select an alternative slot on our portal.</p>
      </div>
    `
  };
}

module.exports = leaveConflictTemplate;
