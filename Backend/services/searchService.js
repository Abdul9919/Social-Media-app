const searchRepository = require('../repositories/searchRepository.js');
const postRepository = require('../repositories/postRepository.js');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const resolveTotalHits = (searchResult) => {
  return searchResult.estimatedTotalHits ?? searchResult.nbHits ?? 0;
};

const searchAll = async (query) => {
  const limit = 5;
  const [userSearch, postSearch, tagSearch] = await Promise.all([
    searchRepository.searchUsers(query, { limit }),
    searchRepository.searchPosts(query, { limit }),
    searchRepository.searchTags(query, { limit }),
  ]);

  return {
    query,
    page: 1,
    limit,
    total:
      resolveTotalHits(userSearch) +
      resolveTotalHits(postSearch) +
      resolveTotalHits(tagSearch),
    results: {
      users: userSearch.hits || [],
      posts: postSearch.hits || [],
      tags: tagSearch.hits || [],
    },
  };
};

const searchUsers = async (query, page, limit) => {
  const resolvedPage = parsePositiveInt(page, 1);
  const resolvedLimit = parsePositiveInt(limit, 10);
  const offset = (resolvedPage - 1) * resolvedLimit;

  const searchResult = await searchRepository.searchUsers(query, {
    limit: resolvedLimit,
    offset,
    attributesToHighlight: ['username', 'bio'],
  });

  return {
    query,
    page: resolvedPage,
    limit: resolvedLimit,
    total: resolveTotalHits(searchResult),
    results: searchResult.hits || [],
  };
};

const searchPosts = async (query, tag, page, limit) => {
  // const resolvedPage = parsePositiveInt(page, 1);
  // const resolvedLimit = parsePositiveInt(limit, 10);
  // const offset = (resolvedPage - 1) * resolvedLimit;
  // const searchQuery = [query, tag].filter(Boolean).join(' ');

  // const searchResult = await searchRepository.searchPosts(searchQuery, {
  //   limit: resolvedLimit,
  //   offset,
  //   attributesToHighlight: ['description'],
  // });
  const posts = await searchRepository.searchPosts(query, {
      attributesToSearchOn: ['description']
  });
  const tags = posts.hits.filter(e => e._federation.indexUid === 'tags');
  const postsFromTags = await postRepository.getPostsByTagNames(tags);
  // const tags = await searchRepository.searchTags(tag, {
  //     attributesToSearchOn: ['name']
  // });
  const allPosts = [...postsFromTags, ...posts.hits.filter(e => e._federation.indexUid === 'posts')];
  const deduplicatedPosts = Array.from(new Set(allPosts.map(p => p.id))).map(id => {
    return allPosts.find(p => p.id === id);
  });
  // return {
  //   query,
  //   page: resolvedPage,
  //   limit: resolvedLimit,
  //   total: resolveTotalHits(searchResult),
  //   results: searchResult.hits || [],
  // };
  return {
    results: allPosts || [],
  }
};

module.exports = {
  searchAll,
  searchUsers,
  searchPosts,
};
