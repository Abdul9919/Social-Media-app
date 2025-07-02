const express = require('express');
const { getComments, createComment, updateComment, deleteComment } = require('../controllers/commentController.js');
const protect = require('../middleware/authMiddleware.js');
const router = express.Router();

router.get('/:postId',protect, getComments);
router.post('/:postId',protect, createComment);
router.put('/:id',protect, updateComment);
router.delete('/:id',protect, deleteComment);

module.exports = router