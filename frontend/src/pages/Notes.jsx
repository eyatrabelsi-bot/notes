import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import NoteList  from '../components/NoteList';
import NoteForm  from '../components/NoteForm';
import Toast     from '../components/Toast';
import BottomNav from '../components/BottomNav';
import { FiMenu, FiSearch, FiCalendar, FiPlus, FiLogOut, FiHome, FiCheckSquare } from 'react-icons/fi';

const FILTERS = [
  { value:'toutes',  label:'Toutes',  color:'#7B6CF6', bg:'#EEEAFF' },
  { value:'haute',   label:'Haute',   color:'#E8737A', bg:'#FDEAEB' },
  { value:'moyenne', label:'Moyenne', color:'#F5A623', bg:'#FFF3DC' },
  { value:'basse',   label:'Basse',   color:'#4DBFA8', bg:'#E1F7F3' },
];

const STATS_CONFIG = [
  { key:'haute',   label:'Haute',   color:'#E8737A', bg:'#FDEAEB' },
  { key:'moyenne', label:'Moyenne', color:'#F5A623', bg:'#FFF3DC' },
  { key:'basse',   label:'Basse',   color:'#4DBFA8', bg:'#E1F7F3' },
];

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      className={`menu-item${danger ? ' menu-item--danger' : ''}`}
    >
      <span className="menu-item__icon">{icon}</span>
      {label}
    </div>
  );
}

export default function Notes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('toutes');
  const [editingNote, setEditing]   = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [showMenu, setShowMenu]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const showToast = (message, type='success') => setToast({ message, type });

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } catch {
      showToast('Erreur de chargement.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleEdit   = (note) => { setEditing(note); setShowForm(true); };
  const handleNew    = () => { setEditing(null); setShowForm(true); };
  const handleSaved  = () => { setShowForm(false); setEditing(null); fetchNotes(); };
  const handleCancel = () => { setShowForm(false); setEditing(null); };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await api.delete(`/notes/${confirmDel.id}`);
      setNotes(prev => prev.filter(n => n.id !== confirmDel.id));
      showToast('Note supprimée.', 'success');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    } finally {
      setConfirmDel(null);
    }
  };

  const stats = {
    total:   notes.length,
    haute:   notes.filter(n => n.priority === 'haute').length,
    moyenne: notes.filter(n => n.priority === 'moyenne').length,
    basse:   notes.filter(n => n.priority === 'basse').length,
  };

  const username = user?.name ?? 'Utilisateur';
  const initials = username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="app-page">
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}

      {/* ── Top bar ── */}
      <div className="top-bar">
        <button className="btn-ghost" onClick={() => setShowMenu(s => !s)}>
          <FiMenu size={24} color="#2D2D3A"/>
        </button>
        <button className="btn-ghost" onClick={() => navigate('/search')}>
          <FiSearch size={24} color="#2D2D3A"/>
        </button>
      </div>

      {/* ── Side menu ── */}
      {showMenu && (
        <>
          <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
          <div className="side-menu">
            <div className="side-menu__header">
              <div className="side-menu__avatar">{initials}</div>
              <div className="side-menu__name">{username}</div>
              <div className="side-menu__email">{user?.email}</div>
            </div>
            <div className="side-menu__body">
              <MenuItem icon={<FiHome/>}        label="Accueil" onClick={() => { navigate('/');         setShowMenu(false); }} />
              <MenuItem icon={<FiCalendar/>}    label="Agenda"  onClick={() => { navigate('/calendar'); setShowMenu(false); }} />
              <MenuItem icon={<FiCheckSquare/>} label="Taches"  onClick={() => { navigate('/tasks');    setShowMenu(false); }} />
              <hr className="menu-divider" />
              <MenuItem icon={<FiLogOut/>} label="Se déconnecter" danger
                onClick={() => { logout(); navigate('/login'); setShowMenu(false); }} />
            </div>
          </div>
        </>
      )}

      {/* ── Profile banner ── */}
      <div className="profile-banner">
        <div className="profile-banner__avatar">{initials}</div>
        <div className="profile-banner__info">
          <div className="profile-banner__name">{username}</div>
          <div className="profile-banner__subtitle">
            {stats.total} note{stats.total !== 1 ? 's' : ''} au total
          </div>
        </div>
        <button className="profile-banner__calendar-btn" onClick={() => navigate('/calendar')}>
          <FiCalendar size={20} color="white"/>
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div className="stats-grid">
        {STATS_CONFIG.map(s => (
          <div key={s.key} className="card stats-card">
            <div className="stats-card__value" style={{ color: s.color }}>{stats[s.key]}</div>
            <div className="stats-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className="filter-tabs">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="filter-tab"
            style={{
              background: filter === f.value ? f.bg : 'white',
              color:      filter === f.value ? f.color : '#9B9BAD',
              boxShadow:  filter === f.value ? `0 0 0 2px ${f.color}` : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* ── Notes list ── */}
      <div className="notes-section">
        <div className="notes-section__header">
          <span className="notes-section__title">Mes Notes</span>
          <button onClick={handleNew} className="btn-new-note">
            <FiPlus size={16}/> Nouvelle note
          </button>
        </div>
        <NoteList
          notes={notes} filter={filter} loading={loading}
          onEdit={handleEdit}
          onDelete={note => setConfirmDel(note)}
        />
      </div>

      {/* ── Form modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) handleCancel(); }}>
          <div className="modal-sheet">
            <div className="modal-handle"/>
            <NoteForm
              editingNote={editingNote}
              onSaved={handleSaved}
              onCancel={handleCancel}
              showToast={showToast}
            />
          </div>
        </div>
      )}

      {/* ── Confirm delete modal ── */}
      {confirmDel && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) setConfirmDel(null); }}>
          <div className="modal-sheet modal-sheet--confirm">
            <div className="modal-handle"/>
            <div className="confirm-delete">
              <div className="confirm-delete__icon">🗑️</div>
              <h3 className="confirm-delete__title">Supprimer la note ?</h3>
              <p className="confirm-delete__text">
                «{confirmDel.title}» sera définitivement supprimée.
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setConfirmDel(null)} className="btn-secondary" style={{ flex:1 }}>Annuler</button>
              <button onClick={handleDelete} className="btn-danger">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}