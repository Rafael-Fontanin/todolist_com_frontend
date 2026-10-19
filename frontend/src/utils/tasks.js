// Data local de hoje no formato YYYY-MM-DD (evita problemas de fuso do toISOString).
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// O backend devolve due_date como 'YYYY-MM-DD' (dateStrings: true). Por segurança, corta qualquer sufixo.
export function normalizeDate(value) {
  return value ? String(value).slice(0, 10) : null;
}

export function formatDate(value) {
  const iso = normalizeDate(value);
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Em atraso: ainda pendente e data limite anterior a hoje.
export function isOverdue(task, today = todayISO()) {
  const due = normalizeDate(task.due_date);
  return !task.completed && !!due && due < today;
}

// Mesma ordem do backend: data mais próxima primeiro, sem data por último, desempate por criação (mais nova antes).
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const da = normalizeDate(a.due_date);
    const db = normalizeDate(b.due_date);
    if (da && !db) return -1;
    if (!da && db) return 1;
    if (da && db && da !== db) return da < db ? -1 : 1;
    const ca = a.created_at || '';
    const cb = b.created_at || '';
    if (ca !== cb) return ca < cb ? 1 : -1;
    return b.id - a.id;
  });
}
