const { getChannel } = require('../queue/connection.js');
const { prisma } = require('../Database/dbconnect.js');

async function notifWorker(queueName) {
    const channel = getChannel();
    await channel.assertQueue(queueName, { durable: true });

    // Process only 1 message at a time to prevent overloading
    channel.prefetch(1);

    console.log(` 🚀 Notification worker started for queue: ${queueName}`);

    channel.consume(queueName, async (msg) => {
        // console.log('notif worker received message:', msg ? msg.content.toString() : null);
        if (msg === null) {
            return;
        }

        let content;
        try {
            content = JSON.parse(msg.content.toString());
        } catch (err) {
            console.error('Invalid message payload, unable to parse JSON:', err);
            channel.ack(msg);
            return;
        }

        const { userId, actorId, type, message } = content;

        if (userId == null) {
            console.error('Notification payload missing required field: userId');
            channel.ack(msg);
            return;
        }

        if (actorId == null) {
            console.error('Notification payload missing required field: actorId');
            channel.ack(msg);
            return;
        }

        if (!type || typeof type !== 'string') {
            console.error('Notification payload missing required field: type');
            channel.ack(msg);
            return;
        }

        try {
            const notification = await prisma.$transaction(async (tx) => {
                const createdNotification = await tx.notification.create({
                    data: {
                        userId,
                        actorId,
                        type,
                        message: typeof message === 'string' ? message : '',
                        isRead: false,
                    },
                });

                await tx.user.update({
                    where: { id: userId },
                    data: { notifCount: { increment: 1 } },
                });

                return createdNotification;
            });

            console.log('Notification created and notifCount updated:', notification);
            channel.ack(msg);
        } catch (err) {
            console.error('Worker Error while saving notification or updating notifCount:', err);
            channel.nack(msg, false, true);
        }
    });
}

module.exports = { notifWorker };