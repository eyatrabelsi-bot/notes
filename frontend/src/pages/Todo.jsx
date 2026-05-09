import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import BottomNav from '../components/BottomNav';
import Toast from '../components/Toast';
import { FiChevronLeft, FiCalendar, FiClock } from 'react-icons/fi';

const CAT_COLORS = {
  'haute':   { color: '#E8737A', bg: '#FDEAEB' },
  'moyenne': { color: '#F5A623', bg: '#FFF3DC' },
  'basse':   { color: '#4DBFA8', bg: '#E1F7F3' },
  'event':   { color: '#914dbf', bg: '#e2bdfa' },
};

const TASKS_KEY = 'app_tasks';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); }
  catch { return []; }
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new StorageEvent('storage', { key: TASKS_KEY }));
}

function formatDateFR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['janvier','février','mars','avril','mai','juin',
    'juillet','août','septembre','octobre','novembre','décembre'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

export default function Todo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateFromCalendar = searchParams.get('date') || '';

  const [form, setForm] = useState({
    title: '',
    date: dateFromCalendar,
    startTime: '08:00',
    endTime: '09:00',
    description: '',
    category: 'moyenne',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (dateFromCalendar) {
      setForm(f => ({ ...f, date: dateFromCalendar }));
    }
  }, [dateFromCalendar]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Le titre est obligatoire.';
    if (!form.date.trim())  errs.date  = 'La date est obligatoire.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      const existing = loadTasks();
      const newTask = {
        id: Date.now(),
        title: form.title.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        description: form.description.trim(),
        category: form.category,
        createdAt: new Date().toISOString(),
      };
      saveTasks([...existing, newTask]);

      if (['haute', 'moyenne', 'basse'].includes(form.category)) {
        await api.post('/notes', {
          title: form.title.trim(),
          content: form.description.trim() || 'Tâche planifiée',
          priority: form.category,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
        });
      }

      setSubmitted(true);
      setToast({ message: `✓ Tâche créée pour le ${formatDateFR(form.date)} !`, type: 'success' });
      setTimeout(() => navigate('/calendar'), 1400);

    } catch (err) {
      console.error('Erreur API:', err);
      setToast({ message: "Erreur lors de la création.", type: 'error' });
    }
  };

  return (
    <div className="app-page todo-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="tasks-header">
        <button onClick={() => navigate(-1)} className="tasks-back-btn">
          <FiChevronLeft size={22} />
        </button>
        <span className="tasks-title">Créer une tâche</span>
      </div>

      {/* ── Date pré-remplie depuis calendrier ── */}
      {dateFromCalendar && (
        <div className="todo-date-banner">
          <FiCalendar size={18} color="#4DBFA8" />
          <span className="todo-date-banner__text">
            Tâche pour le {formatDateFR(dateFromCalendar)}
          </span>
        </div>
      )}

      <div className="todo-form">

        {/* ── Titre ── */}
        <div>
          <label className="field-label">Titre *</label>
          <input
            placeholder="Ex: Réunion de projet"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className={`field-input todo-field ${errors.title ? 'error' : ''}`}
          />
          {errors.title && <p className="todo-field-error">{errors.title}</p>}
        </div>

        {/* ── Date ── */}
        <div>
          <label className="field-label">Date *</label>
          <div className="field-icon-wrap">
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className={`field-input todo-field field-input--icon-right
                ${errors.date ? 'error' : ''}
                ${dateFromCalendar && !errors.date ? 'todo-field--prefilled' : ''}`}
            />
            <FiCalendar
              size={18}
              color={dateFromCalendar ? '#4DBFA8' : '#F5A623'}
              className="field-icon todo-field__icon-right"
            />
          </div>
          {errors.date && <p className="todo-field-error">{errors.date}</p>}
        </div>

        {/* ── Horaires ── */}
        <div className="todo-time-grid">
          {[['startTime', 'Heure début'], ['endTime', 'Heure fin']].map(([key, label]) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <div className="field-icon-wrap">
                <input
                  type="time"
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="field-input todo-field field-input--icon-right"
                />
                <FiClock size={16} color="#F5A623" className="field-icon todo-field__icon-right" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Description ── */}
        <div>
          <label className="field-label">Description</label>
          <textarea
            rows={3}
            placeholder="Ajouter des détails..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="field-input todo-field todo-textarea"
          />
        </div>

        {/* ── Catégorie / Priorité ── */}
        <div>
          <label className="field-label">Catégorie / Priorité</label>
          <div className="todo-categories">
            {Object.entries(CAT_COLORS).map(([name, s]) => {
              const isSelected = form.category === name;
              return (
                <button
                  key={name}
                  onClick={() => set('category', name)}
                  className={`todo-cat-btn ${isSelected ? 'todo-cat-btn--selected' : ''}`}
                  style={isSelected ? {
                    background: s.bg,
                    color: s.color,
                    borderColor: s.color,
                    boxShadow: `0 4px 12px ${s.bg}`,
                  } : {}}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bouton créer ── */}
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className={`btn-primary todo-submit ${submitted ? 'todo-submit--done' : ''}`}
        >
          {submitted ? '✓ Tâche créée !' : 'Créer la tâche'}
        </button>

      </div>

      <BottomNav />
    </div>
  );
}