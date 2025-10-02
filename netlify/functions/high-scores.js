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

let blobsModulePromise = null;
async function loadBlobsModule() {
  if (!blobsModulePromise) {
    blobsModulePromise = import('@netlify/blobs');
  }
  return blobsModulePromise;
}

async function getBlobStore(event) {
  let initError = null;
  let connectError = null;

  try {
    const module = await loadBlobsModule();
    const { getStore, connectLambda } = module;

    if (typeof connectLambda === 'function' && event) {
      try {
        connectLambda(event);
      } catch (err) {
        connectError = err;
      }
    }

    if (typeof getStore !== 'function') {
      initError = new Error('getStore is not available in @netlify/blobs');
      return { store: null, initError, connectError };
    }

    const store = getStore({ name: STORE_NAME, persist: true });
    return { store, initError, connectError };
  } catch (err) {
    initError = err;
    return { store: null, initError, connectError };
  }
}

function safeJsonParse(value) {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
}

function toUtf8(value) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Buffer.isBuffer(value)) {
    return value.toString('utf8');
  }
  if (value instanceof Uint8Array) {
    return Buffer.from(value).toString('utf8');
  }
  return String(value);
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

async function readStoreEntries(store, options = {}) {
  const result = { entries: [], raw: undefined, error: null };
  if (!store) {
    return result;
  }
  try {
    const data = await store.get(STORE_KEY, { type: 'json' });
    if (options.includeRaw) {
      result.raw = data;
    }
    result.entries = extractEntries(data);
    return result;
  } catch (err) {
    result.error = err.message || String(err);
    try {
      const text = await store.get(STORE_KEY, { type: 'text' });
      const parsed = safeJsonParse(text);
      if (options.includeRaw) {
        result.raw = text;
      }
      if (parsed) {
        result.entries = extractEntries(parsed);
        result.error = null;
        return result;
      }
    } catch (innerErr) {
      result.error = [result.error, innerErr.message || String(innerErr)].join('; ');
      if (options.includeRaw) {
        try {
          const rawBytes = await store.get(STORE_KEY);
          result.raw = toUtf8(rawBytes);
        } catch (rawErr) {
          // ignore
        }
      }
    }
  }
  return result;
}

async function fetchScores(event, debugDetails) {
  try {
    const { store, initError, connectError } = await getBlobStore(event);
    if (debugDetails) {
      debugDetails.storeInitError = initError ? String(initError) : null;
      debugDetails.storeConnectError = connectError ? String(connectError) : null;
      debugDetails.storeAvailable = Boolean(store);
    }
    if (store) {
      const { entries, error } = await readStoreEntries(store);
      if (debugDetails) {
        debugDetails.storeReadError = error;
        debugDetails.storeEntriesCount = entries.length;
      }
      if (!error || entries.length) {
        return entries;
      }
    }
  } catch (err) {
    if (debugDetails) {
      debugDetails.fetchError = err.message || String(err);
    }
  }
  const fallback = await readLocalFallback();
  if (debugDetails) {
    debugDetails.usedFallback = true;
    debugDetails.fallbackEntriesCount = fallback.length;
  }
  return fallback;
}

async function writeScores(entries, event, debugDetails) {
  const { store, initError, connectError } = await getBlobStore(event);
  if (debugDetails) {
    if (initError) {
      debugDetails.storeWriteInitError = String(initError);
    }
    if (connectError) {
      debugDetails.storeWriteConnectError = String(connectError);
    }
    debugDetails.storeWriteAvailable = Boolean(store);
  }
  try {
    if (store) {
      const serialised = Array.isArray(entries) ? entries : [];
      const metadata = { updatedAt: new Date().toISOString() };
      if (typeof store.setJSON === 'function') {
        await store.setJSON(STORE_KEY, serialised, { metadata });
      } else {
        await store.set(STORE_KEY, JSON.stringify(serialised), { metadata });
      }
      if (debugDetails) {
        debugDetails.storeWrite = 'ok';
      }
      return;
    }
  } catch (err) {
    if (debugDetails) {
      debugDetails.storeWriteError = err.message || String(err);
    }
    if (process.env.NETLIFY === 'true') {
      throw err;
    }
  }
  await writeLocalFallback(entries);
}

function normaliseName(name) {
  return (name || 'AAA').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 3) || 'AAA';
}

exports.handler = async function handler(event, context) {
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

  const params = event.queryStringParameters || {};
  const debugMode = params.debug === '1';
  const debugDetails = debugMode ? {} : null;

  try {
    if (event.httpMethod === 'GET') {
      if (debugMode) {
        const { store, initError, connectError } = await getBlobStore(event);
        const result = await readStoreEntries(store, { includeRaw: true });
        const localEntries = await readLocalFallback();
        const payload = {
          storeName: STORE_NAME,
          storeKey: STORE_KEY,
          storeAvailable: Boolean(store),
          storeInitError: initError ? String(initError) : null,
          storeConnectError: connectError ? String(connectError) : null,
          storeReadError: result.error,
          storeEntries: result.entries,
          storeRaw: result.raw,
          fallbackEntries: localEntries
        };
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        };
      }

      const entries = await fetchScores(event, debugDetails);
      const top = entries
        .slice()
        .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
        .slice(0, TOP_LIMIT);
      if (debugDetails) {
        debugDetails.responseEntries = top;
      }
      const payload = debugDetails ? { scores: top, debug: debugDetails } : { scores: top };
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      };
    }

    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      const name = normaliseName(payload.name);
      const score = Number(payload.score) || 0;
      const timestamp = new Date().toISOString();

      const entries = await fetchScores(event, debugDetails);
      entries.push({ name, score, timestamp });
      entries.sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0));
      const trimmed = entries.slice(0, SCORES_LIMIT);

      await writeScores(trimmed, event, debugDetails);

      const top = trimmed.slice(0, TOP_LIMIT);
      if (debugDetails) {
        debugDetails.responseEntries = top;
      }
      const responsePayload = debugDetails
        ? { ok: true, scores: top, debug: debugDetails }
        : { ok: true, scores: top };
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responsePayload)
      };
    }

    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Method Not Allowed'
    };
  } catch (error) {
    const payload = debugDetails
      ? { error: error.message, debug: debugDetails }
      : { error: error.message };
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    };
  }
};
