const amqp = require('amqplib');

let connection = null;
let channel = null;

async function connectQueue() {
    try {
        // Use environment variable for Docker compatibility
        const rabbitUrl = process.env.RABBITMQ_URL;
        connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();
        
        console.log("✅ Connected to RabbitMQ");
        return { connection, channel };
    } catch (error) {
        console.error("❌ RabbitMQ Connection Failed:", error);
    }
}

const getChannel = () => channel;

module.exports = { connectQueue, getChannel };