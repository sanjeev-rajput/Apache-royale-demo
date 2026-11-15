const statuses = new Map();
const STATUS_TTL_MS = 5 * 60 * 1000;

export function setAgentLlmStatus(requestId, status) {
  if (!requestId) return;
  statuses.set(String(requestId), { ...status, updatedAt: Date.now() });
}

export function getAgentLlmStatus(requestId) {
  const key = String(requestId || "");
  const status = statuses.get(key);
  if (!status) return null;
  if (Date.now() - status.updatedAt > STATUS_TTL_MS) {
    statuses.delete(key);
    return null;
  }
  return status;
}

export function clearAgentLlmStatus(requestId) {
  statuses.delete(String(requestId || ""));
}

setInterval(() => {
  const now = Date.now();
  for (const [id, status] of statuses) {
    if (now - status.updatedAt > STATUS_TTL_MS) statuses.delete(id);
  }
}, 60_000).unref?.();
