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

module.exports = {
    existingEmail,
    existingUsername,
    createUser
}