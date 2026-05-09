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

  const textMain  = '#2D2D3A';
  const textMuted = '#9B9BAD';
  const accent    = '#F5A623';

  return (
    <div className="app-page" style={{ paddingBottom: 120 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'white', border: 'none', borderRadius: 12,
          width: 40, height: 40, display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <FiChevronLeft size={22} color={textMain} />
        </button>
        <span style={{ fontWeight: 900, fontSize: 22, color: textMain }}>Mes Tâches</span>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
        <input
          placeholder="Ajouter une tâche..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          style={{
            flex: 1, fontFamily: 'Nunito, sans-serif',
            border: '1.5px solid #ECECF5', borderRadius: 14,
            padding: '13px 16px', fontSize: 14, color: textMain,
            background: 'white', outline: 'none',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        />
        <button onClick={handleAdd} style={{
          background: `linear-gradient(135deg, ${accent}, #F7C55A)`,
          border: 'none', borderRadius: 14, width: 50, height: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: `0 4px 14px ${accent}55`, flexShrink: 0,
        }}>
          <FiPlus size={22} color="white" strokeWidth={2.5} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 60, animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      ) : (
        <>
          {/* Pending tasks */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                À faire — {pending.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Completed tasks */}
          {completed.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Terminées — {completed.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {completed.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
              }}>✅</div>
              <p style={{ color: textMuted, fontSize: 14, fontWeight: 700 }}>Aucune tâche pour l'instant</p>
              <p style={{ color: '#C4C4D0', fontSize: 13, fontWeight: 600 }}>Ajoutez-en une ci-dessus</p>
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const textMain = '#2D2D3A';
  return (
    <div className="card fade-in" style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', transition: 'transform 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      {/* Circle checkbox */}
      <button onClick={() => onToggle(task)} style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        border: task.completed ? 'none' : '2px solid #DDDDE8',
        background: task.completed ? 'linear-gradient(135deg,#F5A623,#F7C55A)' : 'white',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s', boxShadow: task.completed ? '0 2px 8px rgba(245,166,35,0.4)' : 'none',
      }}>
        {task.completed && (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 14, fontWeight: 700, color: task.completed ? '#C4C4D0' : textMain,
        textDecoration: task.completed ? 'line-through' : 'none',
        transition: 'all 0.2s',
      }}>
        {task.title}
      </span>

      {/* Delete */}
      <button onClick={() => onDelete(task.id)} style={{
        background: '#FDEAEB', border: 'none', borderRadius: 10,
        width: 34, height: 34, display: 'flex', alignItems: 'center',
        justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        transition: 'opacity 0.15s',
      }}>
        <FiTrash2 size={14} color="#E8737A" />
      </button>
    </div>
  );
}