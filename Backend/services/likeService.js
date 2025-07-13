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

const getLikes = async (userId, postId, page) => {
  const itemsPerPage = 5;
  const offSet = (page - 1) * itemsPerPage;

  if (!userId) {
    const error = new Error('Unauthorized');
    error.statusCode = 401
    throw error
  }

  const likes = await likeRepository.getLikes(postId, itemsPerPage, offSet);
  if (likes.length === 0) {
    const error = new Error('No likes found for this post');
    error.statusCode = 404
    throw error
  }
  return likes

}

module.exports = {
  likePost, unlikePost, getLikes
}