const { pool } = require('../Database/dbconnect.js');

const existingEmail = async (email) => {
    const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return existingEmail
}

const existingUsername = async (username) => {
    const existingUsername = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return existingUsername
}

const createUser = async (newUser) =>{
    const createdUser = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [newUser.username, newUser.email, newUser.password]);
    return await createdUser
}

const checkUser = async (email) => {
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return await checkEmail
}

const getUser = async (userId) => {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
    return await user
}

const changeUserInfo = async (userId,username,email,password) => {
    const user = await pool.query('UPDATE users SET username= $1 password= $2 email= $3 WHERE id = $4 RETURNING *', [username, password, email, userId])
    return await user
}

const uploadProfilePicture = async (result, userId) => {
    const user = await pool.query('UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING *', [result, userId])
    return await user
}

module.exports = {
    existingEmail,
    existingUsername,
    createUser,
    checkUser,
    getUser,
    changeUserInfo,
    uploadProfilePicture
}