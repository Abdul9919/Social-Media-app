const { pool } = require('../Database/dbconnect.js');


const getUserPosts = async (user) => {
    const posts = await pool.query(`
        SELECT
    p.id              AS post_id,          -- keep the post id
    p.user_id,
    p.created_at,
    p.description,
    p.media_url,
    p.media_type,
    p.likes,
    p.comments,
    u.id              AS user_id,          -- or use u.id AS author_id
    u.username,
    u.profile_picture,
    COALESCE(c.comment_count, 0) AS comment_count,
    EXISTS (
        SELECT 1
        FROM likes
        WHERE post_id = p.id
          AND user_id = $1
    ) AS liked_by_user
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN (
    SELECT post_id, COUNT(*) AS comment_count
    FROM comments
    GROUP BY post_id
) c ON c.post_id = p.id
WHERE p.user_id = $1
ORDER BY p.created_at DESC;
        `, [user]);
    //console.log(user)
    return posts.rows
}

const getPostComments = async (postId) =>{
    const comments = await pool.query(`SELECT comments.id, comments.content,comments.created_at, users.username, users.profile_picture FROM comments JOIN users on comments.user_id = users.id WHERE post_id = $1 ORDER BY comments.created_at DESC LIMIT 5`, [postId]);
    return comments.rows
}

const getLikeCount = async (postId) => {
    const likeCount = await pool.query('SELECT COUNT(*) AS like_count FROM likes WHERE post_id = $1', [postId]);
    return likeCount.rows[0].like_count
}

module.exports = {
    getUserPosts,
    getPostComments,
    getLikeCount
}