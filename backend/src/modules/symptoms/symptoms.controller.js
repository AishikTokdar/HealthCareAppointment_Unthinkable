const symptomsService = require('./symptoms.service');

async function handleSubmitSymptomForm(req, res, next) {
  try {
    const { appointmentId, rawSymptoms } = req.body;
    const result = await symptomsService.submitSymptomForm(appointmentId, rawSymptoms);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleGetSymptomSummary(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const summary = await symptomsService.getSymptomSummary(req.user, appointmentId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleSubmitSymptomForm,
  handleGetSymptomSummary
};
