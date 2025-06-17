const express = require('express');
require('dotenv').config();
const {initDB,pool} = require('./Database/dbconnect.js');
const cors = require('cors');
const app = express();
const userRoutes = require('./routes/userRoutes.js');
const port = process.env.PORT || 5000;
 const postRoutes = require('./routes/postRoutes.js')

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

initDB()
  .then(() => {
    console.log('Database initialization complete');})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});