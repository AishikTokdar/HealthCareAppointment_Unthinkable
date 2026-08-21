const express = require('express');
const calendarController = require('./calendar.controller');
const authenticate = require('../../middleware/authenticate');

const router = express.Router();

router.get('/auth-url', authenticate, calendarController.handleGetAuthUrl);
router.get('/callback', calendarController.handleCallback);
router.delete('/disconnect', authenticate, calendarController.handleDisconnect);

module.exports = router;
