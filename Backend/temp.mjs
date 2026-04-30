// scripts/syncToMeilisearch.js
import { MeiliSearch } from 'meilisearch';
import { prisma } from './Database/dbconnect.js';
import 'dotenv/config';

const client = new MeiliSearch({
  host: process.env.MEILI_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILI_MASTER_KEY,
});

const BATCH_SIZE = 1000;


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
        // add or remove fields based on your schema
      }

    });
    // console.log(posts)

    if (posts.length === 0) break;

    async function waitForTask(taskUid) {
      while (true) {
        const task = await client.tasks.getTask(taskUid);
        if (task.status === 'succeeded') break;
        if (task.status === 'failed') throw new Error(`Task failed: ${task.error.message}`);
        await new Promise((res) => setTimeout(res, 500));
      }
    }

    // Use it like this
    const result = await client.index('posts').addDocuments(posts, { primaryKey: 'id' });
    await waitForTask(result.taskUid);
    console.log('✓ Posts fully indexed');
    console.log(result)
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
        // ⚠️ Never select: password, token, email (unless you want it searchable)
      },
    });

    if (users.length === 0) break;

    const result = await client.index('users').addDocuments(users);
    total += users.length;
    console.log(`  ✓ ${total} users synced`);
    page++;
  }

  console.log(`  ✅ Users done! Total: ${total}`);
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Starting Meilisearch sync...');

  await syncPosts();
  await syncUsers();

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