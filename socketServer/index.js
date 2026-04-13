const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { client, connectRedis } = require('./redis/redis.js');
const { subscriber } = require('./redis/redis.js');

const app = express();
(async () => {
  try {
    await connectRedis();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
})();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"] 
  }
});

io.on("connection", async (socket) => {
  await client.hSet('online_users', socket.handshake.auth.userId.toString(), socket.id);
  socket.on("disconnect", async () => {
    await client.hDel('online_users', socket.handshake.auth.userId.toString());
    console.log(`User disconnected: ${socket.id}`);
  }); 
});

subscriber.subscribe('notifications', (err) => {
    if (err) console.error('Redis subscribe error:', err);
  });

subscriber.on('message', async (channel, message) => {
    if (channel === 'notifications') {
      const notification = JSON.parse(message);
      const { userId } = notification; 
      const socketId = await client.hGet('online_users', userId.toString());
      if (socketId) {
        io.to(socketId).emit('notification', notification);
        console.log('notif sent')
      } else {
        console.log(`User ${userId} is offline, notification saved to DB only`);
      }
    }
  });

server.listen(4999, "0.0.0.0",() => {
    console.log("Socket.IO server running on port 4999");
})
