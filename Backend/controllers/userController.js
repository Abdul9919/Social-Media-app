const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../Database/dbconnect.js');

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const existingUsername = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUsername.rows.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        const newUser = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *', [username, email, hashedPassword]);
        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            id: newUser.rows[0].id,
            username: newUser.rows[0].username,
        });
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
            return res.status(409).json({ message: 'Invalid email or password' });
        }
        const passwordMatch = await bcrypt.compare(password, checkEmail.rows[0].password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign(
            { id: checkEmail.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        res.status(200).json({
            id: checkEmail.rows[0].id,
            username: checkEmail.rows[0].username,
            email: checkEmail.rows[0].email,
            token
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getUser = async (req, res) => {
    const userId = req.user.id

    if (!userId) {
        return res.status(404).json({ message: 'User not found' });
    }    
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
    res.json(userId)
}

const changeUserInfo = async (req, res) => {
    const userId = req.user.id;
    const { username, email, password } = req.body;
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
    res.status(200).json(updatedUser);
}

module.exports = { registerUser, loginUser, getUser, changeUserInfo };