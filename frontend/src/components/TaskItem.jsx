import { CalendarIcon, CheckIcon, PencilIcon, TrashIcon } from './Icons.jsx';
import { formatDate, isOverdue } from '../utils/tasks.js';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  const done = !!task.completed;

  const classes = ['task', done ? 'task--done' : 'task--pending', overdue ? 'task--overdue' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <li className={classes}>
      <button
        type="button"
        className={`check ${done ? 'check--on' : ''}`}
        role="checkbox"
        aria-checked={done}
        aria-label={done ? 'Marcar como pendente' : 'Marcar como concluída'}
        onClick={() => onToggle(task)}
      >
        {done && <CheckIcon width={12} height={12} />}
      </button>

      <div className="task__body">
        <span className="task__title">{task.title}</span>
        {(task.due_date || overdue) && (
          <span className="task__meta">
            {task.due_date && (
              <span className="task__date">
                <CalendarIcon width={12} height={12} />
                {formatDate(task.due_date)}
              </span>
            )}
            {overdue && <span className="badge-overdue">Em atraso</span>}
          </span>
        )}
      </div>

      <div className="task__actions">
        <button
          type="button"
          className="icon-btn"
          aria-label={`Editar tarefa: ${task.title}`}
          title="Editar"
          onClick={() => onEdit(task)}
        >
          <PencilIcon width={16} height={16} />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          aria-label={`Excluir tarefa: ${task.title}`}
          title="Excluir"
          onClick={() => onDelete(task)}
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>
    </li>
  );
}
