const { pool } = require('../Database/dbconnect.js');
const cloudinary = require('../config/cloudinary.js');
const fs = require('fs/promises');
const { client } = require('../Database/redis.js');
const getPosts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 3;
    const offSet = (page - 1) * itemsPerPage;

    const result = await pool.query(`
      SELECT 
        posts.*, 
        users.username, 
        users.profile_picture,
        COUNT(DISTINCT likes.user_id) AS like_count,
        EXISTS (
          SELECT 1 FROM likes 
          WHERE likes.post_id = posts.id AND likes.user_id = $1
        ) AS liked_by_user,
        COUNT(DISTINCT comments.id) AS comment_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON likes.post_id = posts.id
      LEFT JOIN comments ON comments.post_id = posts.id
      GROUP BY posts.id, users.id
      ORDER BY posts.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, itemsPerPage, offSet]);

const singlePosts = await Promise.all(result.rows.map(async (post) => {
  const postId = post.id;

  const cachedComments = await client.get(`post_comments:${postId}:first_page`);
  if (cachedComments) {
    return {
      ...post,
      comments: JSON.parse(cachedComments)
    };
  }
  const getPostComments = await pool.query(
    'SELECT comments.id, comments.content, comments.created_at, users.username, users.profile_picture FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = $1 ORDER BY created_at DESC LIMIT 5',
    [postId]
  );
  await client.set(`post_comments:${postId}:first_page`, JSON.stringify(getPostComments.rows), {
    EX: 3600  // Cache for 1 hour
  });
  return {
    ...post,
    comments: getPostComments.rows
  };
}));

res.status(200).json(singlePosts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


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
        const { description } = req.body;
        const file = req.file;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const currentDate = new Date().toISOString().split('T')[0]; // e.g., '2025-06-29'
        const publicId = `${file.filename}_${userId}_${currentDate}`;
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'posts',
            public_id: publicId,
            overwrite: false,
            resource_type: 'auto'
        });
        await fs.unlink(file.path);
        const newPost = await pool.query('INSERT INTO posts (description, media_url, media_type, user_id) VALUES ($1, $2, $3, $4) RETURNING *', [description, result.secure_url, result.resource_type, userId])
        const keys = await client.sMembers('feed_cache_keys');
        for (const key of keys) {
            await client.del(key);
        }
        res.status(201).json(newPost.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getSinglePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id || null;

        const result = await pool.query(`
            SELECT 
                posts.*, 
                users.username, 
                users.profile_picture,
                COUNT(DISTINCT likes.user_id) AS like_count,
                EXISTS (
                    SELECT 1 FROM likes 
                    WHERE likes.post_id = posts.id AND likes.user_id = $1
                ) AS liked_by_user,
                COUNT(DISTINCT comments.id) AS comment_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            LEFT JOIN likes ON likes.post_id = posts.id
            LEFT JOIN comments ON comments.post_id = posts.id
            WHERE posts.id = $2
            GROUP BY posts.id, users.username, users.profile_picture
        `, [userId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getPosts, updatePost, deletePost, createPost, getSinglePost }