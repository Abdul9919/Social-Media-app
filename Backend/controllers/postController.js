const { pool } = require('../Database/dbconnect.js');
const cloudinary = require('../config/cloudinary.js');
const fs = require('fs/promises');
const { client } = require('../Database/redis.js');
const postService = require('../services/postService.js');

const getPosts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 3;
    const offset = (page - 1) * itemsPerPage;

    // Fetch posts with subqueries to optimize performance
    const result = await pool.query(`
     SELECT 
        p.*, 
        u.username, 
        u.profile_picture,
        COALESCE(c.comment_count, 0) AS comment_count,
        EXISTS (
          SELECT 1 FROM likes 
          WHERE post_id = p.id AND user_id = $1
        ) AS liked_by_user
      FROM posts p
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
      ) c ON c.post_id = p.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3

    `, [userId, itemsPerPage, offset]);

    const posts = result.rows;

    // Cache or fetch 5 comments per post
    const enrichedPosts = await Promise.all(posts.map(async post => {

      const likeCountCache = await client.get(`post:${post.id}:like_count`);
      let like_count;
      if (likeCountCache) {
        like_count = likeCountCache
      }
      else {
        const likeCountResult = await pool.query('SELECT COUNT(*) AS like_count FROM likes WHERE post_id = $1', [post.id]);
        like_count = likeCountResult.rows[0].like_count;
        await client.set(`post:${post.id}:like_count`, like_count);
      }

      const cacheKey = `post_comments:${post.id}_${userId}:first_page`;
      let comments;

      const cached = await client.get(cacheKey);
      if (cached) {
        comments = JSON.parse(cached);
      } else {
        const commentsResult = await pool.query(`
          SELECT 
            comments.id, comments.user_id,comments.content, comments.created_at, comments.likes,
            users.username, users.profile_picture,
            EXISTS (
            SELECT 1 FROM comment_likes 
            WHERE comment_likes.comment_id = comments.id AND comment_likes.user_id = $2
        ) AS liked_by_user
          FROM comments
          JOIN users ON comments.user_id = users.id
          WHERE post_id = $1
          ORDER BY comments.created_at DESC
          LIMIT 5
        `, [post.id, userId]);
        comments = commentsResult.rows;
        await client.set(cacheKey, JSON.stringify(comments), { EX: 3600 });
      }

      return {
        ...post,
        comments,
        like_count
      };
    }));

    return res.status(200).json(enrichedPosts);
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
    res.status(200).json(updatedPost.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: postId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 1. Fetch the post
    const postResult = await pool.query(`
      SELECT 
        posts.*, 
        users.username, 
        users.profile_picture,
        COUNT(likes.user_id) AS like_count,
        EXISTS (
          SELECT 1 FROM likes 
          WHERE likes.post_id = posts.id AND likes.user_id = $1
        ) AS liked_by_user,
        COUNT(comments.id) AS comment_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      LEFT JOIN likes ON likes.post_id = posts.id
      LEFT JOIN comments ON comments.post_id = posts.id
      WHERE posts.id = $2
      GROUP BY posts.id, users.id
    `, [userId, postId]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = postResult.rows[0];

    // 2. Optional: Check if the logged-in user is the owner of the post
    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // 3. Extract Cloudinary public_id from media_url
    const publicIdMatch = post.media_url.match(/\/v\d+\/(.+)\.(jpg|png|jpeg|mp4|webm|mov|avi)$/);
    const publicId = publicIdMatch ? publicIdMatch[1] : null;

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // 4. Delete the post from DB
    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
};

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
    const newPost = await pool.query(
      'INSERT INTO posts (description, media_url, media_type, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [description, result.secure_url, result.resource_type, userId]
    );
    await client.set(`post:${newPost.rows[0].id}:like_count`, 0);

    res.status(201).json(newPost.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const result = await pool.query(`
      SELECT 
        posts.*, 
        users.username, 
        users.profile_picture,
        COUNT(DISTINCT likes.user_id) AS like_count,
        EXISTS (
        SELECT 1 FROM followers 
        WHERE followers.following = posts.user_id AND followers.followed_by = $1
        ) AS is_following,
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
      GROUP BY posts.id, users.id
    `, [userId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 🔥 Fetch first 5 comments from cache or DB
    const postId = id;
    const cachedComments = await client.get(`post_comments:${postId}_${userId}:first_page`);
    let comments;

    if (cachedComments) {
      comments = JSON.parse(cachedComments);
    } else {
      const getPostComments = await pool.query(
        `SELECT comments.id, comments.content, comments.created_at, comments.likes, users.username, users.profile_picture, 
        EXISTS (
            SELECT 1 FROM comment_likes 
            WHERE comment_likes.comment_id = comments.id AND comment_likes.user_id = $2
        ) AS liked_by_user
         FROM comments 
         JOIN users ON comments.user_id = users.id 
         WHERE post_id = $1 
         ORDER BY created_at DESC 
         LIMIT 5`,
        [postId, userId]
      );
      comments = getPostComments.rows;

      await client.set(`post_comments:${postId}_${userId}:first_page`, JSON.stringify(comments), {
        EX: 3600  // Cache for 1 hour
      });
    }

    return res.status(200).json({
      ...result.rows[0],
      comments
    });

  } catch (err) {
    console.error("Error fetching post:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const user = req.params.id;
    const userPosts = await postService.getUserPosts(user);
    res.status(200).json(userPosts)
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Something went wrong' });
  }
}

module.exports = { getPosts, updatePost, deletePost, createPost, getSinglePost, getUserPosts }