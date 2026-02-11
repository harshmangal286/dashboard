const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined)?.trim();
const API_BASE = BACKEND_ORIGIN ? `${trimTrailingSlash(BACKEND_ORIGIN)}/api/v1` : '';
const HEALTH_BASE = BACKEND_ORIGIN ? trimTrailingSlash(BACKEND_ORIGIN) : '';
const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN as string | undefined;

const authHeaders = () => {
  if (!BACKEND_TOKEN) return {};
  return { Authorization: `Bearer ${BACKEND_TOKEN}` };
};

const ensureBackendOrigin = () => {
  if (!BACKEND_ORIGIN) {
    throw new Error('Backend URL not configured. Set VITE_BACKEND_ORIGIN in environment variables.');
  }
};

export const checkBackendHealth = async () => {
  if (!BACKEND_ORIGIN) return false;

  try {
    const res = await fetch(`${HEALTH_BASE}/health`, { mode: 'cors', cache: 'no-cache' });
    return res.ok;
  } catch {
    return false;
  }
};

export const getBackendLogs = async () => {
  return [];
};

export const runBotTask = async (_data: unknown) => {
  throw new Error('Bridge execution disabled: switch to backend APIs');
};

export const optimizeImage = async (base64: string) => {
  ensureBackendOrigin();

  const res = await fetch(`${HEALTH_BASE}/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: base64 }),
    mode: 'cors'
  });

  if (!res.ok) throw new Error('Image optimization failed');
  return await res.json();
};

export const ingestListing = async (payload: unknown) => {
  ensureBackendOrigin();

  const res = await fetch(`${API_BASE}/listings/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    mode: 'cors'
  });

  if (!res.ok) throw new Error('Ingest failed');
  return await res.json();
};

export const publishListing = async (listingId: number) => {
  ensureBackendOrigin();

  const res = await fetch(`${API_BASE}/listings/${listingId}/publish`, {
    method: 'POST',
    headers: { ...authHeaders() },
    mode: 'cors'
  });

  if (!res.ok) throw new Error('Publish start failed');
  return await res.json();
};

export const getPublishStatus = async (taskId: string) => {
  ensureBackendOrigin();

  const res = await fetch(`${API_BASE}/listings/publish/status/${taskId}`, {
    headers: { ...authHeaders() },
    mode: 'cors'
  });

  if (!res.ok) throw new Error('Publish status failed');
  return await res.json();
};
