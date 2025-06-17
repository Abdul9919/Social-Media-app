const express = require('express')
const router = express.Router()
const {registerUser,loginUser, getUsers, changeUserInfo} = require('../controllers/userController.js')
const protect = require('../middleware/authMiddleware.js')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/', getUsers)
router.put('/', protect, changeUserInfo)

module.exports = router