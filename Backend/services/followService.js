const followRepository = require('../repositories/followRepository.js')
const { publishToQueue } = require('../queue/producer.js');
const likeRepository = require('../repositories/likeRepository.js');

const followUser = async (followerId, followingId) => {
    if(!followerId || !followingId) {
        const error = new Error('Missing Fields');
        error.statusCode = 400
        throw error
    }

    if(followerId === followingId) {
        const error = new Error('You cannot follow yourself');
        error.statusCode = 400
        throw error
    }

    const result = await followRepository.addFollower(followerId, followingId)

    const actorUsername = await likeRepository.getUsername(followerId) || 'Someone';
    await publishToQueue('notif-queue', {
      userId: followingId,
      actorId: followerId,
      type: 'follow',
      message: `${actorUsername} started following you`,
    });

    return result

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