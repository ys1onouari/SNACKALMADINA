const TIMEOUT_MS = 10000;

function sendJson(res, statusCode, data) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
  };
  if (statusCode === 405) {
    headers['Allow'] = 'GET';
  }
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}

function formatTimestamp() {
  return new Date().toISOString();
}

function extractProjectRef(supabaseUrl) {
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

export default async function handler(req, res) {
  const start = Date.now();

  if (req.method !== 'GET') {
    console.warn(`[api/ping] Rejected ${req.method} — method not allowed`);
    return sendJson(res, 405, {
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 405,
      latency: 0,
      timestamp: formatTimestamp(),
      error: `Method ${req.method} not allowed`,
    });
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[api/ping] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return sendJson(res, 500, {
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 500,
      latency: 0,
      timestamp: formatTimestamp(),
      error: 'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables',
    });
  }

  const projectRef = extractProjectRef(SUPABASE_URL);

  console.log('[api/ping] Starting — GET /auth/v1/health');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      console.log(`[api/ping] Completed — ${response.status} in ${latency}ms`);
      return sendJson(res, 200, {
        ok: true,
        service: 'supabase',
        status: 'reachable',
        httpStatus: response.status,
        latency,
        timestamp: formatTimestamp(),
        project: projectRef,
      });
    }

    console.warn(`[api/ping] Failed — HTTP ${response.status} in ${latency}ms`);
    return sendJson(res, 503, {
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 503,
      latency,
      timestamp: formatTimestamp(),
      error: `Supabase returned HTTP ${response.status}`,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (error.name === 'AbortError') {
      console.warn(`[api/ping] Timeout — ${TIMEOUT_MS}ms exceeded`);
      return sendJson(res, 503, {
        ok: false,
        service: 'supabase',
        status: 'timeout',
        httpStatus: 503,
        latency: TIMEOUT_MS,
        timestamp: formatTimestamp(),
        error: `Request timed out after ${TIMEOUT_MS}ms`,
      });
    }

    console.error(`[api/ping] Error — ${error.message} in ${latency}ms`);
    return sendJson(res, 503, {
      ok: false,
      service: 'supabase',
      status: 'unreachable',
      httpStatus: 503,
      latency,
      timestamp: formatTimestamp(),
      error: error.message,
    });
  }
}
