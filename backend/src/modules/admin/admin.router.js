const express = require('express');
const adminController = require('./admin.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');
const { validate } = require('../../middleware/validate');
const {
  createDoctorDirectlySchema,
  updateDoctorProfileSchema,
  addLeaveSchema,
  rejectDoctorSchema
} = require('../../middleware/schemas');

const router = express.Router();

router.use(authenticate, guard('ADMIN'));

router.get('/doctors/pending', adminController.handleGetPendingDoctors);
router.post('/doctors/:id/approve', adminController.handleApproveDoctor);
router.post('/doctors/:id/reject', validate(rejectDoctorSchema), adminController.handleRejectDoctor);
router.get('/doctors', adminController.handleGetAllDoctors);
router.post('/doctors', validate(createDoctorDirectlySchema), adminController.handleCreateDoctor);
router.put('/doctors/:id', validate(updateDoctorProfileSchema), adminController.handleUpdateDoctor);
router.post('/doctors/:id/leave', validate(addLeaveSchema), adminController.handleAddLeave);
router.delete('/doctors/:id/leave/:leaveId', adminController.handleRemoveLeave);

router.get('/leave-requests', adminController.handleGetPendingLeaveRequests);
router.post('/leave-requests/:id/approve', adminController.handleApproveLeaveRequest);
router.post('/leave-requests/:id/reject', adminController.handleRejectLeaveRequest);

router.get('/stats', adminController.handleGetStats);
router.get('/notifications', adminController.handleGetNotificationLog);
router.get('/history', adminController.handleGetVisitHistory);

module.exports = router;
