const notificationService = require('../services/notificationService.js');

const getUserNotifications = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User id is missing' });
  }

  try {
    const notifications = await notificationService.getUserNotifications(userId);
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Notification Controller Error:', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to fetch notifications' });
  }
};

const markNotificationsRead = async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User id is missing' });
  }

  try {
    await notificationService.markNotificationsRead(userId);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Notification Controller Error:', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to mark notifications read' });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationsRead,
};
