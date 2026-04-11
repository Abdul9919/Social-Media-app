const { getChannel } = require('./connection.js');

async function publishToQueue(queueName, data) {
    const channel = getChannel();
    await channel.assertQueue(queueName, { durable: true });
    
    channel.sendToQueue(
        queueName, 
        Buffer.from(JSON.stringify(data)), 
        { persistent: true }
    );
    
    console.log(` [x] Sent to ${queueName}`);
}

module.exports = { publishToQueue };