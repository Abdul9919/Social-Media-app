const amqp = require('amqplib');

let connection = null;
let channel = null;

async function connectQueue() {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL;
    connection = await amqp.connect(rabbitUrl);

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
    });

    connection.on('close', () => {
      console.warn('RabbitMQ connection closed, reconnecting in 5s...');
      channel = null;
      connection = null;
      setTimeout(connectQueue, 5000);
    });

    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error('RabbitMQ connection failed:', error.message);
    console.warn('Retrying in 5s...');
    setTimeout(connectQueue, 5000);
  }
}

const getChannel = () => channel;

module.exports = { connectQueue, getChannel };