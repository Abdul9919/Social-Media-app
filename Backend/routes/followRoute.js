const express = require('express')
const router = express.Router()
const {followUser, unfollowUser} = require('../controllers/followController.js');
const protect = require('../middleware/authMiddleware.js');

router.post('/:id',protect, followUser)
router.delete('/:id',protect, unfollowUser)

module.exports = router