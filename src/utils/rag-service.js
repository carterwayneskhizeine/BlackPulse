const axios = require('axios');
const { embed } = require('./embedding');
const { chunkText } = require('./chunker');

function createRAGService() {
  const collectionName = process.env.QDRANT_COLLECTION || 'hyperboard';
  const dimension = parseInt(process.env.EMBEDDING_DIMENSION) || 2560;

  let baseUrl = null;
  let ready = false;

  async function findBaseUrl() {
    if (baseUrl) return baseUrl;

    const urls = [
      process.env.QDRANT_URL || 'http://qdrant:6333',
      'http://hyper-board-qdrant:6333',
    ];

    for (const url of urls) {
      try {
        await axios.get(`${url}/collections`, { timeout: 5000 });
        baseUrl = url;
        console.log(`[RAG] Found Qdrant at ${url}`);
        break;
      } catch (err) {
        console.error(`[RAG] Probe ${url}: ${err.message}`);
      }
    }

    return baseUrl;
  }

  async function ensureCollection() {
    if (ready) return true;

    const url = await findBaseUrl();
    if (!url) return false;

    try {
      const res = await axios.get(`${url}/collections/${collectionName}`, { timeout: 5000 });
      if (res.data && res.data.status === 'ok') {
        ready = true;
        console.log(`[RAG] Collection "${collectionName}" exists.`);
        return true;
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          await axios.put(
            `${url}/collections/${collectionName}`,
            {
              vectors: { size: dimension, distance: 'Cosine' },
              optimizers_config: { indexing_threshold: 20000 },
            },
            { timeout: 10000, maxContentLength: 1024 * 1024 }
          );
          ready = true;
          console.log(`[RAG] Created collection "${collectionName}" (dim=${dimension}).`);
          return true;
        } catch (createErr) {
          console.error(`[RAG] Create collection failed: ${createErr.message}`);
          return false;
        }
      }
      console.error(`[RAG] Check collection failed: ${err.message}`);
      return false;
    }
  }

  function sampleText(text, maxLen = 2000) {
    if (text.length <= maxLen) return text;
    const half = Math.floor(maxLen / 2);
    return text.substring(0, half) + '\n...\n' + text.substring(text.length - half);
  }

  function stripMention(text) {
    return (text || '').replace(/@goldierill/gi, '').replace(/@rag/gi, '').replace(/\s+/g, ' ').trim();
  }

  async function indexContent(sourceType, sourceId, text) {
    try {
      if (!(await ensureCollection())) return;

      await removeContent(sourceType, sourceId);

      const cleaned = stripMention(text);
      if (!cleaned) return;

      const sampled = sampleText(cleaned);
      const chunks = chunkText(sampled);
      if (chunks.length === 0) return;

      for (let i = 0; i < chunks.length; i++) {
        const vector = await embed(chunks[i]);
        const points = [{
          id: crypto.randomUUID(),
          vector,
          payload: {
            source_type: sourceType,
            source_id: sourceId,
            chunk_index: i,
            chunk_text: chunks[i],
          },
        }];

        await axios.put(
          `${baseUrl}/collections/${collectionName}/points`,
          { points },
          { timeout: 30000, maxContentLength: 2 * 1024 * 1024 }
        );
      }

      console.log(`[RAG] Indexed ${chunks.length} chunks for ${sourceType} #${sourceId}`);
    } catch (err) {
      console.error(`[RAG] Error indexing ${sourceType} #${sourceId}: ${err.message}`);
    }
  }

  async function removeContent(sourceType, sourceId) {
    try {
      if (!(await ensureCollection())) return;

      await axios.post(
        `${baseUrl}/collections/${collectionName}/points/delete`,
        {
          filter: {
            must: [
              { key: 'source_type', match: { value: sourceType } },
              { key: 'source_id', match: { value: sourceId } },
            ],
          },
        },
        { timeout: 10000 }
      );
    } catch (err) {
      console.error(`[RAG] Error removing ${sourceType} #${sourceId}: ${err.message}`);
    }
  }

  async function search(query, topK = 5) {
    try {
      if (!(await ensureCollection())) return [];

      const vector = await embed(query);

      const res = await axios.post(
        `${baseUrl}/collections/${collectionName}/points/search`,
        {
          vector,
          limit: topK,
          with_payload: true,
        },
        { timeout: 15000 }
      );

      return (res.data.result || []).map((r) => ({
        sourceType: r.payload.source_type,
        sourceId: r.payload.source_id,
        chunkText: r.payload.chunk_text,
        score: r.score,
      }));
    } catch (err) {
      console.error(`[RAG] Search error: ${err.message}`);
      return [];
    }
  }

  async function searchMessageIds(query, topK = 10) {
    const results = await search(query, topK * 2);
    const seen = new Set();
    const ids = [];
    for (const r of results) {
      if (r.sourceType === 'message' && !seen.has(r.sourceId)) {
        seen.add(r.sourceId);
        ids.push(r.sourceId);
      }
      if (ids.length >= topK) break;
    }
    return ids;
  }

  async function findRelevantSourceIds(query, topK = 5) {
    const results = await search(query, topK * 2);
    const seen = new Set();
    const sources = [];
    for (const r of results) {
      const key = `${r.sourceType}#${r.sourceId}`;
      if (!seen.has(key)) {
        seen.add(key);
        sources.push({ type: r.sourceType, id: r.sourceId, score: r.score });
      }
      if (sources.length >= topK) break;
    }
    return sources;
  }

  async function buildContext(query, topK = 5) {
    const results = await search(query, topK);
    if (results.length === 0) {
      console.log(`[RAG] No results for query: "${query.substring(0, 50)}"`);
      return '';
    }

    const seen = new Set();
    const parts = [];
    for (const r of results) {
      const key = `${r.sourceType}#${r.sourceId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      parts.push(`(${r.sourceType} #${r.sourceId}, score=${r.score.toFixed(3)})\n${r.chunkText}`);
    }

    let context = parts.join('\n---\n');
    if (context.length > 4000) {
      context = context.substring(0, 4000) + '\n...(truncated)';
    }
    console.log(`[RAG] Context: ${results.length} results, ${context.length} chars`);
    return context;
  }

  return { indexContent, removeContent, search, searchMessageIds, buildContext, findRelevantSourceIds };
}

module.exports = createRAGService;
