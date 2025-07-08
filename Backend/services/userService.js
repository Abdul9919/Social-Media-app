const userRepository = require('../repositories/userRepository.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { client } = require('../Database/redis.js');
const cloudinary = require('../config/cloudinary.js');
const fs = require('fs/promises');

const registerUser = async (username, email, password) => {
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const existingEmail = await userRepository.existingEmail(email)
    if (existingEmail.rows.length > 0) {
        return res.status(409).json({ message: 'Email already exists' });
    }

    const existingUsername = await userRepository.existingUsername(username)
    if (existingUsername.rows.length > 0) {
        return res.status(409).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
        username,
        email,
        password: hashedPassword
    }
    return await userRepository.createUser(newUser)
}

const loginUser = async (email, password) => {
    if (!email || !password) {
        return res.status(409).json({ message: 'All fields are required' });
    }
    const checkUser = await userRepository.checkUser(email)

    if (checkUser.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { id: checkUser.rows[0].id },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
    );

    const cacheKey = `user:${checkUser.rows[0].id}`;
    const expireKey = 18600;
    await client.set(cacheKey, JSON.stringify(checkUser.rows[0]), {
        EX: expireKey  // Cache for 1 hour
    });

    const loginUser = {
        id: checkUser.rows[0].id,
        username: checkUser.rows[0].username,
        email: checkUser.rows[0].User,
        profile_picture: checkUser.rows[0].profile_picture,
        token
    }
    return loginUser
}

const getUser = async (userId) => {

    const cachedUser = await client.get(`user:${userId}`);
    if (cachedUser) {
        return res.status(200).json(JSON.parse(cachedUser));
    }

    if (!userId) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = await userRepository.getUser(userId)

    if (user.rows.length === 0) {
        return res.status(404).json({ message: 'User does not exist' });
    }

    await client.del(`user:${userId}`);

    return user.rows

}

const changeUserInfo = async (userId, username, email, password) => {
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    if (!username) {
        res.status(400).message({ message: 'Username is missing' })
    }

    if (!email) {
        res.status(400).message({ message: 'Email is missing' })
    }

    if (!password) {
        res.status(400).message({ message: 'Password is missing' })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await userRepository.changeUserInfo(userId, username, email, password)

}

const uploadProfilePicture = async (userId, file) => {

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' })
    }

    if (!file) {
        res.status(400).json({ message: 'No file provided' })
    }

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

    return await userRepository.uploadProfilePicture(result.secure_url, userId)
}

module.exports = {
    registerUser,
    loginUser,
    getUser,
    changeUserInfo,
    uploadProfilePicture
}