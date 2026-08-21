const adminService = require('./admin.service');

async function handleGetPendingDoctors(req, res, next) {
  try {
    const list = await adminService.getPendingDoctors();
    res.json(list);
  } catch (err) {
    next(err);
  }
}

async function handleApproveDoctor(req, res, next) {
  try {
    const result = await adminService.approveDoctor(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleRejectDoctor(req, res, next) {
  try {
    const { reason } = req.body;
    const result = await adminService.rejectDoctor(req.params.id, reason);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleCreateDoctor(req, res, next) {
  try {
    const result = await adminService.createDoctorDirectly(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleUpdateDoctor(req, res, next) {
  try {
    const result = await adminService.updateDoctorProfile(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleAddLeave(req, res, next) {
  try {
    const { date, reason } = req.body;
    const result = await adminService.addDoctorLeave(req.params.id, date, reason);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleRemoveLeave(req, res, next) {
  try {
    const result = await adminService.removeDoctorLeave(req.params.id, req.params.leaveId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleGetAllDoctors(req, res, next) {
  try {
    const doctors = await adminService.getAllDoctors();
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}

async function handleGetStats(req, res, next) {
  try {
    const stats = await adminService.getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

async function handleGetNotificationLog(req, res, next) {
  try {
    const logs = await adminService.getNotificationLog();
    res.json(logs);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleGetPendingDoctors,
  handleApproveDoctor,
  handleRejectDoctor,
  handleCreateDoctor,
  handleUpdateDoctor,
  handleAddLeave,
  handleRemoveLeave,
  handleGetAllDoctors,
  handleGetStats,
  handleGetNotificationLog
};
