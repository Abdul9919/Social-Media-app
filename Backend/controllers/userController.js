
const userService = require('../services/userService.js')


const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await userService.registerUser(username, email, password, res)
        res.status(201).json({message: 'New user Registered'})
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(error.statusCode || 500).json({ message : error.message || 'Internal server error' });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.loginUser(email,password, res)
        res.status(200).json(user);
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(error.statusCode || 500).json({ message : error.message || 'Internal server error' });
    }
}

const getUser = async (req, res) => {
    const userId = req.user.id
    try {
        const user = await userService.getUser(userId, res)
        res.status(200).json(user)
    } catch (error) {
        res.status(error.statusCode || 500).json({message : error.message || 'Something went wrong'})
    }
}

const changeUserInfo = async (req, res) => {
    const userId = req.user.id;
    const { username, email, password } = req.body;
    try {
        const user = await userService.changeUserInfo(userId, username, email, password, res)
        res.status(200).json({message : 'User info updated successfully'})
    } catch (error) {
        res.status(error.statusCode || 500).json({ message : error.message || 'Internal server error' });
    }
}

const uploadProfilePicture = async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    try{
        const user = await userService.uploadProfilePicture(userId, file, res)
        res.status(200).json({message: 'Profile Picture uploaded successfully'})
    }
     catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(error.statusCode || 500).json({ message : error.message || 'Internal server error' });
    }
}



module.exports = { registerUser, loginUser, getUser, changeUserInfo, uploadProfilePicture };