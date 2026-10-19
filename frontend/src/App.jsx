import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createTask, deleteTask, listTasks, updateTask } from './api.js';
import useDebounce from './hooks/useDebounce.js';
import { sortTasks } from './utils/tasks.js';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';
import { ClipboardIcon, PlusIcon, SearchIcon } from './components/Icons.jsx';

const DEBOUNCE_MS = 400;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [totals, setTotals] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState(null); // null | { task: null | Task }

  // A busca só dispara depois que o usuário para de digitar.
  const search = useDebounce(searchInput, DEBOUNCE_MS);
  const searchRef = useRef(search);
  searchRef.current = search;
  const controllerRef = useRef(null);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const data = await listTasks({ search: searchRef.current, signal: controller.signal });
      setTasks(data.tasks);
      setTotals({ total: data.total, completed: data.completed });
      setError('');
      setLoading(false);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => controllerRef.current?.abort();
  }, [search, load]);

  const visibleTasks = useMemo(() => sortTasks(tasks), [tasks]);
  const isSearching = search.trim() !== '';

  async function run(action) {
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleToggle(task) {
    const completed = !task.completed;
    // Atualização otimista; `load` reconcilia com o servidor.
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: completed ? 1 : 0 } : t)));
    setTotals((t) => ({ ...t, completed: t.completed + (completed ? 1 : -1) }));
    run(() => updateTask(task.id, { completed }));
  }

  function handleDelete(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    run(() => deleteTask(task.id));
  }

  async function handleSubmit({ title, dueDate }) {
    if (modal.task) {
      await updateTask(modal.task.id, { title, dueDate });
    } else {
      await createTask({ title, dueDate });
    }
    setModal(null);
    await load();
  }

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <div className="page">
      <main className="app">
        <h1 className="logo">
          Todo<span>List</span>
        </h1>

        <div className="search">
          <SearchIcon className="search__icon" />
          <input
            type="search"
            value={searchInput}
            placeholder="Buscar tarefas"
            aria-label="Buscar tarefas"
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="counters">
          <div className="counter">
            <span>Criadas</span>
            <b className="pill">{totals.total}</b>
          </div>
          <div className="counter">
            <span>Concluídas</span>
            <b className="pill">{totals.completed}</b>
          </div>
        </div>

        {error && (
          <div className="alert" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => { setError(''); load(); }}>
              Tentar novamente
            </button>
          </div>
        )}

        <hr className="divider" />

        {loading ? (
          <p className="loading">Carregando…</p>
        ) : visibleTasks.length === 0 ? (
          <div className="empty">
            <ClipboardIcon />
            {isSearching ? (
              <>
                <strong>Nenhuma tarefa encontrada</strong>
                <span>Tente buscar por outro termo.</span>
              </>
            ) : (
              <>
                <strong>Você ainda não tem tarefas cadastradas</strong>
                <span>Crie tarefas e organize seus itens a fazer</span>
              </>
            )}
          </div>
        ) : (
          <ul className="list">
            {visibleTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={(t) => setModal({ task: t })}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </main>

      <button type="button" className="fab" aria-label="Criar tarefa" title="Criar tarefa" onClick={() => setModal({ task: null })}>
        <PlusIcon width={26} height={26} strokeWidth={2.5} />
      </button>

      {modal && <TaskModal task={modal.task} onClose={closeModal} onSubmit={handleSubmit} />}
    </div>
  );
}
