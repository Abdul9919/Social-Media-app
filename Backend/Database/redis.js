const {createClient} = require('redis');

client = createClient({
    url:'redis://192.168.18.41:6379',
})

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
  connectRedis
};