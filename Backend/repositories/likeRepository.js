const { pool } = require('../Database/dbconnect.js');

const existingLike = async (postId, userId) => {
    const existingLike = await pool.query('SELECT * FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    return await existingLike.rows
}

const likePost = async (postId, userId) => {
    const like =  await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
    return await like
}

const unlikePost = async (userId, postId) => {
    const unlike = await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    return await unlike
}

module.exports = {
    existingLike,
    likePost,
    unlikePost
}