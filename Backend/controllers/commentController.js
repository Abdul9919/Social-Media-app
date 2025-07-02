const {pool} = require('../Database/dbconnect.js')

const getComments = async (req,res) => {
    try {
        const postId = req.params.postId;
        const getCommentCount = await pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [postId]);
        const getPostComments = await pool.query('SELECT comments.id, comments.content, comments.created_at, users.username, users.profile_picture FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1 ORDER BY created_at DESC', [postId]);
        res.status(200).json({ count: getCommentCount.rows[0], comments: getPostComments.rows });
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (!postId || isNaN(postId)) {
      return res.status(400).json({ message: "Valid postId is required" });
    }

    // Insert the new comment
    const result = await pool.query(
      'INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *',
      [content, userId, postId]
    );

    const comment = result.rows[0];
    res.status(201).json(comment);

  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const updateComment = async (req,res) => {
    try {
        const postId = req.params.id;
        const {content} = req.body;

        if(!content){
            return res.status(400).json({message: "content is required"})
        }

        const updatedComment = await pool.query('UPDATE comments SET content = $1 WHERE id = $2 RETURNING *', [content, postId]);
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(500).json({message: error.message})
        
    }
}

const deleteComment = async (req,res) => {
    try {
        const commentId = req.params.id;
        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
        res.status(200).json({message : 'comment deleted successfully'})
    } catch (error) {
        res.status(500).json({message: error.message})
        
    }
}

module.exports = {getComments, createComment, updateComment, deleteComment}