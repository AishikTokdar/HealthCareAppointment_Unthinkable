const express = require('express');
const appointmentsController = require('./appointments.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');
const { validate } = require('../../middleware/validate');
const { holdSlotSchema, confirmBookingSchema, rescheduleSchema, cancelSchema } = require('../../middleware/schemas');
const { bookingLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);

router.post('/hold', guard('PATIENT'), bookingLimiter, validate(holdSlotSchema), appointmentsController.handleHoldSlot);
router.post('/', guard('PATIENT'), bookingLimiter, validate(confirmBookingSchema), appointmentsController.handleConfirmBooking);
router.get('/', guard('PATIENT'), appointmentsController.handleGetPatientAppointments);
router.get('/:id', appointmentsController.handleGetAppointmentDetail);
router.put('/:id/reschedule', guard('PATIENT'), bookingLimiter, validate(rescheduleSchema), appointmentsController.handleRescheduleAppointment);
router.delete('/:id', guard('PATIENT', 'DOCTOR', 'ADMIN'), validate(cancelSchema), appointmentsController.handleCancelAppointment);
router.patch('/:id/complete', guard('DOCTOR'), appointmentsController.handleCompleteAppointment);

router.post('/:id/start-chat', guard('DOCTOR'), appointmentsController.handleStartChat);
router.post('/:id/close-chat', appointmentsController.handleCloseChat);
router.post('/:id/heartbeat', appointmentsController.handleChatHeartbeat);
router.post('/:id/messages', appointmentsController.handleSendChatMessage);
router.get('/:id/messages', appointmentsController.handleGetChatMessages);
router.post('/:id/ai-refine', guard('DOCTOR'), appointmentsController.handleAiRefineDraft);

module.exports = router;
