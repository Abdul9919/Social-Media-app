const express = require('express');
const router = express.Router();
const { searchAll, searchUsers, searchPosts } = require('../controllers/searchController.js');

router.get('/all', searchAll);
router.get('/users', searchUsers);
router.get('/posts', searchPosts);

module.exports = router;
