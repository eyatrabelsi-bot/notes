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

  // ── Quand la date vient du calendrier (double-clic), pré-remplir ──
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
      // 1. Sauvegarder dans localStorage (calendrier)
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

      // 2. Synchroniser avec l'API notes si priorité
      if (['haute', 'moyenne', 'basse'].includes(form.category)) {
        await api.post('/notes', {
          title: form.title.trim(),
          content: form.description.trim() || 'Tâche planifiée',
          priority: form.category,
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

  // ── Styles ──────────────────────────────────────────────────────
  const accent   = '#F5A623';
  const textMain = '#2D2D3A';
  const textMuted = '#9B9BAD';

  const lbl = {
    display: 'block', fontSize: 11, fontWeight: 800,
    color: textMuted, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  const inp = {
    fontFamily: 'Nunito, sans-serif',
    border: '1.5px solid #ECECF5',
    borderRadius: 14, padding: '13px 16px', fontSize: 14,
    color: textMain, background: 'white', outline: 'none',
    width: '100%', boxSizing: 'border-box',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'border-color 0.2s',
  };

  const inpErr = { ...inp, border: '1.5px solid #E8737A', background: '#FDEAEB' };

  return (
    <div className="app-page" style={{ paddingBottom: 120 }}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'white', border: 'none', borderRadius: 12,
            width: 40, height: 40, display:'flex', alignItems:'center',
            justifyContent:'center', cursor:'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>
          <FiChevronLeft size={22} color={textMain} />
        </button>
        <span style={{ fontWeight: 900, fontSize: 22, color: textMain }}>Créer une tâche</span>
      </div>

      {/* ── Info date pré-remplie depuis calendrier ── */}
      {dateFromCalendar && (
        <div style={{
          background: '#E1F7F3', borderRadius: 14, padding: '12px 16px',
          marginBottom: 20, display:'flex', alignItems:'center', gap: 10,
        }}>
          <FiCalendar size={18} color="#4DBFA8" />
          <span style={{ fontWeight: 800, fontSize: 13, color: '#4DBFA8' }}>
            Tâche pour le {formatDateFR(dateFromCalendar)}
          </span>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap: 20 }}>

        {/* ── Titre ── */}
        <div>
          <label style={lbl}>Titre *</label>
          <input
            placeholder="Ex: Réunion de projet"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            style={errors.title ? inpErr : inp}
          />
          {errors.title && (
            <p style={{ color:'#E8737A', fontSize:12, fontWeight:700, marginTop:5 }}>{errors.title}</p>
          )}
        </div>

        {/* ── Date — pré-remplie depuis le calendrier ── */}
        <div>
          <label style={lbl}>Date *</label>
          <div style={{ position:'relative' }}>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              style={{
                ...(errors.date ? inpErr : inp),
                paddingRight: 44,
                // Highlight si pré-remplie
                border: dateFromCalendar && !errors.date
                  ? '1.5px solid #4DBFA8'
                  : errors.date ? '1.5px solid #E8737A' : '1.5px solid #ECECF5',
                background: dateFromCalendar && !errors.date ? '#E1F7F3' : errors.date ? '#FDEAEB' : 'white',
              }}
            />
            <FiCalendar size={18} color={dateFromCalendar ? '#4DBFA8' : accent}
              style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
          </div>
          {errors.date && (
            <p style={{ color:'#E8737A', fontSize:12, fontWeight:700, marginTop:5 }}>{errors.date}</p>
          )}
        </div>

        {/* ── Horaires ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 14 }}>
          {[['startTime', 'Heure début'], ['endTime', 'Heure fin']].map(([key, label]) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <div style={{ position:'relative' }}>
                <input
                  type="time"
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  style={{ ...inp, paddingRight: 44 }}
                />
                <FiClock size={16} color={accent}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* ── Description ── */}
        <div>
          <label style={lbl}>Description</label>
          <textarea
            rows={3}
            placeholder="Ajouter des détails..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            style={{ ...inp, resize:'none', lineHeight: 1.6 }}
          />
        </div>

        {/* ── Catégorie / Priorité ── */}
        <div>
          <label style={lbl}>Catégorie / Priorité</label>
          <div style={{ display:'flex', gap: 10, flexWrap:'wrap' }}>
            {Object.entries(CAT_COLORS).map(([name, s]) => {
              const isSelected = form.category === name;
              return (
                <button key={name} onClick={() => set('category', name)} style={{
                  padding: '10px 18px', borderRadius: 14, cursor:'pointer',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12,
                  whiteSpace: 'nowrap', transition: 'all 0.2s',
                  background: isSelected ? s.bg : '#F5F5F9',
                  color: isSelected ? s.color : textMuted,
                  border: isSelected ? `1.5px solid ${s.color}` : '1.5px solid transparent',
                  boxShadow: isSelected ? `0 4px 12px ${s.bg}` : 'none',
                }}>
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
          style={{
            width: '100%', padding: '16px', borderRadius: 16, border:'none',
            background: submitted
              ? '#ccc'
              : `linear-gradient(135deg, ${accent}, #F7C55A)`,
            color: 'white', fontWeight: 900, fontSize: 16,
            cursor: submitted ? 'not-allowed' : 'pointer',
            boxShadow: submitted ? 'none' : `0 4px 16px ${accent}55`,
            fontFamily: 'Nunito, sans-serif', marginTop: 8,
            transition: 'all 0.2s',
          }}>
          {submitted ? '✓ Tâche créée !' : 'Créer la tâche'}
        </button>

      </div>

      <BottomNav />
    </div>
  );
}