const { pool } = require('../Database/dbconnect.js');
const likeService = require('../services/likeService.js')

const likePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;
        const like = await likeService.likePost(userId, postId);
        res.status(201).json({ message: 'Post liked' });
    } catch (error) {
        res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Something went wrong' });
    }
}

const unlikePost = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        await likeService.unlikePost(userId, postId );

        res.status(200).json({ message: 'Post unliked' });
    } catch (error) {
        res
      .status(error.statusCode || 500)
      .json({ message: error.message || 'Something went wrong' });
      console.log(error.message)
    }
}

const getLikes = async (req, res) => {
    try {
        const userId = req.user.id
        const postId = req.params.postId;
        const page = parseInt(req.query.page) || 1;

        const likes = await likeService.getLikes(userId, postId, page);
        

        res.status(200).json(
            likes.map(({ username, profile_picture, user_id }) => ({
                username,
                profile_picture,
                user_id
            }))
        );
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
    }
}

module.exports = {
    likePost,
    unlikePost,
    getLikes
}