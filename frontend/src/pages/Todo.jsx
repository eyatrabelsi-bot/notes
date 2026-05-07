import { useState } from 'react';
import { Link } from 'react-router-dom';
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

const EMPTY = { title:'', date:'', startTime:'18:00', endTime:'20:00', description:'', category:'SPORT APP' };

export default function Todo() {
  const [form, setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const set = (k,v) => { setForm(f=>({...f,[k]:v})); if(errors[k]) setErrors(e=>({...e,[k]:null})); };

  const handleSubmit = () => {
    const errs = {};
    if (!form.title.trim())  errs.title = 'Le titre est obligatoire.';
    if (!form.date.trim())   errs.date  = 'La date est obligatoire.';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setToast({ message:`Tâche "${form.title}" créée !`, type:'success' });
    setTimeout(() => setForm(EMPTY), 400);
    setErrors({});
  };

  return (
    <div className="app-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
        <Link to="/notes" style={{ textDecoration:'none', display:'flex' }}>
          <FiChevronLeft size={26} color="#2D2D3A"/>
        </Link>
        <span style={{ fontWeight:900, fontSize:22, color:'#2D2D3A' }}>Créer une tâche</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

        {/* Title */}
        <div>
          <label className="field-label">Titre *</label>
          <input
            placeholder="Ex: Faire les tâches pour l'app sport"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className={`field-input${errors.title ? ' error' : ''}`}
          />
          {errors.title && <p style={{ color:'#E8737A', fontSize:12, fontWeight:700, marginTop:5 }}>{errors.title}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="field-label">Date *</label>
          <div style={{ position:'relative' }}>
            <input
              type="date" value={form.date}
              onChange={e => set('date', e.target.value)}
              className={`field-input${errors.date ? ' error' : ''}`}
              style={{ paddingRight:44 }}
            />
            <FiCalendar size={18} color="#F5A623" style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
          </div>
          {errors.date && <p style={{ color:'#E8737A', fontSize:12, fontWeight:700, marginTop:5 }}>{errors.date}</p>}
        </div>

        {/* Times */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {[['startTime','Heure début',form.startTime],['endTime','Heure fin',form.endTime]].map(([key,label,val]) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <div style={{ position:'relative' }}>
                <input type="time" value={val} onChange={e => set(key, e.target.value)}
                  className="field-input" style={{ paddingRight:44 }}/>
                <FiClock size={16} color="#F5A623" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div>
          <label className="field-label">Description</label>
          <textarea
            rows={4}
            placeholder="Décrivez la tâche en détail…"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="field-input"
            style={{ resize:'none', lineHeight:1.6 }}
          />
        </div>

        {/* Categories */}
        <div>
          <label className="field-label">Catégorie</label>
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