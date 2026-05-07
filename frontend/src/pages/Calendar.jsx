import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import api from '../api/axiosInstance';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

const PRIORITY_STYLE = {
  haute:   { bg:'#FDEAEB', border:'#E8737A', color:'#E8737A' },
  moyenne: { bg:'#FFF3DC', border:'#F5A623', color:'#F5A623' },
  basse:   { bg:'#E1F7F3', border:'#4DBFA8', color:'#4DBFA8' },
  default: { bg:'#EEEAFF', border:'#7B6CF6', color:'#7B6CF6' },
};

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth()    === d2.getMonth()    &&
         d1.getDate()     === d2.getDate();
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0,0,0,0);
  return d;
}

// ── Timeline ─────────────────────────────────────────────────────────────────
function Timeline({ notes, filterDay }) {
  const taskMap = {};
  notes.forEach(note => {
    const d = new Date(note.created_at);
    if (filterDay && !isSameDay(d, filterDay)) return;
    const h = d.getHours();
    if (!taskMap[h]) taskMap[h] = [];
    taskMap[h].push(note);
  });

  const hasAny = Object.keys(taskMap).length > 0;

  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {!hasAny && (
        <div style={{ textAlign:'center', color:'#9B9BAD', fontSize:13, padding:'32px 0', fontWeight:700 }}>
          Aucune note pour ce jour
        </div>
      )}
      {ALL_HOURS.map(hour => {
        const tasks = taskMap[hour] || [];
        return (
          <div key={hour} style={{ display:'flex', gap:12, minHeight: tasks.length ? 'auto' : 48 }}>
            <div style={{
              width:46, color:'#9B9BAD', fontSize:10, fontWeight:800,
              paddingTop:10, flexShrink:0, textAlign:'right',
            }}>
              {`${String(hour).padStart(2,'0')}h00`}
            </div>
            <div style={{
              flex:1, borderTop:'1px solid #EEECF5',
              paddingTop: tasks.length ? 8 : 0,
              paddingBottom: tasks.length ? 10 : 0,
              display:'flex', flexDirection:'column', gap:6,
            }}>
              {tasks.map((note, i) => {
                const s = PRIORITY_STYLE[note.priority] ?? PRIORITY_STYLE.default;
                return (
                  <div key={note.id ?? i} style={{
                    background: s.bg,
                    borderLeft: `4px solid ${s.border}`,
                    borderRadius:'0 12px 12px 0',
                    padding:'10px 14px',
                  }}>
                    <div style={{ fontWeight:800, fontSize:13, color:'#2D2D3A' }}>{note.title}</div>
                    {note.content && (
                      <div style={{ fontSize:11, color:'#9B9BAD', marginTop:3, lineHeight:1.5, fontWeight:600 }}>
                        {note.content}
                      </div>
                    )}
                    <div style={{ fontSize:10, color: s.color, marginTop:5, fontWeight:800, textTransform:'uppercase' }}>
                      {note.priority}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Vue MOIS ──────────────────────────────────────────────────────────────────
function MonthView({ year, month, today, selected, onSelect, notes }) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const notesByDay = {};
  notes.forEach(n => {
    const d = new Date(n.created_at);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!notesByDay[key]) notesByDay[key] = [];
      notesByDay[key].push(n);
    }
  });

  return (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
        {DAYS_FR.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:10, color:'#9B9BAD', fontWeight:800, padding:'6px 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`}/>;
          const isToday  = today.getFullYear()===year && today.getMonth()===month && today.getDate()===day;
          const isSel    = selected && selected.getFullYear()===year && selected.getMonth()===month && selected.getDate()===day;
          const dots     = (notesByDay[day] || []).slice(0,3).map(n => (PRIORITY_STYLE[n.priority]??PRIORITY_STYLE.default).border);
          return (
            <div key={day} onClick={() => onSelect(new Date(year, month, day))}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                padding:'6px 2px', borderRadius:10, cursor:'pointer',
                background: isSel ? 'linear-gradient(135deg,#F5A623,#F7C55A)' : isToday ? '#FFF3DC' : 'transparent',
                border: isToday && !isSel ? '1.5px solid #F5A623' : '1.5px solid transparent',
                transition:'all 0.15s',
              }}>
              <span style={{
                fontSize:13, fontWeight:900,
                color: isSel ? 'white' : isToday ? '#F5A623' : '#2D2D3A',
              }}>{day}</span>
              {dots.length > 0 && (
                <div style={{ display:'flex', gap:2, marginTop:3 }}>
                  {dots.map((c,j) => (
                    <div key={j} style={{ width:5, height:5, borderRadius:'50%', background: isSel ? 'rgba(255,255,255,0.8)' : c }}/>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Vue SEMAINE ───────────────────────────────────────────────────────────────
function WeekView({ weekStart, today, selected, onSelect, notes }) {
  const days = Array.from({ length:7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:16 }}>
        {days.map((d, i) => {
          const isToday = isSameDay(d, today);
          const isSel   = selected && isSameDay(d, selected);
          return (
            <div key={i} onClick={() => onSelect(new Date(d))}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer' }}>
              <span style={{ fontSize:10, color:'#9B9BAD', fontWeight:800 }}>{DAYS_FR[d.getDay()]}</span>
              <div style={{
                width:34, height:34, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                background: isSel ? 'linear-gradient(135deg,#F5A623,#F7C55A)' : isToday ? '#FFF3DC' : 'transparent',
                border: isToday && !isSel ? '1.5px solid #F5A623' : '1.5px solid transparent',
              }}>
                <span style={{ fontWeight:900, fontSize:13, color: isSel ? 'white' : isToday ? '#F5A623' : '#2D2D3A' }}>
                  {d.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Timeline notes={notes} filterDay={selected}/>
    </>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function Calendar() {
  const navigate  = useNavigate();
  const today     = new Date();
  today.setHours(0,0,0,0);

  const [view,     setView]     = useState('month');
  const [current,  setCurrent]  = useState(new Date(today));
  const [selected, setSelected] = useState(new Date(today));
  const [notes,    setNotes]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await api.get('/notes');
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const go = (dir) => {
    const d = new Date(current);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else { d.setDate(d.getDate() + dir); setSelected(new Date(d)); }
    setCurrent(d);
  };

  const handleSelect = (day) => {
    setSelected(day);
    setCurrent(new Date(day));
    if (view === 'month') setView('day');
  };

  const navLabel = () => {
    if (view === 'month') return `${MONTHS_FR[current.getMonth()]} ${current.getFullYear()}`;
    if (view === 'week') {
      const ws = startOfWeek(current);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      return `${ws.getDate()} – ${we.getDate()} ${MONTHS_FR[we.getMonth()]} ${we.getFullYear()}`;
    }
    return `${selected.getDate()} ${MONTHS_FR[selected.getMonth()]} ${selected.getFullYear()}`;
  };

  const weekStart = startOfWeek(current);

  return (
    <div className="app-page" style={{ paddingBottom:100 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', marginBottom:20, gap:10 }}>
        <button onClick={() => navigate('/notes')}
          style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4 }}>
          <FiChevronLeft size={24} color="#2D2D3A"/>
        </button>
        <div style={{ flex:1, fontWeight:900, fontSize:18, color:'#2D2D3A' }}>Calendrier</div>
        <button onClick={fetchNotes} style={{
          background:'#F0EDE8', border:'none', borderRadius:10,
          padding:'7px 12px', fontSize:12, fontWeight:700, color:'#9B9BAD', cursor:'pointer',
        }}>↻ Sync</button>
        <button onClick={() => navigate('/todo')} style={{
          background:'linear-gradient(135deg,#F5A623,#F7C55A)',
          color:'white', borderRadius:12, padding:'8px 14px',
          fontWeight:800, fontSize:13, border:'none', cursor:'pointer',
          display:'flex', alignItems:'center', gap:6,
          boxShadow:'0 4px 14px rgba(245,166,35,0.3)',
        }}>
          <FiPlus size={15}/> Ajouter
        </button>
      </div>

      {/* Switcher vue */}
      <div style={{
        display:'flex', background:'#F0EDE8', borderRadius:14,
        padding:4, marginBottom:20, gap:4,
      }}>
        {[['month','Mois'],['week','Semaine'],['day','Jour']].map(([v,l]) => (
          <button key={v} onClick={() => { setView(v); setCurrent(new Date(selected)); }} style={{
            flex:1, padding:'9px 0', borderRadius:10, border:'none', cursor:'pointer',
            fontWeight:800, fontSize:12, fontFamily:'Nunito,sans-serif',
            background: view===v ? 'white' : 'transparent',
            color: view===v ? '#F5A623' : '#9B9BAD',
            boxShadow: view===v ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition:'all 0.18s',
          }}>{l}</button>
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <button onClick={() => go(-1)} style={{ background:'none', border:'none', cursor:'pointer', padding:8 }}>
          <FiChevronLeft size={20} color="#2D2D3A"/>
        </button>
        <div style={{ fontWeight:800, fontSize:15, color:'#2D2D3A' }}>{navLabel()}</div>
        <button onClick={() => go(1)} style={{ background:'none', border:'none', cursor:'pointer', padding:8 }}>
          <FiChevronRight size={20} color="#2D2D3A"/>
        </button>
      </div>

      {/* Calendrier */}
      <div className="card" style={{ padding:'14px 12px', marginBottom:20 }}>
        {view === 'month' && (
          <MonthView
            year={current.getFullYear()} month={current.getMonth()}
            today={today} selected={selected}
            onSelect={handleSelect} notes={notes}
          />
        )}
        {view === 'week' && (
          <WeekView
            weekStart={weekStart} today={today}
            selected={selected} onSelect={setSelected} notes={notes}
          />
        )}
        {view === 'day' && (
          <>
            <div style={{ fontWeight:800, fontSize:14, color:'#2D2D3A', marginBottom:14 }}>
              {DAYS_FR[selected.getDay()]} {selected.getDate()} {MONTHS_FR[selected.getMonth()]} {selected.getFullYear()}
            </div>
            {loading
              ? <div style={{ textAlign:'center', color:'#9B9BAD', fontSize:13, padding:'20px 0' }}>Chargement…</div>
              : <Timeline notes={notes} filterDay={selected}/>
            }
          </>
        )}
      </div>

      {/* Notes du jour sélectionné (vue mois uniquement) */}
      {view === 'month' && selected && !loading && (
        <div>
          <div style={{ fontWeight:800, fontSize:15, color:'#2D2D3A', marginBottom:12 }}>
            Notes du {selected.getDate()} {MONTHS_FR[selected.getMonth()]}
          </div>
          <div className="card" style={{ padding:'14px 12px' }}>
            <Timeline notes={notes} filterDay={selected}/>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}