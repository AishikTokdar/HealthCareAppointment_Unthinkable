const express = require('express');
const visitsController = require('./visits.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');
const { validate } = require('../../middleware/validate');
const { submitVisitNotesSchema } = require('../../middleware/schemas');

const router = express.Router();

router.use(authenticate);

router.post('/', guard('DOCTOR'), validate(submitVisitNotesSchema), visitsController.handleSubmitVisitNotes);
router.get('/:appointmentId', visitsController.handleGetVisitSummary);

module.exports = router;
