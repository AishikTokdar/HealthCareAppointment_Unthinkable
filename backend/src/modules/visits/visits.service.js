const prisma = require('../../config/db');
const { generatePostVisitSummary } = require('../../services/llm');

async function submitVisitNotes(doctorUserId, appointmentId, clinicalNotes, prescription) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true, patient: true }
  });

  if (!appt || appt.doctor.userId !== doctorUserId) {
    const err = new Error('Appointment not found or unauthorized');
    err.statusCode = 403;
    throw err;
  }

  if (appt.status !== 'CONFIRMED' && appt.status !== 'COMPLETED') {
    const err = new Error('Visit notes can only be submitted for confirmed or completed appointments');
    err.statusCode = 400;
    throw err;
  }

  const visitNote = await prisma.visitNote.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      clinicalNotes,
      prescription: prescription || [],
      llmStatus: 'PENDING'
    },
    update: {
      clinicalNotes,
      prescription: prescription || [],
      llmStatus: 'PENDING'
    }
  });

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'COMPLETED' }
  });

  if (Array.isArray(prescription)) {
    for (const item of prescription) {
      if (item.drug && item.dose) {
        await prisma.medicationReminder.create({
          data: {
            visitNoteId: visitNote.id,
            patientId: appt.patientId,
            drug: item.drug,
            dose: item.dose,
            frequency: item.frequency || 'once daily',
            nextRemindAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        });
      }
    }
  }

  setImmediate(async () => {
    try {
      const llmRes = await generatePostVisitSummary(clinicalNotes, prescription);
      await prisma.visitNote.update({
        where: { id: visitNote.id },
        data: {
          patientSummary: llmRes.data?.patientSummary || clinicalNotes,
          llmRawOutput: llmRes.raw,
          llmStatus: llmRes.status
        }
      });
    } catch (err) {
      console.error('Async post-visit LLM processing error:', err.message);
    }
  });

  return visitNote;
}

async function getVisitSummary(user, appointmentId) {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { doctor: true }
  });

  if (!appt) {
    const err = new Error('Appointment not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === 'PATIENT' && appt.patientId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  if (user.role === 'DOCTOR' && appt.doctor.userId !== user.userId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  const visitNote = await prisma.visitNote.findUnique({
    where: { appointmentId },
    include: {
      reminders: true
    }
  });

  if (!visitNote) {
    const err = new Error('Visit notes not found for this appointment');
    err.statusCode = 404;
    throw err;
  }

  return visitNote;
}

module.exports = {
  submitVisitNotes,
  getVisitSummary
};
