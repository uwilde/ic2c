const SCORES_LIMIT = 50;
const TOP_LIMIT = 10;
const STORE_NAME =
  process.env.NETLIFY_SCORES_STORE ||
  process.env.HIGH_SCORE_STORE ||
  process.env.SCORES_STORE ||
  'apache-adventure-high-scores';
const STORE_KEY =
  process.env.NETLIFY_SCORES_KEY ||
  process.env.HIGH_SCORE_KEY ||
  process.env.SCORES_KEY ||
  'scores.json';
const path = require('path');

const localScoresPath = path.resolve(__dirname, '../../scores/high-scores.json');

let storePromise = null;
async function getBlobStore() {
  if (storePromise) {
    return storePromise;
  }
  try {
    storePromise = import('@netlify/blobs').then(({ getStore }) =>
      getStore({ name: STORE_NAME, persist: true })
    );
    return storePromise;
  } catch (err) {
    storePromise = Promise.resolve(null);
    return storePromise;
  }
}

function extractEntries(data) {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.entries)) {
    return data.entries;
  }
  if (Array.isArray(data.scores)) {
    return data.scores;
  }
  return [];
}

async function readLocalFallback() {
  try {
    const fs = await import('fs/promises');
    const data = await fs.readFile(localScoresPath, 'utf8');
    return extractEntries(JSON.parse(data));
  } catch (err) {
    return [];
  }
}

async function writeLocalFallback(entries) {
  try {
    const fs = await import('fs/promises');
    await fs.mkdir(path.dirname(localScoresPath), { recursive: true });
    await fs.writeFile(localScoresPath, JSON.stringify(entries, null, 2), 'utf8');
  } catch (err) {
    // ignore in production
  }
}

async function fetchScores() {
  try {
    const store = await getBlobStore();
    if (store) {
      const data = await store.get(STORE_KEY, { type: 'json' });
      if (data != null) {
        return extractEntries(data);
      }
    }
  } catch (err) {
    // fall through to local fallback
  }
  return readLocalFallback();
}

async function writeScores(entries) {
  try {
    const store = await getBlobStore();
    if (store) {
      const serialised = Array.isArray(entries) ? entries : [];
      const metadata = { updatedAt: new Date().toISOString() };
      if (typeof store.setJSON === 'function') {
        await store.setJSON(STORE_KEY, serialised, { metadata });
      } else {
        await store.set(STORE_KEY, JSON.stringify(serialised), { metadata });
      }
      return;
    }
  } catch (err) {
    if (process.env.NETLIFY === 'true') {
      throw err;
    }
  }
  await writeLocalFallback(entries);
}

function normaliseName(name) {
  return (name || 'AAA').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 3) || 'AAA';
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const entries = await fetchScores();
      const top = entries
        .slice()
        .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
        .slice(0, TOP_LIMIT);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scores: top })
      };
    }

    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      const name = normaliseName(payload.name);
      const score = Number(payload.score) || 0;
      const timestamp = new Date().toISOString();

      const entries = await fetchScores();
      entries.push({ name, score, timestamp });
      entries.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
      const trimmed = entries.slice(0, SCORES_LIMIT);

      await writeScores(trimmed);

      const top = trimmed.slice(0, TOP_LIMIT);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ok: true, scores: top })
      };
    }

    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Method Not Allowed'
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
