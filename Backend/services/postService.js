const postRepository = require('../repositories/postRepository.js')
const { client } = require('../Database/redis.js');

const getUserPosts = async (user) => {
    if(!user){
        const error = new Error('User id is required');
        error.statusCode = 400
        throw error
    }

    const userPosts = await postRepository.getUserPosts(user)

    const posts =  await Promise.all(userPosts.map(async (post) => {
        let likeCount;
        const likeCached = await client.get(`post:${post.post_id}:like_count`);
        if(likeCached){
            likeCount = JSON.parse(likeCached);
        }
        else {
        const likeCount = await postRepository.getLikeCount(post.post_id);
        await client.set(`post:${post.post_id}:like_count`, likeCount);
      }

        let comments;
        const cacheKey = `post_comments:${post.post_id}_${user}:first_page`;
        const cached = await client.get(cacheKey);
        if(cached){
            comments = JSON.parse(cached);
        }
        else{
        comments = await postRepository.getPostComments(post.post_id);
        await client.set(cacheKey, JSON.stringify(comments));
        }
        return await { ...post, comments, likeCount };
    }))
   // console.log(posts)
    return await posts;
}


module.exports = {
    getUserPosts
}