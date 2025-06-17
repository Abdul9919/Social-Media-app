const { pool } = require('../Database/dbconnect.js');

const getPosts = async (req, res) => {
    try {
        const allPosts = await pool.query('SELECT * FROM posts')
        res.status(200).json(allPosts)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const updatedPost = await pool.query('UPDATE posts SET content = $1 WHERE id = $2 RETURNING *', [content, id]);
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM posts WHERE id = $1', [id]);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message })
        
    }
}

const createPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' })
        }

        const newPost = await pool.query('INSERT INTO posts (content, user_id) VALUES ($1, $2) RETURNING *', [content, userId])
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = { getPosts, updatePost, deletePost, createPost }