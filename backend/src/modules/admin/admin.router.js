const express = require('express');
const adminController = require('./admin.controller');
const authenticate = require('../../middleware/authenticate');
const guard = require('../../middleware/guard');

const router = express.Router();

router.use(authenticate, guard('ADMIN'));

router.get('/doctors/pending', adminController.handleGetPendingDoctors);
router.post('/doctors/:id/approve', adminController.handleApproveDoctor);
router.post('/doctors/:id/reject', adminController.handleRejectDoctor);
router.get('/doctors', adminController.handleGetAllDoctors);
router.post('/doctors', adminController.handleCreateDoctor);
router.put('/doctors/:id', adminController.handleUpdateDoctor);
router.post('/doctors/:id/leave', adminController.handleAddLeave);
router.delete('/doctors/:id/leave/:leaveId', adminController.handleRemoveLeave);
router.get('/stats', adminController.handleGetStats);
router.get('/notifications', adminController.handleGetNotificationLog);

module.exports = router;
