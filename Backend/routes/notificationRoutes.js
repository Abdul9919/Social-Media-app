const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController.js');
const protect = require('../middleware/authMiddleware.js');

router.get('/', protect, notificationController.getUserNotifications);
router.patch('/read-all', protect, notificationController.markNotificationsRead);

module.exports = router;
