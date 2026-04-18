const express = require('express')
const router = express.Router()
const {registerUser,loginUser, getCurrentUser, getUser, changeUserNameAndBio , changeUserInfo, uploadProfilePicture} = require('../controllers/userController.js')
const protect = require('../middleware/authMiddleware.js')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect ,getCurrentUser)
router.get('/:id',protect, getUser)

router.put('/', protect, changeUserInfo)
router.put('/username-bio', protect, changeUserNameAndBio)
router.put('/upload-pfp', protect, upload.single('image'), uploadProfilePicture)

module.exports = router