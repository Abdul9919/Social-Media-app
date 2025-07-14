const commentRepository = require('../repositories/commentRepository.js')
const { client } = require('../Database/redis.js');

const getComments = async (userId, postId, page) => {

    if (!userId) {
        const error = new Eroor('Unauthorized');
        error.statusCode = 401
        throw error
    }

    if (!postId) {
        const error = new Eroor('Post is required');
        error.statusCode = 400
        throw error
    }
    
    const itemsPerPage = 5;
    const offSet = (page - 1) * itemsPerPage;

    const comments = await commentRepository.getPostComments(postId, itemsPerPage, offSet);
    const count = await commentRepository.getCommentCount(postId);

    const totalPages = Math.ceil(parseInt(count.count) / itemsPerPage);

    let responseData;
    if (page === 1) {
        const cached = await client.get(`post_comments:${postId}_${userId}:first_page`);
        if (cached) {
            return responseData = { comments: JSON.parse(cached), totalPages };
        }
    }

    responseData = { count: count, comments: comments, totalPages};
    return responseData

}

const createComment = async (userId, postId, content) => {

    if (!userId) {
        const error = new Error('Unauthorized');
        error.statusCode = 401
        throw error
    }
    // Validation
    if (!content) {
        const error = new Error('Content is required');
        error.statusCode = 400
        throw error
    }

    if (!postId || isNaN(postId)) {
        const error = new Error('Valid post id is required');
        error.statusCode = 400
        throw error
    }

    const comment = await commentRepository.createComment(content, userId, postId);
    const cacheKey = `post_comments:${postId}_${userId}:first_page`;
    const cached = await client.get(cacheKey);
    if (cached) {
        const comments = JSON.parse(cached);

        // Add the new comment to the beginning
        comments.unshift(comment);

        // Keep only the latest 5
        const trimmed = comments.slice(0, 5);

        // Set updated array
        await client.set(cacheKey, JSON.stringify(trimmed), { EX: 3600 });
    }
    return comment

}

const updateComment = async () => {

}

const deleteComment = async () => {

}

module.exports = {
    getComments, createComment, updateComment, deleteComment
}