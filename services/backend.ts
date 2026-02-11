
const API_BASE = 'http://127.0.0.1:8000/api/v1';
const HEALTH_BASE = 'http://127.0.0.1:8000';
const BACKEND_TOKEN = import.meta.env.VITE_BACKEND_TOKEN as string | undefined;

const authHeaders = () => {
  if (!BACKEND_TOKEN) return {};
  return { Authorization: `Bearer ${BACKEND_TOKEN}` };
};

export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${HEALTH_BASE}/health`, { mode: 'cors', cache: 'no-cache' });
    return res.ok;
  } catch { return false; }
};

export const getBackendLogs = async () => {
  return [];
};

export const runBotTask = async (data: any) => {
  throw new Error("Bridge execution disabled: switch to backend APIs");
};

export const optimizeImage = async (base64: string) => {
  const res = await fetch(`http://127.0.0.1:8000/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: base64 }),
    mode: 'cors'
  });
  return await res.json();
};

export const ingestListing = async (payload: any) => {
  const res = await fetch(`${API_BASE}/listings/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
    mode: 'cors'
  });
  if (!res.ok) throw new Error("Ingest failed");
  return await res.json();
};

export const publishListing = async (listingId: number) => {
  const res = await fetch(`${API_BASE}/listings/${listingId}/publish`, {
    method: 'POST',
    headers: { ...authHeaders() },
    mode: 'cors'
  });
  if (!res.ok) throw new Error("Publish start failed");
  return await res.json();
};

export const getPublishStatus = async (taskId: string) => {
  const res = await fetch(`${API_BASE}/listings/publish/status/${taskId}`, {
    headers: { ...authHeaders() },
    mode: 'cors'
  });
  if (!res.ok) throw new Error("Publish status failed");
  return await res.json();
};
