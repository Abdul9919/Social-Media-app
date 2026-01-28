const express = require('express');
const { likePost, unlikePost, getLikes, likeComment } = require('../controllers/likeController.js');
const protect = require('../middleware/authMiddleware.js');
const router = express.Router();

router.post('/:postId',protect, likePost);
router.delete('/:postId',protect, unlikePost); 
router.get('/:postId',protect, getLikes);
router.post('/comments/:commentId', protect, likeComment);

module.exports = router;