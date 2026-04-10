const { prisma } = require('../Database/dbconnect.js');

const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
        },
      },
      post: {
        select: {
          id: true,
          mediaUrl: true,
          mediaType: true,
        },
      },
    },
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
