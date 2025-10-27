const followRepository = require('../repositories/followRepository.js')
const followUser = async (followerId, followingId) => {

    if(!followerId || !followingId) {
        const error = new Error('Missing Fields');
        error.statusCode = 400
        throw error
    }

    return await followRepository.addFollower(followerId, followingId)

}

const unfollowUser = async (followerId, followingId) => {

    if(!followerId || !followingId) {
        const error = new Error('Missing Fields');
        error.statusCode = 400
        throw error
    }

    return await followRepository.removeFollower(followerId, followingId)

}

module.exports = {followUser, unfollowUser}