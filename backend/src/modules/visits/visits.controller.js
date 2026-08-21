const visitsService = require('./visits.service');

async function handleSubmitVisitNotes(req, res, next) {
  try {
    const { appointmentId, clinicalNotes, prescription } = req.body;
    const result = await visitsService.submitVisitNotes(req.user.userId, appointmentId, clinicalNotes, prescription);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleGetVisitSummary(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const summary = await visitsService.getVisitSummary(req.user, appointmentId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleSubmitVisitNotes,
  handleGetVisitSummary
};
