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

module.exports = {
  handleHoldSlot,
  handleConfirmBooking,
  handleGetPatientAppointments,
  handleGetAppointmentDetail,
  handleRescheduleAppointment,
  handleCancelAppointment,
  handleCompleteAppointment
};
