const express = require('express');
const { getPosts, createPost, updatePost, deletePost } = require('../controllers/postController');
const router = express.Router();
const protect = require('../middleware/authMiddleware.js')

router.get('/', getPosts);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;