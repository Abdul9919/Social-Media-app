const { prisma } = require('../Database/dbconnect.js');

const getUserNotifications = async (userId, currentUserId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          profilePicture: true,
          followers: {
            where: { followedBy: currentUserId },
            select: { followedBy: true },
          },
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

const markNotificationsRead = async (userId) => {
  return await prisma.$transaction([
    prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { notifCount: 0 },
    }),
  ]);
};

module.exports = {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
};
