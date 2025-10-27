const followService = require('../services/followService.js')

const followUser = async (req,res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    await followService.followUser(followerId, followingId)
    res.status(200).json({message: 'User followed successfully'})
}

const unfollowUser = async (req,res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    await followService.unfollowUser(followerId, followingId)
    res.status(200).json({message: 'User unfollowed successfully'})
}

module.exports={followUser, unfollowUser}