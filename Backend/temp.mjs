// scripts/syncToMeilisearch.js
import { MeiliSearch } from 'meilisearch';
import { prisma } from './Database/dbconnect.js';
import 'dotenv/config';

const client = new MeiliSearch({
  host: process.env.MEILI_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY,
});

const BATCH_SIZE = 1000;

// ─── Wait for task ────────────────────────────────────────────
async function waitForTask(taskUid) {
  while (true) {
    const task = await client.tasks.getTask(taskUid);
    if (task.status === 'succeeded') break;
    if (task.status === 'failed') throw new Error(`Task failed: ${task.error.message}`);
    await new Promise((res) => setTimeout(res, 500));
  }
}

// ─── Sync Posts ───────────────────────────────────────────────
async function syncPosts() {
  console.log('\n📄 Syncing posts...');
  let page = 0;
  let total = 0;

  while (true) {
    const posts = await prisma.post.findMany({
      skip: page * BATCH_SIZE,
      take: BATCH_SIZE,
      select: {
        id: true,
        description: true,
        createdAt: true,
        userId: true,
      },
    });

    if (posts.length === 0) break;

    const result = await client.index('posts').addDocuments(posts, { primaryKey: 'id' });
    await waitForTask(result.taskUid);

    total += posts.length;
    console.log(`  ✓ ${total} posts synced`);
    page++;
  }

  console.log(`  ✅ Posts done! Total: ${total}`);
}

// ─── Sync Users ───────────────────────────────────────────────
async function syncUsers() {
  console.log('\n👤 Syncing users...');
  let page = 0;
  let total = 0;

  while (true) {
    const users = await prisma.user.findMany({
      skip: page * BATCH_SIZE,
      take: BATCH_SIZE,
      select: {
        id: true,
        username: true,
        bio: true,
      },
    });

    if (users.length === 0) break;

    const result = await client.index('users').addDocuments(users, { primaryKey: 'id' });
    await waitForTask(result.taskUid);

    total += users.length;
    console.log(`  ✓ ${total} users synced`);
    page++;
  }

  console.log(`  ✅ Users done! Total: ${total}`);
}

// ─── Sync Tags ────────────────────────────────────────────────
async function syncTags() {
  console.log('\n🏷️  Syncing tags...');
  let page = 0;
  let total = 0;

  while (true) {
    const tags = await prisma.tag.findMany({
      skip: page * BATCH_SIZE,
      take: BATCH_SIZE,
      select: {
        id: true,
        name: true,        // adjust to match your schema
      },
    });

    if (tags.length === 0) break;

    const result = await client.index('tags').addDocuments(tags, { primaryKey: 'id' });
    await waitForTask(result.taskUid);

    total += tags.length;
    console.log(`  ✓ ${total} tags synced`);
    page++;
  }

  console.log(`  ✅ Tags done! Total: ${total}`);
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting Meilisearch sync...');

  await syncPosts();
  await syncUsers();
  await syncTags();

  console.log('\n🎉 All synced successfully!');
}

main()
  .catch((err) => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });