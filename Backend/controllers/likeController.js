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
    }
}

const getLikes = async (req, res) => {
    try {
        const userId = req.user.id
        const postId = req.params.postId;
        const itemsPerPage = 7;
        const page = parseInt(req.query.page) || 1;
        const offSet = (page - 1) * itemsPerPage;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }
        const likes = await pool.query(`
            SELECT 
              likes.*,
              u.username,
              u.profile_picture
            FROM likes
            JOIN users u ON likes.user_id = u.id
            WHERE likes.post_id = $1
            ORDER BY likes.created_at DESC
            LIMIT $2
            OFFSET $3
              `, [postId, itemsPerPage, offSet]);
        if (likes.rows.length === 0) {
            return res.status(404).json({ message: 'No likes found for this post' });
        }

        res.status(200).json(
            likes.rows.map(({ username, profile_picture, user_id }) => ({
                username,
                profile_picture,
                user_id
            }))
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error.message)

    }
}

module.exports = {
    likePost,
    unlikePost,
    getLikes
}