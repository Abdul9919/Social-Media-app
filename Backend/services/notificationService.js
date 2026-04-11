const notificationRepository = require('../repositories/notificationRepository.js');

const getUserNotifications = async (userId) => {
  if (!userId) {
    const error = new Error('Invalid user id');
    error.statusCode = 400;
    throw error;
  }

  const notifications = await notificationRepository.getUserNotifications(userId, userId);
  return notifications.map((notification) => {
    const actor = notification.actor ? {
      id: notification.actor.id,
      username: notification.actor.username,
      profilePicture: notification.actor.profilePicture,
      isFollowingActor: (notification.actor.followers?.length || 0) > 0,
    } : null;

    return {
      ...notification,
      actor,
    };
  });
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
