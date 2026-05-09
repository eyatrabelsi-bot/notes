import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import BottomNav from '../components/BottomNav';
import Toast from '../components/Toast';
import { FiPlus, FiTrash2, FiChevronLeft } from 'react-icons/fi';

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput]     = useState('');
  const [toast, setToast]     = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch {
      showToast('Erreur de chargement.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleAdd = async () => {
    if (!input.trim()) return;
    try {
      const { data } = await api.post('/tasks', { title: input.trim() });
      setTasks(prev => [data, ...prev]);
      setInput('');
    } catch {
      showToast('Erreur lors de la création.', 'error');
    }
  };

  const handleToggle = async (task) => {
    try {
      const { data } = await api.patch(`/tasks/${task.id}`, { completed: !task.completed });
      setTasks(prev => prev.map(t => t.id === task.id ? data : t));
    } catch {
      showToast('Erreur lors de la mise à jour.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  const pending   = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div className="app-page tasks-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="tasks-header">
        <button onClick={() => navigate(-1)} className="tasks-back-btn">
          <FiChevronLeft size={22} />
        </button>
        <span className="tasks-title">Mes Tâches</span>
      </div>

      {/* Input */}
      <div className="tasks-input-row">
        <input
          placeholder="Ajouter une tâche..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="tasks-input"
        />
        <button onClick={handleAdd} className="tasks-add-btn">
          <FiPlus size={22} color="white" strokeWidth={2.5} />
        </button>
      </div>

      {loading ? (
        <div className="tasks-skeleton-list">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton tasks-skeleton-item" style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      ) : (
        <>
          {/* Pending tasks */}
          {pending.length > 0 && (
            <div className="tasks-group">
              <p className="tasks-group__label">À faire — {pending.length}</p>
              <div className="tasks-group__list">
                {pending.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Completed tasks */}
          {completed.length > 0 && (
            <div className="tasks-group">
              <p className="tasks-group__label">Terminées — {completed.length}</p>
              <div className="tasks-group__list">
                {completed.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="tasks-empty">
              <div className="tasks-empty__icon">✅</div>
              <p className="tasks-empty__title">Aucune tâche pour l'instant</p>
              <p className="tasks-empty__subtitle">Ajoutez-en une ci-dessus</p>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <div
      className="card task-row fade-in"
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {/* Circle checkbox */}
      <button
        onClick={() => onToggle(task)}
        className={`task-row__checkbox ${task.completed ? 'task-row__checkbox--done' : ''}`}
      >
        {task.completed && (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Title */}
      <span className={`task-row__title ${task.completed ? 'task-row__title--done' : ''}`}>
        {task.title}
      </span>

      {/* Delete */}
      <button onClick={() => onDelete(task.id)} className="task-row__delete">
        <FiTrash2 size={14} color="#E8737A" />
      </button>
    </div>
  );
}