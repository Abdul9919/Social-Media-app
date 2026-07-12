const searchService = require('../services/searchService.js');

const searchAll = async (req, res) => {
  const query = req.query.q?.toString() || '';

  try {
    const response = await searchService.searchAll(query);
    return res.status(200).json(response);
  } catch (error) {
    console.error('searchAll error:', error);
    return res.status(500).json({
      query,
      page: 1,
      limit: 5,
      total: 0,
      results: { users: [], posts: [], tags: [] },
      message: 'Internal server error',
    });
  }
};

const searchUsers = async (req, res) => {
  const query = req.query.q?.toString() || '';
  const page = req.query.page;
  const limit = req.query.limit;

  try {
    const response = await searchService.searchUsers(query, page, limit);
    return res.status(200).json(response);
  } catch (error) {
    console.error('searchUsers error:', error);
    return res.status(500).json({
      query,
      page: Number.parseInt(page, 10) || 1,
      limit: Number.parseInt(limit, 10) || 10,
      total: 0,
      results: [],
      message: 'Internal server error',
    });
  }
};

const searchPosts = async (req, res) => {
  const query = req.query.q?.toString() || '';
  const tag = req.query.tag?.toString();
  const page = req.query.page;
  const limit = req.query.limit;

  try {
    const response = await searchService.searchPosts(query, tag, page, limit);
    return res.status(200).json(response);
  } catch (error) {
    console.error('searchPosts error:', error);
    return res.status(500).json({
      query,
      page: Number.parseInt(page, 10) || 1,
      limit: Number.parseInt(limit, 10) || 10,
      total: 0,
      results: [],
      message: 'Internal server error',
    });
  }
};

module.exports = {
  searchAll,
  searchUsers,
  searchPosts,
};
