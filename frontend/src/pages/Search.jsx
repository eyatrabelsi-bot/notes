import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Toast     from '../components/Toast';
import BottomNav from '../components/BottomNav';
import NoteForm  from '../components/NoteForm';
import { FiSearch, FiX, FiEdit2 } from 'react-icons/fi';

const PRIORITY = {
  haute:   { label:'Haute',   color:'#E8737A', bg:'#FDEAEB', dot:'❤️' },
  moyenne: { label:'Moyenne', color:'#F5A623', bg:'#FFF3DC', dot:'💛' },
  basse:   { label:'Basse',   color:'#4DBFA8', bg:'#E1F7F3', dot:'💚' },
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
const FILTER_LABELS = { toutes:'Toutes', haute:'❤️ Haute', moyenne:'💛 Moyenne', basse:'💚 Basse' };

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery]       = useState('');
  const [priority, setPriority] = useState('toutes');
  const [allNotes, setAll]      = useState([]);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
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

  const handleEdit = (note) => {
    setEditing(note);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    fetchNotes();
    setToast({ message: 'Note mise à jour !', type: 'success' });
  };

  return (
    <div className="app-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      {/* Search bar */}
      <div className="search-bar-wrap">
        <div className="search-bar">
          <FiSearch size={18} className="search-bar__icon"/>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher une note…"
            autoFocus
            className="search-bar__input"
          />
          {query && (
            <button onClick={() => setQuery('')} className="search-bar__clear-btn">
              <FiX size={18}/>
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="search-heading">
        <h1 className="search-heading__title">Recherche</h1>
        <p className="search-heading__count">
          {loading ? 'Chargement…' : `${results.length} résultat${results.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {FILTERS.map(f => {
          const active = priority === f;
          const c = f !== 'toutes' ? PRIORITY[f] : { color:'#7B6CF6', bg:'#EEEAFF' };
          return (
            <button
              key={f}
              onClick={() => setPriority(f)}
              className="filter-tab"
              style={{
                background: active ? c.bg   : 'white',
                color:      active ? c.color : '#9B9BAD',
                boxShadow:  active ? `0 0 0 2px ${c.color}` : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {FILTER_LABELS[f]}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="search-skeleton-list">
          {[...Array(4)].map((_,i) => (
            <div key={i} className="skeleton search-skeleton-item" style={{ animationDelay:`${i*0.1}s` }}/>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="search-empty">
          <div className="search-empty__icon">🔍</div>
          <p className="search-empty__text">
            {query ? `Aucun résultat pour "${query}"` : 'Aucune note trouvée'}
          </p>
        </div>
      ) : (
        <div className="search-results">
          {results.map(note => {
            const p = PRIORITY[note.priority] ?? PRIORITY.basse;
            return (
              <div key={note.id} className="card fade-in search-note-card">
                <div className="search-note-card__header">
                  <h3 className="search-note-card__title">
                    {highlight(note.title, query)}
                  </h3>
                  <span className="badge search-note-card__badge" style={{ background:p.bg, color:p.color }}>
                    {p.dot} {p.label}
                  </span>
                </div>
                {note.content && (
                  <p className="search-note-card__content">
                    {highlight(note.content, query)}
                  </p>
                )}
                <div className="search-note-card__footer">
                  <span className="search-note-card__date">{formatDate(note.created_at)}</span>
                  <button onClick={() => handleEdit(note)} className="search-note-card__edit-btn">
                    <FiEdit2 size={13}/> Modifier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
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