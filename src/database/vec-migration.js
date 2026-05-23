const createRAGService = require('../utils/rag-service');

function dbAll(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function logMem(label) {
  const m = process.memoryUsage();
  console.log(`[Mem-${label}] RSS: ${(m.rss / 1024 / 1024).toFixed(1)}MB | Heap: ${(m.heapUsed / 1024 / 1024).toFixed(1)}MB / ${(m.heapTotal / 1024 / 1024).toFixed(1)}MB`);
}

async function runMigration(db) {
  logMem('pre-migration');
  const ragService = createRAGService();

  console.log('[Migration] Starting RAG reindex (all messages)...');

  await migrateMessages(db, ragService);
  await migrateComments(db, ragService);

  logMem('post-migration');
  console.log('[Migration] Completed.');
}

async function migrateMessages(db, ragService) {
  const messages = await dbAll(db, 'SELECT id, content FROM messages WHERE is_private = 0', []);
  console.log(`[Migration] ${messages.length} messages to index`);
  logMem('messages-queried');

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    logMem(`msg-${msg.id}-before`);
    try {
      await ragService.indexContent('message', msg.id, msg.content);
    } catch (err) {
      console.error(`[Migration] Error message #${msg.id}: ${err.message}`);
    }
    logMem(`msg-${msg.id}-after`);
    if (i < messages.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function migrateComments(db, ragService) {
  const comments = await dbAll(db, 'SELECT id, text FROM comments WHERE is_deleted = 0', []);
  console.log(`[Migration] ${comments.length} comments to index`);
  logMem('comments-queried');

  for (let i = 0; i < comments.length; i++) {
    const c = comments[i];
    try {
      await ragService.indexContent('comment', c.id, c.text);
    } catch (err) {
      console.error(`[Migration] Error comment #${c.id}: ${err.message}`);
    }
    if (i < comments.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

module.exports = runMigration;
