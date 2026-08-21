const express = require('express');
const symptomsController = require('./symptoms.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');
const { validate } = require('../../middleware/validate');
const { submitSymptomFormSchema } = require('../../middleware/schemas');

const router = express.Router();

router.use(authenticate);

router.post('/', guard('PATIENT'), validate(submitSymptomFormSchema), symptomsController.handleSubmitSymptomForm);
router.get('/:appointmentId', symptomsController.handleGetSymptomSummary);

module.exports = router;
