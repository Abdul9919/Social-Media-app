const followService = require('../services/followService.js')

const followUser = async (req,res) => {
    // console.log('follow user controller')
    const followerId = req.user.id;
    const followingId = req.params.id;
    // console.log('following', followingId)
    await followService.followUser(followerId, followingId)
    res.status(200).json({message: 'User followed successfully'})
}
    
const getFollowers = async (req,res) => {
    const userId = req.params.id;
    const followers = await followService.getFollowers(userId);
    res.status(200).json({followers});
}
const getFollowing = async (req,res) => {
    const {userId} = req.query;
    const following = await followService.getFollowing(userId);
    res.status(200).json({following});
}

const unfollowUser = async (req,res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    await followService.unfollowUser(followerId, followingId)
    res.status(200).json({message: 'User unfollowed successfully'})
}

module.exports={followUser, unfollowUser, getFollowers, getFollowing}