const appointmentsService = require('./appointments.service');

async function handleHoldSlot(req, res, next) {
  try {
    const { doctorId, startsAt } = req.body;
    if (!doctorId || !startsAt) {
      return res.status(400).json({ error: 'doctorId and startsAt are required' });
    }
    const result = await appointmentsService.holdSlot(req.user.userId, doctorId, startsAt);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleConfirmBooking(req, res, next) {
  try {
    const { holdToken, symptoms } = req.body;
    if (!holdToken || !symptoms) {
      return res.status(400).json({ error: 'holdToken and symptoms are required' });
    }
    const result = await appointmentsService.confirmBooking(req.user.userId, holdToken, symptoms);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleGetPatientAppointments(req, res, next) {
  try {
    const list = await appointmentsService.getPatientAppointments(req.user.userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function handleGetAppointmentDetail(req, res, next) {
  try {
    const detail = await appointmentsService.getAppointmentDetail(req.user, req.params.id);
    res.json(detail);
  } catch (err) {
    next(err);
  }
}

async function handleRescheduleAppointment(req, res, next) {
  try {
    const { startsAt } = req.body;
    if (!startsAt) {
      return res.status(400).json({ error: 'startsAt is required for rescheduling' });
    }
    const result = await appointmentsService.rescheduleAppointment(req.user, req.params.id, startsAt);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleCancelAppointment(req, res, next) {
  try {
    const { reason } = req.body;
    const result = await appointmentsService.cancelAppointment(req.user, req.params.id, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleCompleteAppointment(req, res, next) {
  try {
    const result = await appointmentsService.completeAppointment(req.user.userId, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleStartChat(req, res, next) {
  try {
    const result = await appointmentsService.startChat(req.user.userId, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleCloseChat(req, res, next) {
  try {
    const result = await appointmentsService.closeChat(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleChatHeartbeat(req, res, next) {
  try {
    const result = await appointmentsService.chatHeartbeat(req.user, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleSendChatMessage(req, res, next) {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    const msg = await appointmentsService.sendChatMessage(req.user, req.params.id, message);
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
}

async function handleGetChatMessages(req, res, next) {
  try {
    const list = await appointmentsService.getChatMessages(req.user, req.params.id);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function handleAiRefineDraft(req, res, next) {
  try {
    const { draft } = req.body;
    if (!draft || !draft.trim()) {
      return res.status(400).json({ error: 'draft is required' });
    }
    const result = await appointmentsService.aiRefineDoctorDraft(req.user, req.params.id, draft);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleHoldSlot,
  handleConfirmBooking,
  handleGetPatientAppointments,
  handleGetAppointmentDetail,
  handleRescheduleAppointment,
  handleCancelAppointment,
  handleCompleteAppointment,
  handleStartChat,
  handleCloseChat,
  handleChatHeartbeat,
  handleSendChatMessage,
  handleGetChatMessages,
  handleAiRefineDraft
};
