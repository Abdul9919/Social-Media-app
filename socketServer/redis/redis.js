const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
client.on('error', err => console.log('Redis Client Error', err));

client.on('connect', () => {
    console.log('✅ Redis client connected successfully');
});
async function connectRedis() {
   await client.connect();
    const pong = await client.ping();
    console.log(`✅ Redis PING response: ${pong}`);
}

module.exports = {
    client,
    connectRedis
};