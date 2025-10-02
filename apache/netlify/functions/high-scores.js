const SCORES_LIMIT = 50;
const TOP_LIMIT = 10;

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const scoresPath = process.env.GITHUB_SCORES_PATH || 'scores/high-scores.json';
const token = process.env.GITHUB_TOKEN;

let getStoreFn;
try {
  ({ getStore: getStoreFn } = require('@netlify/blobs'));
} catch (error) {
  getStoreFn = null;
}

const blobStoreName = process.env.NETLIFY_SCORES_STORE || 'high-scores';
const blobStoreKey = process.env.NETLIFY_SCORES_KEY || 'scores.json';

let blobStoreCache;

function ensureBlobStore() {
  if (!getStoreFn) {
    return null;
  }
  if (blobStoreCache !== undefined) {
    return blobStoreCache;
  }
  try {
    blobStoreCache = getStoreFn({ name: blobStoreName });
  } catch (err) {
    console.warn('Netlify Blobs store unavailable:', err.message);
    blobStoreCache = null;
  }
  return blobStoreCache;
}

async function fetchBlobScores() {
  const store = ensureBlobStore();
  if (!store) {
    return null;
  }
  try {
    const result = await store.getWithMetadata(blobStoreKey, { type: 'json' });
    if (!result || result.data == null) {
      return { entries: [], etag: result?.etag };
    }
    const data = result.data;
    const entries = Array.isArray(data?.entries)
      ? data.entries
      : Array.isArray(data)
      ? data
      : [];
    return { entries, etag: result.etag };
  } catch (err) {
    console.error('Netlify Blobs read failed:', err);
    return null;
  }
}

async function writeBlobScores(entries) {
  const store = ensureBlobStore();
  if (!store) {
    return false;
  }
  try {
    await store.setJSON(
      blobStoreKey,
      { entries, updatedAt: new Date().toISOString() }
    );
    return true;
  } catch (err) {
    console.error('Netlify Blobs write failed:', err);
    return false;
  }
}

async function readLocalScores() {
  try {
    const fs = await import('fs/promises');
    const pathModule = await import('path');
    const localPath = pathModule.resolve(__dirname, '../../', scoresPath);
    const data = await fs.readFile(localPath, 'utf8');
    const parsed = JSON.parse(data);
    const entries = Array.isArray(parsed?.entries)
      ? parsed.entries
      : Array.isArray(parsed)
      ? parsed
      : [];
    return { entries };
  } catch (err) {
    return { entries: [] };
  }
}

async function writeLocalScores(entries) {
  try {
    const fs = await import('fs/promises');
    const pathModule = await import('path');
    const localPath = pathModule.resolve(__dirname, '../../', scoresPath);
    await fs.mkdir(pathModule.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, JSON.stringify(entries, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Local score write failed:', err);
    return false;
  }
}

async function fetchScores() {
  if (!token || !owner || !repo) {
    const blobScores = await fetchBlobScores();
    if (blobScores) {
      return blobScores;
    }
    return readLocalScores();
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${scoresPath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'high-scores-function'
    }
  });

  if (res.status === 404) {
    return { entries: [], sha: null };
  }

  if (!res.ok) {
    throw new Error(`GitHub fetch failed: ${res.status}`);
  }

  const json = await res.json();
  const content = Buffer.from(json.content, 'base64').toString('utf8');
  const parsed = JSON.parse(content);
  const entries = Array.isArray(parsed?.entries)
    ? parsed.entries
    : Array.isArray(parsed)
    ? parsed
    : [];
  return { entries, sha: json.sha };
}

async function writeScores({ entries, sha }) {
  if (token && owner && repo) {
    const body = {
      message: 'Update high scores',
      content: Buffer.from(JSON.stringify(entries, null, 2)).toString('base64')
    };

    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${scoresPath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'high-scores-function'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`GitHub write failed: ${res.status}`);
    }

    return true;
  }

  if (await writeBlobScores(entries)) {
    return true;
  }

  return writeLocalScores(entries);
}

function normaliseName(name) {
  return (name || 'AAA').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 3) || 'AAA';
}

exports.handler = async function(event) {
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
      const res = await fetchScores();
      const entries = Array.isArray(res.entries || res) ? (res.entries || res) : [];
      const top = entries
        .slice()
        .sort((a, b) => b.score - a.score)
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

      const store = await fetchScores();
      const entries = Array.isArray(store.entries) ? store.entries : store;
      entries.push({ name, score, timestamp });
      entries.sort((a, b) => b.score - a.score);
      const trimmed = entries.slice(0, SCORES_LIMIT);

      await writeScores({ entries: trimmed, sha: store.sha });

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
