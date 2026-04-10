const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController.js');
const protect = require('../middleware/authMiddleware.js');

router.get('/',protect, notificationController.getUserNotifications);

module.exports = router;
