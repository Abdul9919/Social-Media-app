const postRepository = require('../repositories/postRepository.js')
const { client } = require('../Database/redis.js');

const getUserPosts = async (user) => {
    if(!user){
        const error = new Error('Unauthorized');
        error.statusCode = 401
        throw error
    }

    const userPosts = await postRepository.getUserPosts(user)

    if(userPosts.length === 0){
        const error = new Error('No posts found for this user');
        error.statusCode = 404
        throw error
    }

    const posts =  await Promise.all(userPosts.map(async (post) => {
        let likeCount;
        const likeCached = await client.get(`post:${post.id}:like_count`);
        if(likeCached){
            likeCount = JSON.parse(likeCached);
        }
        else {
        const likeCount = await postRepository.getLikeCount(post.id);
        await client.set(`post:${post.id}:like_count`, JSON.stringify(likeCount));
      }

        let comments;
        const cacheKey = `post_comments:${post.id}_${user}:first_page`;
        const cached = await client.get(cacheKey);
        if(cached){
            comments = JSON.parse(cached);
        }
        else{
        comments = await postRepository.getPostComments(post.id);
        await client.set(cacheKey, JSON.stringify(comments));
        }
        return await { ...post, comments, likeCount };
    }))
    return await posts;
}


module.exports = {
    getUserPosts
}