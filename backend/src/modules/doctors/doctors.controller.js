const doctorsService = require('./doctors.service');

async function handleSearchDoctors(req, res, next) {
  try {
    const { specialisation } = req.query;
    const doctors = await doctorsService.searchDoctors(specialisation);
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}

async function handleGetDoctorPublicProfile(req, res, next) {
  try {
    const doctor = await doctorsService.getDoctorPublicProfile(req.params.id);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
}

async function handleGetDoctorSlots(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
    }
    const result = await doctorsService.getDoctorSlots(req.params.id, date);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleGetDoctorAppointments(req, res, next) {
  try {
    const list = await doctorsService.getDoctorAppointments(req.user.userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleSearchDoctors,
  handleGetDoctorPublicProfile,
  handleGetDoctorSlots,
  handleGetDoctorAppointments
};
