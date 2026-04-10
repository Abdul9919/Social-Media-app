const { prisma } = require('../Database/dbconnect.js');

const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const getUnreadNotificationCount = async (userId) => {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

module.exports = {
  getUserNotifications,
  getUnreadNotificationCount,
}
