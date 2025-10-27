const userRepository = require('../repositories/userRepository.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { client } = require('../Database/redis.js');
const cloudinary = require('../config/cloudinary.js');
const fs = require('fs/promises');

const registerUser = async (username, email, password) => {
    if (!username || !email || !password) {
        const error = new Error('All fields are required');
        error.statusCode = 400;
        throw error;
    }

    const existingEmail = await userRepository.existingEmail(email);
    if (existingEmail.rows.length > 0) {
        const error = new Error('Email already exists');
        error.statusCode = 409;
        throw error;
    }

    const existingUsername = await userRepository.existingUsername(username);
    if (existingUsername.rows.length > 0) {
        const error = new Error('Username already exists');
        error.statusCode = 409;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = { username, email, password: hashedPassword };
    return await userRepository.createUser(newUser);
};

const loginUser = async (email, password, res) => {
    if (!email || !password) {
        const error = new Error('All fields are required');
        error.statusCode = 400
        throw error
    }
    const checkUser = await userRepository.checkUser(email)

    if (checkUser.rows.length === 0) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401
        throw error
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

const getCurrentUser = async (userId) => {
    const cachedUser = await client.get(`user:${userId}`);

    let user;

    if (cachedUser) {
        return (user = (JSON.parse(cachedUser)));
    }

    if (!userId) {
        const error = new Error('Unauthorized');
        error.statusCode = 401
        throw error
    }

    user = await userRepository.getUser(userId)

    if (user.rows.length === 0) {
        const error = new Error('User does not exist');
        error.statusCode = 404
        throw error
    }

    await client.del(`user:${userId}`);

    return user.rows

}

const getUser = async (userId, currentUser) => {
    if (!userId) {
        const error = new Error('User id is required');
        error.statusCode = 400
        throw error
    }

    const user = await userRepository.getUser(userId, currentUser)

    if (user.rows.length === 0) {
        const error = new Error('User does not exist');
        error.statusCode = 404
        throw error
    }

    return user.rows[0]

}

const changeUserInfo = async (userId, username, email, password, res) => {
    if (!userId) {
        const error = new Error('Unauthorized');
        error.statusCode = 401
        throw error
    }

    if (!username) {
        const error = new Error('Username is missing');
        error.statusCode = 400
        throw error
    }

    if (!email) {
        const error = new Error('email is missing');
        error.statusCode = 400
        throw error
    }

    if (!password) {
        const error = new Error('Password is missing');
        error.statusCode = 400
        throw error
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await userRepository.changeUserInfo(userId, username, email, password)

}

const uploadProfilePicture = async (userId, file,res ) => {

    if (!userId) {
        const error = new Error('Unauthorized');
        error.statusCode = 401
        throw error
    }

    if (!file) {
        const error = new Error('No file provided');
        error.statusCode = 400
        throw error
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Invalid file type');
        error.statusCode = 400
        throw error
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
    getCurrentUser,
    changeUserInfo,
    uploadProfilePicture,
    getUser
}