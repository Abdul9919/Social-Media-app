const notificationRepository = require('../repositories/notificationRepository.js');

const getUserNotifications = async (userId) => {
  if (!userId) {
    const error = new Error('Invalid user id');
    error.statusCode = 400;
    throw error;
  }

  const notifications = await notificationRepository.getUserNotifications(userId);
  return notifications;
};

const getUnreadNotificationCount = async (userId) => {
  if (!userId) {
    const error = new Error('Invalid user id');
    error.statusCode = 400;
    throw error;
  }

  return await notificationRepository.getUnreadNotificationCount(userId);
};

const markNotificationsRead = async (userId) => {
  if (!userId) {
    const error = new Error('Invalid user id');
    error.statusCode = 400;
    throw error;
  }

  return await notificationRepository.markNotificationsRead(userId);
};

module.exports = {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
};
