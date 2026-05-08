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

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const accent    = '#F5A623';
const accentBg  = '#FFF9EE';
const teal      = '#4DBFA8';
const textMain  = '#2D2D3A';
const textMuted = '#9B9BAD';
const cardStyle = { background: 'white', borderRadius: 18, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' };

const priorityColor = {
  haute:   { bg: '#FFE8E8', text: '#E8737A', dot: '#E8737A' },
  moyenne: { bg: accentBg,  text: accent,    dot: accent    },
  basse:   { bg: '#E8F8F5', text: teal,      dot: teal      },
};

export default function Calendar() {
  const navigate = useNavigate();
  const today = new Date();

  const [view, setView]             = useState('Mois');
  const [year, setYear]             = useState(today.getFullYear());
  const [month, setMonth]           = useState(today.getMonth());
  const [tasks, setTasks]           = useState(loadTasks);
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  );
  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [editingNote, setEditingNote]   = useState(null);
  const [confirmTask, setConfirmTask]   = useState(null); // ← tâche à supprimer

  useEffect(() => {
    const refresh = () => setTasks(loadTasks());
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  const hasTasksOnDay   = (dStr) => tasks.some(t => t.date === dStr);
  const hasTasksInMonth = (mIdx) => tasks.some(t => t.date?.startsWith(`${year}-${String(mIdx+1).padStart(2,'0')}`));
  const hasTasksInYear  = (y)    => tasks.some(t => t.date?.startsWith(`${y}-`));

  // ── Delete (appelé APRÈS confirmation) ──────────────────────────
  const confirmDelete = () => {
    if (!confirmTask) return;
    const updated = tasks.filter(t => t.id !== confirmTask.id);
    saveTasks(updated);
    setTasks(updated);
    setConfirmTask(null);
  };

  // ── Edit ─────────────────────────────────────────────────────────
  const openEditModal = (task) => { setEditingNote({ ...task }); setIsEditOpen(true); };
  const handleUpdate  = () => {
    if (!editingNote?.title?.trim()) return;
    const updated = tasks.map(t => t.id === editingNote.id ? editingNote : t);
    saveTasks(updated);
    setTasks(updated);
    setIsEditOpen(false);
  };

  // ── Month grid ───────────────────────────────────────────────────
  const renderMonthGrid = () => {
    const firstDay   = new Date(year, month, 1).getDay();
    const daysInMo   = new Date(year, month + 1, 0).getDate();
    const todayStr   = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const cells = [];

    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`}/>);

    for (let d = 1; d <= daysInMo; d++) {
      const dStr       = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isSelected = selectedDate === dStr;
      const isToday    = dStr === todayStr;
      const hasTasks   = hasTasksOnDay(dStr);

      cells.push(
        <button key={d}
          onClick={() => setSelectedDate(dStr)}
          onDoubleClick={() => navigate(`/todo?date=${dStr}`)}
          style={{
            height:40, border:'none', cursor:'pointer', borderRadius:'50%',
            background: isSelected ? accent : 'transparent',
            color: isSelected ? 'white' : isToday ? accent : textMain,
            fontWeight:800, fontSize:14,
            position:'relative', display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:1,
          }}>
          {d}
          {hasTasks && (
            <div style={{ width:4, height:4, borderRadius:'50%', background: isSelected ? 'white' : teal }}/>
          )}
        </button>
      );
    }
    return cells;
  };

  // ── Year grid ────────────────────────────────────────────────────
  const renderYearGrid = () => (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
      {MONTHS_FR.map((m, i) => (
        <button key={m} onClick={() => { setMonth(i); setView('Mois'); }} style={{
          ...cardStyle, padding:'20px 10px', textAlign:'center', position:'relative',
          border: month===i ? `2px solid ${accent}` : '2px solid transparent',
          background: month===i ? accentBg : 'white',
          color: month===i ? accent : textMain,
          fontWeight:800, cursor:'pointer', fontSize:13,
        }}>
          {m.substring(0,4)}
          {hasTasksInMonth(i) && (
            <div style={{ position:'absolute', top:6, right:6, width:6, height:6, borderRadius:'50%', background:teal }}/>
          )}
        </button>
      ))}
    </div>
  );

  const selectedTasks = tasks.filter(t => t.date === selectedDate);

  return (
    <div className="app-page" style={{ background:'#F5F5F0', minHeight:'100vh', padding:'20px 16px 120px' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ fontWeight:900, fontSize:24, color:textMain, margin:0 }}>Agenda</h1>
        <button onClick={() => navigate(`/todo?date=${selectedDate}`)} style={{
          display:'flex', alignItems:'center', gap:6,
          background:`linear-gradient(135deg,${accent},#F7C55A)`,
          color:'white', border:'none', borderRadius:12,
          padding:'10px 18px', fontWeight:800, fontSize:14,
          cursor:'pointer', boxShadow:`0 4px 12px ${accent}55`,
        }}>
          <FiPlus size={16}/> Ajouter
        </button>
      </div>

      {/* ── View tabs ── */}
      <div style={{ ...cardStyle, display:'flex', padding:4, marginBottom:20 }}>
        {['Année','Mois'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex:1, padding:'11px 0', border:'none', borderRadius:12, cursor:'pointer',
            fontWeight:800, fontSize:14, transition:'all 0.2s',
            background: view===v ? `linear-gradient(135deg,${accent},#F7C55A)` : 'transparent',
            color: view===v ? 'white' : textMuted,
          }}>{v}</button>
        ))}
      </div>

      {/* ── Navigator ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <button style={{ background:'none', border:'none', cursor:'pointer' }}
          onClick={() => view==='Année' ? setYear(y=>y-1) : setMonth(m=>m===0?11:m-1)}>
          <FiChevronLeft size={24} color={textMain}/>
        </button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontWeight:800, fontSize:18, color:textMain }}>
            {view==='Année' ? year : `${MONTHS_FR[month]} ${year}`}
          </div>
          {view==='Année' && hasTasksInYear(year) && (
            <div style={{ width:4, height:4, background:teal, borderRadius:'50%', margin:'2px auto 0' }}/>
          )}
        </div>
        <button style={{ background:'none', border:'none', cursor:'pointer' }}
          onClick={() => view==='Année' ? setYear(y=>y+1) : setMonth(m=>m===11?0:m+1)}>
          <FiChevronRight size={24} color={textMain}/>
        </button>
      </div>

      {/* ── Calendar ── */}
      {view==='Année' ? renderYearGrid() : (
        <div style={{ ...cardStyle, padding:16, marginBottom:20 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:8 }}>
            {DAYS_FR.map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:11, color:textMuted, fontWeight:800 }}>{d}</div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
            {renderMonthGrid()}
          </div>
        </div>
      )}

      {/* ── Task list ── */}
      <div>
        {selectedTasks.length === 0 ? (
          <div style={{ ...cardStyle, padding:30, textAlign:'center', color:textMuted }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📭</div>
            <div style={{ fontWeight:700, fontSize:14 }}>Aucune tâche ce jour</div>
          </div>
        ) : (
          selectedTasks.map(task => {
            const p = priorityColor[task.category] ?? priorityColor[task.priority] ?? priorityColor.moyenne;
            return (
              <div key={task.id} style={{
                ...cardStyle, padding:'14px 16px', marginBottom:10,
                display:'flex', justifyContent:'space-between', alignItems:'center',
                borderLeft:`4px solid ${p.dot}`,
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:textMain }}>{task.title}</div>
                  {task.description && (
                    <div style={{ fontSize:12, color:textMuted, marginTop:3 }}>{task.description}</div>
                  )}
                  {(task.category || task.priority) && (
                    <span style={{
                      display:'inline-block', marginTop:6,
                      background:p.bg, color:p.text,
                      fontSize:10, fontWeight:800, padding:'2px 10px', borderRadius:20,
                    }}>
                      {(task.category || task.priority)}
                    </span>
                  )}
                  {(task.startTime || task.endTime) && (
                    <div style={{ fontSize:11, color:p.dot, marginTop:4, fontWeight:800 }}>
                      🕐 {task.startTime}{task.endTime ? ` → ${task.endTime}` : ''}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:14, marginLeft:12 }}>
                  <FiEdit2 size={18} color={accent} style={{ cursor:'pointer' }} onClick={() => openEditModal(task)}/>
                  {/* ✅ Ouvre la modal de confirmation au lieu de window.confirm */}
                  <FiTrash2 size={18} color="#E8737A" style={{ cursor:'pointer' }} onClick={() => setConfirmTask(task)}/>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ══════════════════════════════════════════
          ✅ MODAL CONFIRMATION SUPPRESSION
          Design : centré, icône poubelle, 2 boutons
         ══════════════════════════════════════════ */}
      {confirmTask && (
        <div style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:2000, padding:'20px',
        }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmTask(null); }}
        >
          <div style={{
            background:'white',
            borderRadius:28,
            padding:'36px 28px 28px',
            width:'100%', maxWidth:360,
            textAlign:'center',
            boxShadow:'0 20px 60px rgba(0,0,0,0.18)',
            animation:'fadeIn 0.2s ease both',
          }}>
            {/* Icône poubelle */}
            <div style={{
              width:80, height:80, borderRadius:'50%',
              background:'#FFF3DC',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 20px',
            }}>
              <span style={{ fontSize:40 }}>🗑️</span>
            </div>

            {/* Titre */}
            <h3 style={{ fontWeight:900, fontSize:20, color:textMain, marginBottom:10 }}>
              Supprimer la note ?
            </h3>

            {/* Sous-titre */}
            <p style={{ color:textMuted, fontSize:14, fontWeight:600, lineHeight:1.5, marginBottom:28 }}>
              «{confirmTask.title}» sera définitivement supprimée.
            </p>

            {/* Boutons */}
            <div style={{ display:'flex', gap:12 }}>
              {/* Annuler */}
              <button
                onClick={() => setConfirmTask(null)}
                style={{
                  flex:1, padding:'15px', borderRadius:16,
                  border:'1.5px solid #ECECF5', background:'white',
                  fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:15,
                  color:textMuted, cursor:'pointer',
                  transition:'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='#F4F2EE'}
                onMouseLeave={e => e.currentTarget.style.background='white'}
              >
                Annuler
              </button>

              {/* Supprimer */}
              <button
                onClick={confirmDelete}
                style={{
                  flex:1, padding:'15px', borderRadius:16,
                  border:'none',
                  background:'linear-gradient(135deg,#E8737A,#C9565D)',
                  fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:15,
                  color:'white', cursor:'pointer',
                  boxShadow:'0 6px 20px rgba(232,115,122,0.4)',
                  transition:'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isEditOpen && editingNote && (
        <div style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.45)',
          display:'flex', alignItems:'flex-end',
          zIndex:1000,
        }}>
          <div style={{
            background:'white', width:'100%',
            borderTopLeftRadius:30, borderTopRightRadius:30,
            padding:'20px 24px 36px',
            boxShadow:'0 -8px 40px rgba(0,0,0,0.12)',
          }}>
            <div style={{ width:40, height:4, background:'#EEE', margin:'0 auto 20px', borderRadius:10 }}/>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontWeight:900, fontSize:20, color:textMain, margin:0 }}>Modifier la tâche</h2>
              <button onClick={() => setIsEditOpen(false)} style={{ background:'none', border:'none', cursor:'pointer' }}>
                <FiX size={22} color={textMuted}/>
              </button>
            </div>

            <label style={{ fontSize:11, fontWeight:800, color:textMuted, display:'block', marginBottom:8, letterSpacing:0.5 }}>TITRE *</label>
            <input
              value={editingNote.title || ''}
              maxLength={100}
              onChange={e => setEditingNote({ ...editingNote, title:e.target.value })}
              style={{
                width:'100%', padding:'14px 16px', borderRadius:14,
                border:'1.5px solid #EEE', fontSize:15, fontWeight:600,
                color:textMain, outline:'none', boxSizing:'border-box',
                background:'#FAFAFA', fontFamily:'Nunito,sans-serif',
              }}
            />

            <label style={{ fontSize:11, fontWeight:800, color:textMuted, display:'block', marginTop:18, marginBottom:8, letterSpacing:0.5 }}>DESCRIPTION</label>
            <textarea
              rows={3}
              value={editingNote.description || ''}
              onChange={e => setEditingNote({ ...editingNote, description:e.target.value })}
              style={{
                width:'100%', padding:'14px 16px', borderRadius:14,
                border:'1.5px solid #EEE', fontSize:14, color:textMain,
                outline:'none', resize:'none', boxSizing:'border-box',
                background:'#FAFAFA', fontFamily:'Nunito,sans-serif',
              }}
            />

            <button onClick={handleUpdate} style={{
              width:'100%', padding:'16px', borderRadius:16, marginTop:20,
              background:`linear-gradient(135deg,${accent},#F7C55A)`,
              color:'white', border:'none', fontWeight:900, fontSize:16,
              cursor:'pointer', boxShadow:`0 4px 16px ${accent}55`,
              fontFamily:'Nunito,sans-serif',
            }}>
              Mettre à jour
            </button>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}