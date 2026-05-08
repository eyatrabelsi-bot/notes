import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Toast     from '../components/Toast';
import BottomNav from '../components/BottomNav';
import NoteForm  from '../components/NoteForm'; // 1. Import the form
import { FiSearch, FiX, FiEdit2 } from 'react-icons/fi';

const PRIORITY = {
  haute:   { label:'Haute',   color:'#E8737A', bg:'#FDEAEB', dot:'🔴' },
  moyenne: { label:'Moyenne', color:'#F5A623', bg:'#FFF3DC', dot:'🟠' },
  basse:   { label:'Basse',   color:'#4DBFA8', bg:'#E1F7F3', dot:'🟢' },
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
}

function highlight(text, query) {
  if (!query || !text) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i}>{p}</mark>
      : p
  );
}

const FILTERS = ['toutes','haute','moyenne','basse'];
const FILTER_LABELS = { toutes:'Toutes', haute:'🔴 Haute', moyenne:'🟠 Moyenne', basse:'🟢 Basse' };

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery]       = useState('');
  const [priority, setPriority] = useState('toutes');
  const [allNotes, setAll]      = useState([]);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  
  // 2. Add states for editing
  const [editingNote, setEditing] = useState(null);
  const [showForm, setShowForm]   = useState(false);

  const fetchNotes = () => {
    setLoading(true);
    api.get('/notes')
      .then(({ data }) => { setAll(data); setResults(data); })
      .catch(() => setToast({ message:'Erreur de chargement.', type:'error' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotes(); }, []);

  useEffect(() => {
    let f = allNotes;
    if (priority !== 'toutes') f = f.filter(n => n.priority === priority);
    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter(n => n.title.toLowerCase().includes(q) || (n.content ?? '').toLowerCase().includes(q));
    }
    setResults(f);
  }, [query, priority, allNotes]);

  // 3. Handlers for the form
  const handleEdit = (note) => {
    setEditing(note);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    fetchNotes(); // Refresh list after update
    setToast({ message: 'Note mise à jour !', type: 'success' });
  };

  return (
    <div className="app-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <div style={{
          flex:1, position:'relative',
          background:'white', borderRadius:16,
          boxShadow:'0 2px 12px rgba(0,0,0,0.07)',
          display:'flex', alignItems:'center',
        }}>
          <FiSearch size={18} color="#9B9BAD" style={{ position:'absolute', left:14 }}/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher une note…"
            autoFocus
            style={{
              border:'none', outline:'none', width:'100%',
              padding:'14px 44px', fontSize:14, fontWeight:600,
              fontFamily:'Nunito,sans-serif', color:'#2D2D3A',
              background:'transparent', borderRadius:16,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              position:'absolute', right:14, background:'none',
              border:'none', cursor:'pointer', color:'#9B9BAD', display:'flex',
            }}>
              <FiX size={18}/>
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom:16 }}>
        <h1 style={{ fontWeight:900, fontSize:22, color:'#2D2D3A' }}>Recherche</h1>
        <p style={{ color:'#9B9BAD', fontSize:13, fontWeight:600, marginTop:3 }}>
          {loading ? 'Chargement…' : `${results.length} résultat${results.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, overflowX:'auto', paddingBottom:4 }}>
        {FILTERS.map(f => {
          const active = priority === f;
          const c = f !== 'toutes' ? PRIORITY[f] : { color:'#7B6CF6', bg:'#EEEAFF' };
          return (
            <button key={f} onClick={() => setPriority(f)} style={{
              padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer',
              fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:12, whiteSpace:'nowrap',
              background: active ? c.bg : 'white',
              color: active ? c.color : '#9B9BAD',
              boxShadow: active ? `0 0 0 2px ${c.color}` : '0 1px 4px rgba(0,0,0,0.06)',
              transition:'all 0.18s', flexShrink:0,
            }}>{FILTER_LABELS[f]}</button>
          );
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[...Array(4)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height:100, animationDelay:`${i*0.1}s` }}/>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 0', gap:12 }}>
          <div style={{ fontSize:56, marginBottom:4 }}>🔍</div>
          <p style={{ color:'#9B9BAD', fontSize:14, fontWeight:700 }}>
            {query ? `Aucun résultat pour "${query}"` : 'Aucune note trouvée'}
          </p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {results.map(note => {
            const p = PRIORITY[note.priority] ?? PRIORITY.basse;
            return (
              <div key={note.id} className="card fade-in" style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <h3 style={{ flex:1, fontWeight:800, fontSize:14, color:'#2D2D3A', lineHeight:1.4 }}>
                    {highlight(note.title, query)}
                  </h3>
                  <span className="badge" style={{ background:p.bg, color:p.color, flexShrink:0 }}>
                    {p.dot} {p.label}
                  </span>
                </div>
                {note.content && (
                  <p style={{ color:'#9B9BAD', fontSize:13, fontWeight:600, lineHeight:1.5,
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {highlight(note.content, query)}
                  </p>
                )}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #F0EEF8', paddingTop:10 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'#C4C4D0' }}>{formatDate(note.created_at)}</span>
                  
                  {/* 4. Changed the onClick to handleEdit */}
                  <button onClick={() => handleEdit(note)} style={{
                    display:'flex', alignItems:'center', gap:5,
                    background:'#FFF3DC', border:'none', borderRadius:10,
                    padding:'7px 12px', cursor:'pointer',
                    color:'#F5A623', fontSize:12, fontWeight:800,
                    fontFamily:'Nunito,sans-serif',
                  }}>
                    <FiEdit2 size={13}/> Modifier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add the Modal overlay for the form */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setShowForm(false); }}>
          <div className="modal-sheet">
            <div className="modal-handle"/>
            <NoteForm
              editingNote={editingNote}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
              showToast={(m, t) => setToast({ message: m, type: t })}
            />
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}