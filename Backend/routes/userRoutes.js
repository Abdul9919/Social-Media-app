const express = require('express')
const router = express.Router()
const {registerUser,loginUser, getUsers} = require('../controllers/userController.js')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/', getUsers)

module.exports = router