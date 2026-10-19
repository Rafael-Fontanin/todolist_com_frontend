import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from './Icons.jsx';
import { normalizeDate } from '../utils/tasks.js';

// Modal único para "Criar Tarefa" (task = null) e "Editar Tarefa" (task = objeto).
export default function TaskModal({ task, onClose, onSubmit }) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(normalizeDate(task?.due_date) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !saving && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, saving]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError('O nome da tarefa é obrigatório.');
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), dueDate: dueDate || null });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onSubmit={handleSubmit} noValidate>
        <header className="modal__header">
          <h2 id="modal-title">{isEdit ? 'Editar Tarefa' : 'Criar Tarefa'}</h2>
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={onClose} disabled={saving}>
            <CloseIcon />
          </button>
        </header>

        <label className="field">
          <span>Nome da tarefa</span>
          <input
            ref={inputRef}
            type="text"
            value={title}
            maxLength={255}
            placeholder="Descrição da tarefa"
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
          />
        </label>

        <label className="field">
          <span>
            Data limite <em>(opcional)</em>
          </span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <footer className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar'}
          </button>
        </footer>
      </form>
    </div>
  );
}
