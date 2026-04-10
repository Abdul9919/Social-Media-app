const likeRepository = require('../repositories/likeRepository');
const { publishToQueue } = require('../queue/producer.js');

const shouldPublishNotification = (recipientId, actorId) => {
  return recipientId != null && actorId != null && recipientId !== actorId;
};

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
  const postOwnerId = await likeRepository.getPostOwner(postId);

  if (shouldPublishNotification(postOwnerId, userId)) {
    // console.log('hehehehe')
    const actorUsername = await likeRepository.getUsername(userId) || 'Someone';
    await publishToQueue('notif-queue', {
      userId: postOwnerId,
      actorId: userId,
      postId: postId,
      type: 'postLike',
      message: `${actorUsername} has liked your post`,
    });
  }

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

const likeComment = async (userId, commentId, postId) => {
  if(!userId){
    const error = new Error('Unauthorized');
    error.statusCode = 401
    console.log(error)
    throw error
  }
  if(!commentId){
    const error = new Error('commentId is missing');
    error.statusCode = 400
    console.log(error)
    throw error
  }

  const result = await likeRepository.likeComment(userId, commentId, postId);
  if (result.liked && shouldPublishNotification(result.commentOwnerId, userId)) {
    const actorUsername = await likeRepository.getUsername(userId) || 'Someone';
    // console.log('heheheh 2')
    await publishToQueue('notif-queue', {
      userId: result.commentOwnerId,
      actorId: userId,
      type: 'commentLike',
      message: `${actorUsername} has liked your comment`,
    });
  }

  return result;
}

module.exports = {
  likePost, unlikePost, getLikes, likeComment
}