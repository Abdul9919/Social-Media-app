const client = require('../config/meilisearch.js');

const searchIndex = (indexName, query, options) => {
  return client.index(indexName).search(query, options);
};

const searchUsers = (query, options) => searchIndex('users', query, options);
const searchPosts = async (query, options) => {
  const results = await client.multiSearch({
    federation: {},
    queries: [
      {
        indexUid: 'posts',
        q: query,
        attributesToSearchOn: ['description'],
      },
      {
        indexUid: 'tags',
        q: query,
        attributesToSearchOn: ['name']
      },
    ],
  })
  return results;
}
const searchTags = (query, options) => searchIndex('tags', query, options);

module.exports = {
  searchUsers,
  searchPosts,
  searchTags,
};
