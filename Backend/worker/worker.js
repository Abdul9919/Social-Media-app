const { getChannel } = require('../queue/connection.js');
const { prisma } = require('../Database/dbconnect.js');
const {publisher} = require('../Database/redis.js');
// const {client} = require('../Database/redis.js');
const postRepository = require('../repositories/postRepository.js');
const userRepository = require('../repositories/userRepository.js');

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

        const { userId, actorId, type, message, postId } = content;

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
                        userId: parseInt(userId, 10),
                        actorId,
                        postId: postId ? parseInt(postId, 10) : null,
                        type,
                        message: typeof message === 'string' ? message : '',
                        isRead: false,
                    },
                });

                await tx.user.update({
                    where: { id: parseInt(userId, 10) },
                    data: { notifCount: { increment: 1 } },
                });

                return createdNotification;
            });
            const postDetails = await postRepository.getPostIdMediaTypeUrl(parseInt(postId, 10));
            const userDetails = await userRepository.getUserPfpIdName(parseInt(actorId, 10));
            await publisher.publish('notifications', JSON.stringify({
                post: postDetails,
                actor: userDetails,
                userId,
                type,
                is_read: false,
                message
            }));
            console.log('Notification created and notifCount updated:');
            channel.ack(msg);
        } catch (err) {
            console.error('Worker Error while saving notification or updating notifCount:', err);
            channel.nack(msg, false, true);
        }
    });
}

module.exports = { notifWorker };