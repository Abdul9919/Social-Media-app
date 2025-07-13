const { pool } = require('../Database/dbconnect.js');
const { client } = require('../Database/redis.js');

const existingLike = async (postId, userId) => {
    const existingLike = await pool.query('SELECT * FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    return await existingLike.rows
}

const likePost = async (postId, userId) => {
    const like = await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
    await client.incr(`post:${postId}:like_count`);
    return await like
}

const unlikePost = async (userId, postId) => {
    const unlike = await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *', [userId, postId]);
    const existingLikeCache = await client.get(`post:${postId}:like_count`)
    const likeCount = parseInt(existingLikeCache, 10);
    if (likeCount > 0) {
        await client.decr(`post:${postId}:like_count`);
    }
    return await unlike
}

const getLikes = async (postId, itemsPerPage, offSet) => {
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
    return await likes.rows
}

module.exports = {
    existingLike,
    likePost,
    unlikePost,
    getLikes
}