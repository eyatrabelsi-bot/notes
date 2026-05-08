import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { FiChevronLeft, FiChevronRight, FiPlus, FiRefreshCw } from 'react-icons/fi';

// Stockage local des tâches (clé partagée avec Todo.jsx)
const TASKS_KEY = 'app_tasks';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(TASKS_KEY) || '[]'); }
  catch { return []; }
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
function formatDisplay(year, month, day) {
  return new Date(year, month, day).toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' });
}

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

const CAT_COLORS = {
  'SPORT APP':   { color:'#F5A623', bg:'#FFF3DC' },
  'MEDICAL APP': { color:'#4DBFA8', bg:'#E1F7F3' },
  'RENT APP':    { color:'#E8737A', bg:'#FDEAEB' },
  'NOTES':       { color:'#7B6CF6', bg:'#EEEAFF' },
  'GAMING APP':  { color:'#2D2D3A', bg:'#F0EEF8' },
};

const VIEWS = ['Mois', 'Semaine', 'Jour'];

export default function Calendar() {
  const navigate = useNavigate();
  const today = new Date();

  const [view, setView]     = useState('Mois');
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()));
  const [tasks, setTasks]   = useState(loadTasks);

  // Recharger les tâches quand on revient sur la page
  useEffect(() => {
    const refresh = () => setTasks(loadTasks());
    window.addEventListener('focus', refresh);
    // Aussi quand localStorage change (depuis Todo)
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  // Refresh manuel
  const refresh = () => setTasks(loadTasks());

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  // Tâches du jour sélectionné
  const selectedTasks = tasks.filter(t => t.date === selected);

  // Jours qui ont des tâches (pour les points indicateurs)
  const daysWithTasks = new Set(
    tasks
      .filter(t => t.date && t.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`))
      .map(t => parseInt(t.date.split('-')[2]))
  );

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Naviguer vers Todo avec la date pré-remplie
  const goToAddTask = () => {
    navigate(`/todo?date=${selected}`);
  };

  return (
    <div className="app-page">

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:24 }}>
        <button className="btn-ghost" onClick={() => navigate('/notes')}>
          <FiChevronLeft size={26} color="#2D2D3A"/>
        </button>
        <h1 style={{ flex:1, fontWeight:900, fontSize:22, color:'#2D2D3A', marginLeft:8 }}>Calendrier</h1>
        <button className="btn-ghost" onClick={refresh} title="Rafraîchir">
          <FiRefreshCw size={20} color="#9B9BAD"/>
        </button>
        <button onClick={goToAddTask} style={{
          display:'flex', alignItems:'center', gap:6,
          background:'linear-gradient(135deg,#F5A623,#F7C55A)',
          border:'none', borderRadius:14, padding:'10px 16px',
          color:'white', fontWeight:800, fontSize:13,
          fontFamily:'Nunito,sans-serif', cursor:'pointer',
          boxShadow:'0 4px 14px rgba(245,166,35,0.3)', marginLeft:8,
        }}>
          <FiPlus size={16}/> Ajouter
        </button>
      </div>

      {/* View tabs */}
      <div className="card" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', marginBottom:20, padding:4 }}>
        {VIEWS.map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding:'10px', borderRadius:12, border:'none', cursor:'pointer',
            fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:13,
            background: view === v ? 'linear-gradient(135deg,#F5A623,#F7C55A)' : 'transparent',
            color: view === v ? 'white' : '#9B9BAD',
            boxShadow: view === v ? '0 4px 12px rgba(245,166,35,0.3)' : 'none',
            transition:'all 0.2s',
          }}>{v}</button>
        ))}
      </div>

      {/* Month navigator */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button className="btn-ghost" onClick={prevMonth}><FiChevronLeft size={22} color="#2D2D3A"/></button>
        <span style={{ fontWeight:800, fontSize:16, color:'#2D2D3A' }}>{MONTHS_FR[month]} {year}</span>
        <button className="btn-ghost" onClick={nextMonth}><FiChevronRight size={22} color="#2D2D3A"/></button>
      </div>

      {/* Calendar grid */}
      <div className="card" style={{ padding:'16px 12px', marginBottom:24 }}>
        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:8 }}>
          {DAYS_FR.map(d => (
            <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:800, color:'#9B9BAD', paddingBottom:8 }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'2px 0' }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`}/>
          ))}
          {/* Day buttons */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day     = i + 1;
            const dateStr = toDateStr(year, month, day);
            const isToday    = dateStr === todayStr;
            const isSelected = dateStr === selected;
            const hasTask    = daysWithTasks.has(day);

            return (
              <div key={day} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'2px 0' }}>
                <button onClick={() => setSelected(dateStr)} style={{
                  width:36, height:36, borderRadius:'50%', border:'none', cursor:'pointer',
                  fontFamily:'Nunito,sans-serif', fontWeight: isToday || isSelected ? 900 : 700,
                  fontSize:14,
                  background: isSelected
                    ? 'linear-gradient(135deg,#F5A623,#F7C55A)'
                    : isToday
                      ? '#FFF3DC'
                      : 'transparent',
                  color: isSelected ? 'white' : isToday ? '#F5A623' : '#2D2D3A',
                  boxShadow: isSelected ? '0 4px 12px rgba(245,166,35,0.4)' : 'none',
                  transition:'all 0.18s',
                }}>{day}</button>
                {/* Task indicator dot */}
                {hasTask && (
                  <div style={{
                    width:5, height:5, borderRadius:'50%',
                    background: isSelected ? '#F5A623' : '#4DBFA8',
                  }}/>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      <div>
        <div style={{ fontWeight:800, fontSize:15, color:'#2D2D3A', marginBottom:14 }}>
          {formatDisplay(year, month, parseInt(selected.split('-')[2]))}
        </div>

        {selectedTasks.length === 0 ? (
          <div className="card" style={{
            padding:'32px 20px', textAlign:'center',
            color:'#9B9BAD', fontSize:14, fontWeight:600,
          }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
            Aucune tâche ni note pour ce jour
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {selectedTasks.map((task, idx) => {
              const c = CAT_COLORS[task.category] ?? { color:'#9B9BAD', bg:'#F0EEF8' };
              return (
                <div key={idx} className="card fade-in" style={{
                  padding:'14px 16px',
                  borderLeft:`4px solid ${c.color}`,
                  borderRadius:'0 14px 14px 0',
                  background: c.bg,
                  boxShadow:'none',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ fontWeight:800, fontSize:14, color:'#2D2D3A', flex:1 }}>{task.title}</div>
                    <span style={{ fontSize:10, fontWeight:800, color:c.color, background:'white', borderRadius:20, padding:'3px 8px', marginLeft:8, flexShrink:0 }}>
                      {task.category}
                    </span>
                  </div>
                  {task.description && (
                    <div style={{ fontSize:12, color:'#9B9BAD', marginTop:5, fontWeight:600, lineHeight:1.4 }}>{task.description}</div>
                  )}
                  {(task.startTime || task.endTime) && (
                    <div style={{ fontSize:11, color:c.color, marginTop:6, fontWeight:800 }}>
                      🕐 {task.startTime}{task.endTime ? ` → ${task.endTime}` : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav/>
    </div>
  );
}