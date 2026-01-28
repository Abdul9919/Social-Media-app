const { pool, prisma } = require('../Database/dbconnect.js')

const getCommentCount = async (postId) => {
    const getCommentCount = await pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [postId]);
    return getCommentCount.rows[0]
}

const getPostComments = async (postId, itemsPerPage, offSet, userId) => {
    const getPostComments = await pool.query(`
        SELECT 
            comments.id, 
            comments.content, 
            comments.created_at, 
            comments.user_id,
            comments.likes,
            users.username, 
            users.profile_picture,
            EXISTS (
                SELECT 1 FROM comment_likes 
                WHERE comment_likes.comment_id = comments.id 
                AND comment_likes.user_id = $4
            ) AS liked_by_user
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE post_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3;` , [postId, itemsPerPage, offSet, userId]);
    return getPostComments.rows
}

const createComment = async (content, userId, postId) => {
    const result = await pool.query(
        `
  WITH inserted_comment AS (
    INSERT INTO comments (content, user_id, post_id)
    VALUES ($1, $2, $3)
    RETURNING *
  )
  SELECT 
    inserted_comment.*,
    users.username,
    users.profile_picture
  FROM inserted_comment
  JOIN users ON inserted_comment.user_id = users.id;
  `,
        [content, userId, postId]
    );
    return result.rows[0]
}

module.exports = {
    getCommentCount,
    getPostComments,
    createComment
}