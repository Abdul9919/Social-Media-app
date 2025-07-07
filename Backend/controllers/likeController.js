const { pool } = require('../Database/dbconnect.js');

const likePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const existingLike = await pool.query('SELECT * FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
        if (existingLike.rows.length > 0) {
            return res.status(400).json({ message: 'Post already liked' });
        }
        await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
        res.status(201).json({ message: 'Post liked' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const unlikePost = async (req, res) => {
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        await pool.query(`
      DELETE FROM likes
      WHERE user_id = $1 AND post_id = $2
    `, [userId, postId]);

        res.status(200).json({ message: 'Post unliked' });
    } catch (err) {
        res.status(500).json({ message: 'Error unliking post' });
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