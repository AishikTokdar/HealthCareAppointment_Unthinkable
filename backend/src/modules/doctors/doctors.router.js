const express = require('express');
const doctorsController = require('./doctors.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');
const requireApproved = require('../../middleware/requireApproved');
const { validateQuery } = require('../../middleware/validate');
const { slotsQuerySchema } = require('../../middleware/schemas');

const router = express.Router();

router.get('/', doctorsController.handleSearchDoctors);
router.get('/me/appointments', authenticate, guard('DOCTOR'), requireApproved, doctorsController.handleGetDoctorAppointments);
router.get('/:id', doctorsController.handleGetDoctorPublicProfile);
router.get('/:id/slots', validateQuery(slotsQuerySchema), doctorsController.handleGetDoctorSlots);

module.exports = router;
