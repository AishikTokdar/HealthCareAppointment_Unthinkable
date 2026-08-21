const express = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');
const { validate } = require('../../middleware/validate');
const { registerPatientSchema, registerDoctorSchema, loginSchema } = require('../../middleware/schemas');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, validate(registerPatientSchema), authController.handleRegisterPatient);
router.post('/register/doctor', authLimiter, validate(registerDoctorSchema), authController.handleRegisterDoctor);
router.post('/login', authLimiter, validate(loginSchema), authController.handleLogin);
router.get('/me', authenticate, authController.handleGetMe);

module.exports = router;
