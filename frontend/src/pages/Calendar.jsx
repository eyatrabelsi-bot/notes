import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { FiChevronLeft, FiChevronRight, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const TASKS_KEY = 'app_tasks';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); }
  catch { return []; }
}
function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  window.dispatchEvent(new StorageEvent('storage', { key: TASKS_KEY }));
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

const priorityColor = {
  haute:   { bg:'#FFE8E8', text:'#E8737A', dot:'#E8737A' },
  moyenne: { bg:'#FFF9EE', text:'#F5A623', dot:'#F5A623' },
  basse:   { bg:'#E8F8F5', text:'#4DBFA8', dot:'#4DBFA8' },
};

const PRIORITIES = [
  { value:'haute',   label:'Haute',   color:'#E8737A', bg:'#FDEAEB' },
  { value:'moyenne', label:'Moyenne', color:'#F5A623', bg:'#FFF3DC' },
  { value:'basse',   label:'Basse',   color:'#4DBFA8', bg:'#E1F7F3' },
];

export default function Calendar() {
  const navigate = useNavigate();
  const today    = new Date();

  const [view, setView]         = useState('Mois');
  const [year, setYear]         = useState(today.getFullYear());
  const [month, setMonth]       = useState(today.getMonth());
  const [tasks, setTasks]       = useState(loadTasks);
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  );
  const [editingTask, setEditingTask] = useState(null);
  const [confirmTask, setConfirmTask] = useState(null);

  useEffect(() => {
    const refresh = () => setTasks(loadTasks());
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  const hasTasksOnDay   = (dStr) => tasks.some(t => t.date === dStr);
  const hasTasksInMonth = (mIdx) => tasks.some(t => t.date?.startsWith(`${year}-${String(mIdx+1).padStart(2,'0')}`));
  const hasTasksInYear  = (y)    => tasks.some(t => t.date?.startsWith(`${y}-`));

  const confirmDelete = () => {
    if (!confirmTask) return;
    const updated = tasks.filter(t => t.id !== confirmTask.id);
    saveTasks(updated); setTasks(updated); setConfirmTask(null);
  };

  const handleUpdate = () => {
    if (!editingTask?.title?.trim()) return;
    const updated = tasks.map(t => t.id === editingTask.id ? editingTask : t);
    saveTasks(updated); setTasks(updated); setEditingTask(null);
  };

  // ── Month grid ────────────────────────────────────────────────
  const renderMonthGrid = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMo = new Date(year, month + 1, 0).getDate();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`}/>);
    for (let d = 1; d <= daysInMo; d++) {
      const dStr       = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isSelected = selectedDate === dStr;
      const isToday    = dStr === todayStr;
      const hasTasks   = hasTasksOnDay(dStr);
      cells.push(
        <button
          key={d}
          onClick={() => setSelectedDate(dStr)}
          onDoubleClick={() => navigate(`/todo?date=${dStr}`)}
          className={`cal-day-btn${isSelected ? ' cal-day-btn--selected' : ''}${isToday && !isSelected ? ' cal-day-btn--today' : ''}`}
        >
          {d}
          {hasTasks && <div className={`cal-day-dot${isSelected ? ' cal-day-dot--selected' : ''}`}/>}
        </button>
      );
    }
    return cells;
  };

  // ── Year grid ─────────────────────────────────────────────────
  const renderYearGrid = () => (
    <div className="cal-year-grid">
      {MONTHS_FR.map((m, i) => (
        <button
          key={m}
          onClick={() => { setMonth(i); setView('Mois'); }}
          className={`cal-month-btn${month === i ? ' cal-month-btn--active' : ''}`}
        >
          {m.substring(0, 4)}
          {hasTasksInMonth(i) && <div className="cal-month-dot"/>}
        </button>
      ))}
    </div>
  );

  const selectedTasks = tasks.filter(t => t.date === selectedDate);

  return (
    <div className="app-page cal-page">

      {/* Header */}
      <div className="cal-header">
        <h1 className="cal-header__title">Agenda</h1>
        <button
          onClick={() => navigate(`/todo?date=${selectedDate}`)}
          className="cal-header__add-btn"
        >
          <FiPlus size={16}/> Ajouter
        </button>
      </div>

      {/* View tabs */}
      <div className="cal-view-tabs card">
        {['Année','Mois'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`cal-view-tab${view === v ? ' cal-view-tab--active' : ''}`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Navigator */}
      <div className="cal-navigator">
        <button
          className="btn-ghost"
          onClick={() => view==='Année' ? setYear(y=>y-1) : setMonth(m=>m===0?11:m-1)}
        >
          <FiChevronLeft size={24} className="cal-navigator__icon"/>
        </button>
        <div className="cal-navigator__label">
          <div className="cal-navigator__text">
            {view==='Année' ? year : `${MONTHS_FR[month]} ${year}`}
          </div>
          {view==='Année' && hasTasksInYear(year) && (
            <div className="cal-navigator__year-dot"/>
          )}
        </div>
        <button
          className="btn-ghost"
          onClick={() => view==='Année' ? setYear(y=>y+1) : setMonth(m=>m===11?0:m+1)}
        >
          <FiChevronRight size={24} className="cal-navigator__icon"/>
        </button>
      </div>

      {/* Calendar grid */}
      {view==='Année' ? renderYearGrid() : (
        <div className="card cal-month-grid-wrap">
          <div className="cal-day-headers">
            {DAYS_FR.map(d => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}
          </div>
          <div className="cal-day-grid">
            {renderMonthGrid()}
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="cal-task-list">
        {selectedTasks.length === 0 ? (
          <div className="card cal-empty-state">
            <div className="cal-empty-state__icon">📭</div>
            <div className="cal-empty-state__text">Aucune tâche ce jour</div>
          </div>
        ) : selectedTasks.map(task => {
          const p = priorityColor[task.priority] ?? priorityColor[task.category] ?? priorityColor.moyenne;
          return (
            <div
              key={task.id}
              className="card cal-task-item"
              style={{ borderLeft:`4px solid ${p.dot}` }}
            >
              <div className="cal-task-item__body">
                <div className="cal-task-item__title">{task.title}</div>
                {task.description && (
                  <div className="cal-task-item__desc">{task.description}</div>
                )}
                {task.category && (
                  <span
                    className="cal-task-item__badge"
                    style={{ background: p.bg, color: p.text }}
                  >
                    {task.category}
                  </span>
                )}
                {(task.startTime || task.endTime) && (
                  <div className="cal-task-item__time" style={{ color: p.dot }}>
                    🕐 {task.startTime}{task.endTime ? ` → ${task.endTime}` : ''}
                  </div>
                )}
              </div>
              <div className="cal-task-item__actions">
                <FiEdit2
                  size={18}
                  className="cal-task-item__edit-icon"
                  onClick={() => setEditingTask({ ...task })}
                />
                <FiTrash2
                  size={18}
                  className="cal-task-item__delete-icon"
                  onClick={() => setConfirmTask(task)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════
          MODAL MODIFIER
         ══════════════════════════════════════════════════ */}
      {editingTask && (
        <div
          className="cal-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setEditingTask(null); }}
        >
          <div className="cal-modal-card">
            <div className="cal-modal-card__header">
              <h2 className="cal-modal-card__title">Modifier la tâche</h2>
              <button
                className="btn-ghost"
                onClick={() => setEditingTask(null)}
              >
                <FiX size={22} className="cal-modal-card__close-icon"/>
              </button>
            </div>

            {/* Titre */}
            <div className="cal-field">
              <label className="field-label">Titre *</label>
              <input
                className="field-input"
                value={editingTask.title || ''}
                maxLength={100}
                onChange={e => setEditingTask(t => ({ ...t, title: e.target.value }))}
              />
              <div className="cal-field__counter">
                {(editingTask.title||'').length}/100
              </div>
            </div>

            {/* Contenu */}
            <div className="cal-field">
              <label className="field-label">Contenu</label>
              <textarea
                className="field-input cal-field__textarea"
                rows={4}
                value={editingTask.description || ''}
                onChange={e => setEditingTask(t => ({ ...t, description: e.target.value }))}
              />
            </div>

            {/* Priorité */}
            <div className="cal-field cal-field--last">
              <label className="field-label">Priorité</label>
              <div className="cal-priority-group">
                {PRIORITIES.map(p => {
                  const isActive = editingTask.priority === p.value || editingTask.category === p.value;
                  return (
                    <button
                      key={p.value}
                      onClick={() => setEditingTask(t => ({ ...t, priority: p.value }))}
                      className="cal-priority-btn"
                      style={{
                        background: isActive ? p.bg : '#F4F2EE',
                        color:      isActive ? p.color : '#9B9BAD',
                        boxShadow:  isActive ? `0 0 0 2px ${p.color}` : 'none',
                      }}
                    >
                      <div
                        className="cal-priority-btn__dot"
                        style={{ background: isActive ? p.color : '#DDD' }}
                      />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save */}
            <button className="btn-primary cal-modal-card__save-btn" onClick={handleUpdate}>
              Mettre à jour
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MODAL CONFIRMATION SUPPRESSION
         ══════════════════════════════════════════ */}
      {confirmTask && (
        <div
          className="cal-modal-overlay cal-modal-overlay--top"
          onClick={e => { if (e.target === e.currentTarget) setConfirmTask(null); }}
        >
          <div className="cal-confirm-card">
            <div className="cal-confirm-card__icon-wrap">🗑️</div>
            <h3 className="cal-confirm-card__title">Supprimer la note ?</h3>
            <p className="cal-confirm-card__text">
              «{confirmTask.title}» sera définitivement supprimée.
            </p>
            <div className="cal-confirm-card__actions">
              <button
                className="btn-secondary cal-confirm-card__cancel-btn"
                onClick={() => setConfirmTask(null)}
              >
                Annuler
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}