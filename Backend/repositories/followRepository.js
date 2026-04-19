const { pool } = require('../Database/dbconnect.js');

const addFollower = async (followerId, followingId) => {

    return await pool.query('INSERT INTO followers (followed_by, following) VALUES ($1, $2)', [followerId, followingId]);

}
const removeFollower = async (followerId, followingId) => {

    return await pool.query('DELETE FROM followers WHERE followed_by=$1 AND following=$2 ', [followerId, followingId]);

}

const getFollowers = async (userId) => {
    const query = `
        SELECT 
            u.id, 
            u.username, 
            u.profile_picture 
        FROM followers f
        JOIN users u ON f.followed_by = u.id
        WHERE f.following = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}

const getFollowing = async (userId) => {
    const query = `
        SELECT 
            u.id, 
            u.username, 
            u.profile_picture 
        FROM followers f
        JOIN users u ON f.following = u.id
        WHERE f.followed_by = $1
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}

module.exports = {addFollower, removeFollower, getFollowers, getFollowing} 