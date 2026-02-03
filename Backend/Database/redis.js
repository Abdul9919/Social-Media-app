const {createClient} = require('redis');

client = createClient({
    url:'redis://redis:6379',
})

client.on('error', err => console.log('Redis Client Error', err));

client.on('connect', () => {
  console.log('✅ Redis client connected successfully');
});

function connectRedis() {
client.connect();
    const pong = client.ping();
  console.log(`✅ Redis PING response: ${pong}`);
}



module.exports = {
  client,
  connectRedis
};