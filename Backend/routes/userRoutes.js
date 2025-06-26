const express = require('express')
const router = express.Router()
const {registerUser,loginUser, getUser, changeUserInfo} = require('../controllers/userController.js')
const protect = require('../middleware/authMiddleware.js')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me',protect, getUser)
router.put('/', protect, changeUserInfo)

module.exports = router