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

module.exports = {
  getUserNotifications,
};
