const express = require('express');
const visitsController = require('./visits.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');
const { validate } = require('../../middleware/validate');
const { submitVisitNotesSchema } = require('../../middleware/schemas');
const requireApproved = require('../../middleware/requireApproved');

const router = express.Router();

router.use(authenticate);

router.post('/', guard('DOCTOR'), requireApproved, validate(submitVisitNotesSchema), visitsController.handleSubmitVisitNotes);
router.post('/check-safety', guard('DOCTOR'), requireApproved, visitsController.handleCheckDrugSafety);
router.get('/:appointmentId', visitsController.handleGetVisitSummary);

module.exports = router;
