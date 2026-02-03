const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { client, connectRedis } = require('./redis/redis.js');

const app = express();
(async () => {
  try {
    await connectRedis();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
})();
// Create HTTP server (important — sockets attach to THIS)
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // change to frontend URL in production
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

server.listen(5001, "0.0.0.0",() => {
    console.log("Socket.IO server running on port 5001");
})
