const SCORES_LIMIT = 50;
const TOP_LIMIT = 10;

const owner = process.env.GITHUB_OWNER;
const repo = process.env.GITHUB_REPO;
const scoresPath = process.env.GITHUB_SCORES_PATH || 'scores/high-scores.json';
const token = process.env.GITHUB_TOKEN;

async function fetchScores() {
  if (!token || !owner || !repo) {
    try {
      const fs = await import('fs/promises');
      const pathModule = await import('path');
      const localPath = pathModule.resolve(__dirname, '../../', scoresPath);
      const data = await fs.readFile(localPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${scoresPath}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });
  if (!res.ok) {
    throw new Error(`GitHub fetch failed: ${res.status}`);
  }
  const json = await res.json();
  const content = Buffer.from(json.content, 'base64').toString('utf8');
  return { entries: JSON.parse(content), sha: json.sha };
}

async function writeScores({ entries, sha }) {
  if (!token || !owner || !repo) {
    return false;
  }
  const body = {
    message: 'Update high scores',
    content: Buffer.from(JSON.stringify(entries, null, 2)).toString('base64'),
    sha
  };
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${scoresPath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`GitHub write failed: ${res.status}`);
  }
  return true;
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

      if (token && owner && repo) {
        await writeScores({ entries: trimmed, sha: store.sha });
      }

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
