const { pool } = require('../Database/dbconnect.js')
const commentService = require('../services/commentService.js')

const getComments = async (req, res) => {
  try {
    const userId = req.user?.id
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 1;

    const responseData = await commentService.getComments(userId, postId, page)

    res.status(200).json(responseData)
    } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
  }
}

const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await commentService.createComment(userId, postId, content);
    // await client.del(`post_comments_${postId}_${userId}`);
    res.status(201).json(comment);

  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal Server Error' });
  }
};


const updateComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    if(!userId){
      return res.status(401).json({message: 'Unauthorized'})
    }

    if (!content) {
      return res.status(400).json({ message: "content is required" })
    }

    const updatedComment = await pool.query('UPDATE comments SET content = $1 WHERE id = $2 RETURNING *', [content, postId]);
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message })

  }
}

const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id
    const commentId = req.params.id;
    if(!userId){
      return res.status(401).json({message: 'Unauthorized'})
    }
    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);
    res.status(200).json({ message: 'comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })

  }
}

module.exports = { getComments, createComment, updateComment, deleteComment }