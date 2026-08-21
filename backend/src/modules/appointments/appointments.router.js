const express = require('express');
const appointmentsController = require('./appointments.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');

const router = express.Router();

router.use(authenticate);

router.post('/hold', guard('PATIENT'), appointmentsController.handleHoldSlot);
router.post('/', guard('PATIENT'), appointmentsController.handleConfirmBooking);
router.get('/', guard('PATIENT'), appointmentsController.handleGetPatientAppointments);
router.get('/:id', appointmentsController.handleGetAppointmentDetail);
router.put('/:id/reschedule', guard('PATIENT'), appointmentsController.handleRescheduleAppointment);
router.delete('/:id', guard('PATIENT', 'DOCTOR', 'ADMIN'), appointmentsController.handleCancelAppointment);
router.patch('/:id/complete', guard('DOCTOR'), appointmentsController.handleCompleteAppointment);

module.exports = router;
