const likeRepository = require('../repositories/likeRepository');

const likePost = async (userId, postId) => {
  if (!userId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    
    throw err;
  }

  const existingLike = await likeRepository.existingLike(postId, userId);
  if (existingLike.length > 0) {
    const err = new Error('Post already liked');
    err.statusCode = 400;
    throw err;
  }
  const like = await likeRepository.likePost(postId, userId);
  return like
};

const unlikePost = async (userId, postId) => {
  return await likeRepository.unlikePost(userId, postId);
};

module.exports = { likePost, unlikePost };

const getLikes = async () => {

}

module.exports = {
    likePost, unlikePost, getLikes
}