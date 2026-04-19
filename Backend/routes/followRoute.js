const express = require('express')
const router = express.Router()
const {followUser, unfollowUser, getFollowers, getFollowing} = require('../controllers/followController.js');
const protect = require('../middleware/authMiddleware.js');

router.post('/:id',protect, followUser)
router.delete('/:id',protect, unfollowUser)
router.get('/:id', getFollowers)
router.get('/', getFollowing)

module.exports = router