const express = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');

const router = express.Router();

router.post('/register', authController.handleRegisterPatient);
router.post('/register/doctor', authController.handleRegisterDoctor);
router.post('/login', authController.handleLogin);
router.get('/me', authenticate, authController.handleGetMe);

module.exports = router;
