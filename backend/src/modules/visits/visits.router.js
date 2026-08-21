const express = require('express');
const visitsController = require('./visits.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');

const router = express.Router();

router.use(authenticate);

router.post('/', guard('DOCTOR'), visitsController.handleSubmitVisitNotes);
router.get('/:appointmentId', visitsController.handleGetVisitSummary);

module.exports = router;
