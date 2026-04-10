const { prisma } = require('../Database/dbconnect.js');

const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = {
  getUserNotifications,
};
