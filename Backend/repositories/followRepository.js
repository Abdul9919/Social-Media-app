const { pool } = require('../Database/dbconnect.js');

const addFollower = async (followerId, followingId) => {

    return await pool.query('INSERT INTO followers (followed_by, following) VALUES ($1, $2)', [followerId, followingId]);

}
const removeFollower = async (followerId, followingId) => {

    return await pool.query('DELETE FROM followers WHERE followed_by=$1 AND following=$2 ', [followerId, followingId]);

}

module.exports = {addFollower, removeFollower}