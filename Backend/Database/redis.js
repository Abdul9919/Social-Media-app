const {createClient} = require('redis');
const Redis = require('ioredis');

client = createClient({
    url:`redis://${process.env.REDIS_HOST}:6379`,
})

const publisher = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 });

client.on('error', err => console.log('Redis Client Error', err));

client.on('connect', () => {
  console.log('✅ Redis client connected successfully');
});

async function connectRedis() {
client.connect();
    const pong = await client.ping();
  console.log(`✅ Redis PING response: ${pong}`);
}



module.exports = {
  client,
  connectRedis,
  publisher
};