const express = require('express');
const { getPosts, createPost, updatePost, deletePost, getSinglePost, getUserPosts, getUserFeedPosts, handleViewPost } = require('../controllers/postController');
const router = express.Router();
const protect = require('../middleware/authMiddleware.js')
const multer  = require('multer')
const upload = multer({ dest: 'posts/' })

router.get('/',protect, getPosts);
router.get('/user-posts/:id', getUserPosts);
router.post('/view', protect, handleViewPost)
router.post('/', protect, upload.single('media'), createPost);

router.get('/feed', protect, getUserFeedPosts);
router.get('/:id', protect, getSinglePost); // Assuming you want to fetch a specific post by ID
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);


module.exports = router;