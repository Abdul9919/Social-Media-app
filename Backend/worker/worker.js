const { getChannel } = require('../queue/connection.js');

async function startWorker(queueName) {
    const channel = getChannel();
    await channel.assertQueue(queueName, { durable: true });
    
    // Process only 1 message at a time to prevent overloading
    channel.prefetch(1);

    console.log(` 🚀 Worker started for queue: ${queueName}`);

    channel.consume(queueName, async (msg) => {
        if (msg !== null) {
            const content = JSON.parse(msg.content.toString());
            
            try {
                // Execute the actual logic (e.g., sending an email)
                await console.log(JSON.parse(msg.content.toString()));
                channel.ack(msg); // Confirm success
            } catch (err) {
                console.error("Worker Error:", err);
                // Optional: channel.nack(msg) to requeue if it fails
            }
        }
    });
}

module.exports = { startWorker };