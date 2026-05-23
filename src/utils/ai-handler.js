const axios = require('axios');

let activeAICalls = 0;
const MAX_CONCURRENT_AI_CALLS = 2;

function cleanQuery(text) {
  return (text || '')
    .replace(/@goldierill/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function dbGet(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function fetchFullContent(db, sources) {
  const parts = [];
  for (const s of sources) {
    try {
      if (s.type === 'message') {
        const row = await dbGet(db, 'SELECT content FROM messages WHERE id = ? AND is_private = 0', [s.id]);
        if (row && row.content) {
          const content = row.content.length > 8000 ? row.content.substring(0, 8000) + '\n...(long post truncated)' : row.content;
          parts.push(`[Message #${s.id}]\n${content}`);
        }
      } else if (s.type === 'comment') {
        const row = await dbGet(db, 'SELECT text FROM comments WHERE id = ? AND is_deleted = 0', [s.id]);
        if (row && row.text) {
          parts.push(`[Comment #${s.id}]\n${row.text.substring(0, 2000)}`);
        }
      }
    } catch {}
  }
  return parts.join('\n\n---\n\n');
}

async function getAIResponse(messageContent, userComment, ragService, db) {
  const { AI_CHAT_API_URL, AI_CHAT_API_KEY, AI_CHAT_MODEL } = process.env;

  if (!AI_CHAT_API_URL || !AI_CHAT_API_KEY || !AI_CHAT_MODEL) {
    console.error('AI_CHAT env vars not configured.');
    return null;
  }

  if (activeAICalls >= MAX_CONCURRENT_AI_CALLS) {
    console.log(`[AI] Skipping — ${activeAICalls} calls already in progress`);
    return null;
  }

  activeAICalls++;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55000);

  try {
    const truncatedMessage = (messageContent || '').substring(0, 3000);
    const truncatedComment = (userComment || '').substring(0, 1000);

    let ragContext = '';
    if (ragService) {
      try {
        const query = cleanQuery(truncatedComment + ' ' + truncatedMessage);
        if (query && db) {
          const sources = await ragService.findRelevantSourceIds(query);
          if (sources.length > 0) {
            console.log(`[AI] RAG found ${sources.length} sources: ${sources.map(s => `${s.type}#${s.id}`).join(', ')}`);
            ragContext = await fetchFullContent(db, sources);
          }
        }
        if (!ragContext) {
          ragContext = await ragService.buildContext(query);
        }
      } catch (err) {
        console.error('[AI] RAG context failed:', err.message);
      }
    }

    let systemPrompt = `You are GoldieRill, an AI assistant on a public message board.

IMPORTANT RULES:
- Respond in Simplified Chinese.
- "Relevant historical posts" below are PUBLIC posts from this board that users chose to share. They are NOT private data. You MUST use them to answer the user's question.
- When a user asks about something that appears in the historical posts (e.g. their 八字, previous discussions, reports), answer directly using that information. The user is asking about their OWN posts.
- NEVER say you cannot access or do not have the information when it is clearly provided in the historical posts below. Read them carefully and use them.
- Be helpful, insightful, and stay on topic.`;

    if (ragContext) {
      systemPrompt += `\n\nRelevant historical posts from this board:\n${ragContext}`;
    }

    const commentSection = truncatedComment
      ? `Comment mentioning you:\n---\n${truncatedComment}\n---\n`
      : '';

    const userPrompt = `Message:
---
${truncatedMessage}
---

${commentSection}Your response:`;

    const response = await axios.post(
      AI_CHAT_API_URL,
      {
        model: AI_CHAT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_CHAT_API_KEY}`,
        },
        timeout: 60000,
        signal: controller.signal,
        maxContentLength: 2 * 1024 * 1024,
        maxBodyLength: 2 * 1024 * 1024,
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
      console.log(`[AI] Response size: ${content.length} chars`);
      return content.trim().substring(0, 4000);
    } else {
      console.error('Unexpected LLM response structure:', response.data);
      return null;
    }
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
      console.error('[AI] Request aborted due to timeout');
    } else {
      console.error('Error calling LLM API:', error.response ? error.response.data : error.message);
    }
    return null;
  } finally {
    clearTimeout(timer);
    activeAICalls--;
  }
}

module.exports = { getAIResponse };
