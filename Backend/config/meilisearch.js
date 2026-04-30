const { MeiliSearch } = require('meilisearch');
const meilisearchClient = new MeiliSearch({
        host: process.env.MEILI_HOST || 'http://localhost:7700',
        apiKey: process.env.MEILI_MASTER_KEY,
    });

console.log('MeiliSearch client initialized');

module.exports = meilisearchClient; 