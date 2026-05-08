import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Toast from '../components/Toast';
import { FiChevronLeft, FiCalendar, FiClock, FiCheck } from 'react-icons/fi';

const CATEGORIES = ['SPORT APP','MEDICAL APP','RENT APP','NOTES','GAMING APP'];
const CAT_COLORS = {
  'SPORT APP':   { color:'#F5A623', bg:'#FFF3DC' },
  'MEDICAL APP': { color:'#4DBFA8', bg:'#E1F7F3' },
  'RENT APP':    { color:'#E8737A', bg:'#FDEAEB' },
  'NOTES':       { color:'#7B6CF6', bg:'#EEEAFF' },
  'GAMING APP':  { color:'#2D2D3A', bg:'#F0EEF8' },
};

// Même clé que Calendar.jsx
const TASKS_KEY = 'app_tasks';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); }
  catch { return []; }
}
function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  // Déclencher l'event storage pour que Calendar se mette à jour
  window.dispatchEvent(new StorageEvent('storage', { key: TASKS_KEY }));
}

export default function Todo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ Récupère la date depuis l'URL (?date=2026-05-08)
  const dateFromCalendar = searchParams.get('date') || '';

  const [form, setForm] = useState({
    title: '',
    date: dateFromCalendar,
    startTime: '18:00',
    endTime: '20:00',
    description: '',
    category: 'SPORT APP',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast]   = useState(null);

  // ✅ Si la date dans l'URL change (navigation depuis Calendar), mettre à jour le form
  useEffect(() => {
    if (dateFromCalendar) {
      setForm(f => ({ ...f, date: dateFromCalendar }));
    }
  }, [dateFromCalendar]);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Le titre est obligatoire.';
    if (!form.date.trim())  errs.date  = 'La date est obligatoire.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // ✅ Sauvegarder dans localStorage (partagé avec Calendar)
    const existing = loadTasks();
    const newTask = {
      id:          Date.now(),
      title:       form.title.trim(),
      date:        form.date,
      startTime:   form.startTime,
      endTime:     form.endTime,
      description: form.description.trim(),
      category:    form.category,
      createdAt:   new Date().toISOString(),
    };
    saveTasks([...existing, newTask]);

    setToast({ message: `Tâche "${form.title}" créée !`, type: 'success' });

    // Retourner au calendrier sur la bonne date après 1.2s
    setTimeout(() => {
      navigate(`/calendar`);
    }, 1200);

    // Reset form (sauf la date)
    setForm(f => ({ title:'', date:f.date, startTime:'18:00', endTime:'20:00', description:'', category:'SPORT APP' }));
    setErrors({});
  };

  const lbl = {
    display:'block', fontSize:11, fontWeight:800,
    color:'#9B9BAD', marginBottom:8,
    textTransform:'uppercase', letterSpacing:'0.06em',
  };
  const inp = {
    fontFamily:'Nunito,sans-serif', border:'1.5px solid #ECECF5',
    borderRadius:14, padding:'13px 16px', fontSize:14,
    color:'#2D2D3A', background:'white', outline:'none',
    width:'100%', boxShadow:'0 1px 4px rgba(0,0,0,0.04)',
    transition:'border-color 0.2s',
  };
  const inpErr = { ...inp, border:'1.5px solid #E8737A', background:'#FDEAEB' };

  return (
    <div className="app-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
        <button className="btn-ghost" onClick={() => navigate(-1)}>
          <FiChevronLeft size={26} color="#2D2D3A"/>
        </button>
        <span style={{ fontWeight:900, fontSize:22, color:'#2D2D3A' }}>Créer une tâche</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

        {/* Title */}
        <div>
          <label style={lbl}>Titre *</label>
          <input
            placeholder="Ex: Faire les tâches pour l'app sport"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            style={errors.title ? inpErr : inp}
          />
          {errors.title && <p style={{ color:'#E8737A', fontSize:12, fontWeight:700, marginTop:5 }}>{errors.title}</p>}
        </div>

        {/* Date — ✅ pré-remplie depuis le calendrier */}
        <div>
          <label style={lbl}>Date *</label>
          <div style={{ position:'relative' }}>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              style={{ ...(errors.date ? inpErr : inp), paddingRight:44 }}
            />
            <FiCalendar size={18} color="#F5A623" style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
          </div>
          {errors.date && <p style={{ color:'#E8737A', fontSize:12, fontWeight:700, marginTop:5 }}>{errors.date}</p>}
          {/* Info visuelle quand date pré-remplie */}
          {form.date && (
            <p style={{ color:'#4DBFA8', fontSize:12, fontWeight:700, marginTop:5 }}>
              ✓ Date sélectionnée depuis le calendrier
            </p>
          )}
        </div>

        {/* Times */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[['startTime','Heure début',form.startTime],['endTime','Heure fin',form.endTime]].map(([key,label,val]) => (
            <div key={key}>
              <label style={lbl}>{label}</label>
              <div style={{ position:'relative' }}>
                <input type="time" value={val} onChange={e => set(key, e.target.value)}
                  style={{ ...inp, paddingRight:44 }}/>
                <FiClock size={16} color="#F5A623" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <label style={lbl}>Description</label>
          <textarea
            rows={4}
            placeholder="Décrivez la tâche en détail…"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            style={{ ...inp, resize:'none', lineHeight:1.6 }}
          />
        </div>

        {/* Categories */}
        <div>
          <label style={lbl}>Catégorie</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
            {CATEGORIES.map(cat => {
              const c = CAT_COLORS[cat] ?? { color:'#9B9BAD', bg:'#F0EEF8' };
              const active = form.category === cat;
              return (
                <button key={cat} onClick={() => set('category', cat)} style={{
                  display:'flex', alignItems:'center', gap:5,
                  padding:'9px 14px', borderRadius:20, border:'none', cursor:'pointer',
                  fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:11, letterSpacing:'0.04em',
                  background: active ? c.bg : 'white',
                  color: active ? c.color : '#9B9BAD',
                  boxShadow: active ? `0 0 0 2px ${c.color}` : '0 1px 4px rgba(0,0,0,0.07)',
                  transition:'all 0.18s',
                }}>
                  {active && <FiCheck size={12}/>}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} className="btn-primary" style={{ borderRadius:16, marginTop:4 }}>
          Créer la tâche
        </button>
      </div>

      <BottomNav/>
    </div>
  );
}