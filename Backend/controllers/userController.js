const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../Database/dbconnect.js');
const cloudinary = require('../config/cloudinary.js');
const fs = require('fs/promises');
const { client } = require('../Database/redis.js');
const userService = require('../services/userService.js')

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await userService.registerUser(username, email, password)
        res.status(201).json({message: 'New user Registered'})
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(409).json({ message: 'All fields are required' });
        }
        const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkEmail.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign(
            { id: checkEmail.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '5h' }
        );
        const cacheKey = `user:${checkEmail.rows[0].id}`;
        const expireKey = 18600;
        await client.set(cacheKey, JSON.stringify(checkEmail.rows[0]), {
            EX: expireKey  // Cache for 1 hour
        });
        res.status(200).json({
            id: checkEmail.rows[0].id,
            username: checkEmail.rows[0].username,
            email: checkEmail.rows[0].email,
            profile_picture: checkEmail.rows[0].profile_picture,
            token
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getUser = async (req, res) => {
    const userId = req.user.id
    const cachedUser = await client.get(`user:${userId}`);
    if (cachedUser) {
        return res.status(200).json(JSON.parse(cachedUser));
    }
    if (!userId) {
        return res.status(404).json({ message: 'User not found' });
    }
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
    if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User does not exist' });
    }
    res.json(user.rows[0])
}

const changeUserInfo = async (req, res) => {
    const userId = req.user.id;
    const { username, email, password } = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const selectedUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
    if (!username) {
        return res.status(400).json({ message: 'username is missing' })
    }
    if (!email) {
        return res.status(400).json({ message: 'email is missing' })
    }
    if (!password) {
        return res.status(400).json({ message: 'password is missing' })
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    if (selectedUser.rows.length === 0) {
        return res.status(404).json({ message: 'User does not exist' })
    }
    const updatedUser = await pool.query('UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *',
        [username, email, hashedPassword, userId]
    );
    await client.del(`user:${userId}`);
    res.status(200).json(updatedUser);
}

const uploadProfilePicture = async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    if(!userId){
      return res.status(401).json({message: 'Unauthorized'})
    }

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ message: 'Invalid file type' });
        }
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'profile_pictures',
            public_id: userId,
            overwrite: true
        });

        await fs.unlink(file.path);

        const updatedUser = await pool.query('UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING *',
            [result.secure_url, userId]
        );

        res.status(200).json(updatedUser.rows[0]);
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



module.exports = { registerUser, loginUser, getUser, changeUserInfo, uploadProfilePicture };