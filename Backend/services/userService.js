const userRepository = require('../repositories/userRepository.js')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

module.exports = {
    registerUser
}