const express = require('express');
const symptomsController = require('./symptoms.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');

const router = express.Router();

router.use(authenticate);

router.post('/', guard('PATIENT'), symptomsController.handleSubmitSymptomForm);
router.get('/:appointmentId', symptomsController.handleGetSymptomSummary);

module.exports = router;
