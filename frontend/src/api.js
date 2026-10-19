// Camada de acesso ao backend. Em desenvolvimento o Vite faz proxy de /api -> http://localhost:3333.
// Para apontar direto para outro host, defina VITE_API_URL (ex.: http://localhost:3333).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      signal,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* resposta sem corpo JSON */
  }

  if (!res.ok) {
    throw new Error(data?.message || `Erro inesperado (${res.status}).`);
  }
  return data;
}

export function listTasks({ search = '', signal } = {}) {
  const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return request(`/api/tasks${qs}`, { signal });
}

export function createTask({ title, dueDate }) {
  return request('/api/tasks', {
    method: 'POST',
    body: { title, dueDate: dueDate || null },
  });
}

// changes: { completed?, title?, dueDate? } — dueDate null remove a data limite.
export function updateTask(id, changes) {
  return request(`/api/tasks/${id}`, { method: 'PATCH', body: changes });
}

export function deleteTask(id) {
  return request(`/api/tasks/${id}`, { method: 'DELETE' });
}
