export function getAdminKey() {
  return localStorage.getItem("ADMIN_KEY") || "";
}

export function setAdminKey(v) {
  localStorage.setItem("ADMIN_KEY", v);
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("x-admin-key", getAdminKey());

  const res = await fetch(path, { ...options, headers });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  return data;
}
