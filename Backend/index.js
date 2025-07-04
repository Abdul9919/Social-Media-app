const express = require('express');
require('dotenv').config();
const {initDB,pool} = require('./Database/dbconnect.js');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes.js');
const port = process.env.PORT || 5000;
const postRoutes = require('./routes/postRoutes.js')
const commentRoutes = require('./routes/commentRoutes.js')
const likeRoutes = require('./routes/likeRoutes.js');
const {connectRedis, client}= require('./Database/redis.js');

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
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true
  }
));
 
app.use('/api/likes', likeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

initDB()
  .then(() => {
    console.log('Database initialization complete');})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});