const { getChannel } = require('../queue/connection.js');
const { prisma } = require('../Database/dbconnect.js');
const { publisher } = require('../Database/redis.js');
// const {client} = require('../Database/redis.js');
const postRepository = require('../repositories/postRepository.js');
const userRepository = require('../repositories/userRepository.js');
const axios = require('axios');
const meilisearchClient = require('../config/meilisearch.js');
const { publishToQueue } = require('../queue/producer.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

const postTagWorker = async (queueName) => {
    const channel = getChannel(); // Assuming your RabbitMQ connection utility
    await channel.assertQueue(queueName, { durable: true });

    // Process only 1 message at a time to ensure the AI has time to think
    channel.prefetch(1);
    console.log(`🚀 Post Tag worker started for queue: ${queueName}`);

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            // 1. Parse incoming data from RabbitMQ
            const postData = JSON.parse(msg.content.toString());
            const { postId, media_url, description } = postData;

            console.log(`📦 Received Post ID: ${postId} for tagging...`);

            // 2. Make the request to your n8n workflow
            const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

            const response = await axios.post(n8nWebhookUrl, {
                postId,
                media_url,
                description
            }, { timeout: 90000 }); // 30s timeout for AI processing

            const tags = response.data.tags; // Expecting ["tag1", "tag2", ...]
            let updatedPost;
            // 3. Update Database using the separate Tags table
            if (Array.isArray(tags) && tags.length > 0) {
                console.log(`🏷️  Applying tags to DB: ${tags.join(', ')}`);

                updatedPost = await prisma.post.update({
                    where: { id: postId },
                    data: {
                        tags: {
                            connectOrCreate: tags.map((tagName) => ({
                                where: { name: tagName },
                                create: { name: tagName },
                            })),
                        },
                    },
                    include: { tags: true }, // 👈 include the actual tag objects in the response
                });


                console.log(`✅ Post ${postId} successfully tagged.`);
                for (const tag of updatedPost.tags) {
                    await publishToQueue('searchSync-queue', {
                        type: 'tag',
                        data: {
                            id: tag.id,
                            name: tag.name,
                        },
                    });
                }

                await sleep(4000);
            } else {
                console.warn(`⚠️  No tags returned from n8n for Post ${postId}`);
            }

            // 4. Acknowledge the message to RabbitMQ
            channel.ack(msg);

        } catch (error) {
            console.error('❌ Error in Post Tag Worker:', error.message);

            /* Re-queueing logic: If n8n is down, put the message back in the queue.
               The 'true' parameter as the 3rd argument tells RabbitMQ to re-queue.
            */
            channel.nack(msg, false, true);
        }
    });
};

const userInterestsWorker = async (queueName) => {
    const channel = getChannel();
    await channel.assertQueue(queueName, { durable: true });

    channel.prefetch(10);
    console.log(`🧠 Interest Scoring worker started: ${queueName}`);

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            const { userId, postId, type } = JSON.parse(msg.content.toString());

            const weights = {
                'like': 0.15,
                'view': 0.05,
                'comment': 0.20
            };
            const increment = weights[type] || 0.05;

            // Pre-convert to Numbers to avoid repetitive logic
            const targetUserId = Number(userId);
            const targetPostId = Number(postId);

            console.log(`📈 Processing ${type} for User ${targetUserId} on Post ${targetPostId}`);

            const post = await prisma.post.findUnique({
                where: { id: targetPostId },
                select: {
                    tags: { select: { id: true } }
                }
            });

            if (!post || !post.tags.length) {
                console.log(`Skipping: Post ${targetPostId} has no tags.`);
                return channel.ack(msg);
            }

            const updatePromises = post.tags.map(async (tag) => {
                const targetTagId = Number(tag.id);

                // Corrected where clause: explicitly naming userId and tagId
                const existing = await prisma.userInterest.findUnique({
                    where: {
                        userId_tagId: {
                            userId: targetUserId,
                            tagId: targetTagId
                        }
                    }
                });

                const oldScore = existing?.score || 0;
                const newScore = oldScore + (increment * (1 - oldScore));

                return prisma.userInterest.upsert({
                    where: {
                        userId_tagId: {
                            userId: targetUserId,
                            tagId: targetTagId
                        }
                    },
                    update: {
                        score: newScore,
                        updatedAt: new Date()
                    },
                    create: {
                        userId: targetUserId,
                        tagId: targetTagId,
                        score: newScore
                    }
                });
            });

            await Promise.all(updatePromises);

            console.log(`✅ Updated ${post.tags.length} interests for User ${targetUserId}`);
            channel.ack(msg);

        } catch (error) {
            console.error('❌ Interest Worker Error:', error);
            channel.nack(msg, false, true);
        }
    });
};

const searchSyncWorker = async (queueName) => {
    const channel = getChannel();
    await channel.assertQueue(queueName, { durable: true });

    channel.prefetch(1);
    console.log(`Search Sync worker started: ${queueName}`);
    const client = meilisearchClient;

    channel.consume(queueName, async (msg) => {
        if (!msg) return;

        try {
            const { type, data } = JSON.parse(msg.content.toString());
            // console.log(JSON.parse(msg.content.toString()))
            if (type === 'post') {
                await client.index('posts').addDocuments(data);
                // console.log(result)
            } else if (type === 'user') {
                await client.index('users').addDocuments(data);
            }
            else if (type === 'tag') {
                await client.index('tags').addDocuments(data);
            }
            else {
                console.warn(`Unknown search sync type: ${type}`);
            }

            channel.ack(msg);
        } catch (error) {
            console.error('Search Sync Worker Error:', error);
            channel.nack(msg, false, true);
        }
    });
}
module.exports = { notifWorker, postTagWorker, userInterestsWorker, searchSyncWorker };