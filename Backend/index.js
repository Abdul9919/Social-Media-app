const express = require('express');
require('dotenv').config();
const {initDB,pool} = require('./Database/dbconnect.js');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes.js');
const port = process.env.PORT || 5000;
const postRoutes = require('./routes/postRoutes.js')
const commentRoutes = require('./routes/commentRoutes.js')
const likeRoutes = require('./routes/likeRoutes.js');
const followRoutes = require('./routes/followRoute.js')
const notificationRoutes = require('./routes/notificationRoutes.js');
const {connectRedis, client}= require('./Database/redis.js');
const helmet = require('helmet');
const { connectQueue } = require('./queue/connection.js');
const { notifWorker } = require('./worker/worker.js');


const app = express();
app.use(helmet())
app.use(express.json()); 

(async () => {
  try {
    await connectRedis();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Error connecting to Redis:', error);
  }
})();

app.use(cors(
  {
    origin: [process.env.FRONTEND_URL, 'localhost:5173'],  
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    credentials: true
  }
));


connectQueue().then(() => {
    console.log('RabbitMQ connection established');
    notifWorker('notif-queue')

})

 
app.use('/api/likes', likeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes)
app.use('/api/notifications', notificationRoutes);

initDB()
  .then(() => {
    console.log('Database initialization complete');})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);

});