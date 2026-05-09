import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import NoteList  from '../components/NoteList';
import NoteForm  from '../components/NoteForm';
import Toast     from '../components/Toast';
import BottomNav from '../components/BottomNav';
import { FiMenu, FiSearch, FiCalendar, FiPlus, FiLogOut, FiX, FiHome, FiBook, FiSettings , FiCheckSquare } from 'react-icons/fi';

const FILTERS = [
  { value:'toutes',  label:'Toutes',  color:'#7B6CF6', bg:'#EEEAFF' },
  { value:'haute',   label:'Haute',   color:'#E8737A', bg:'#FDEAEB' },
  { value:'moyenne', label:'Moyenne', color:'#F5A623', bg:'#FFF3DC' },
  { value:'basse',   label:'Basse',   color:'#4DBFA8', bg:'#E1F7F3' },
];

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:14,
      padding:'14px 20px', cursor:'pointer',
      color: danger ? '#e05a2b' : '#333',
      fontSize:15, fontWeight:500
    }}
    onMouseEnter={e => e.currentTarget.style.background='#f9f7f3'}
    onMouseLeave={e => e.currentTarget.style.background='transparent'}
    >
      <span style={{fontSize:20, color: danger ? '#e05a2b' : '#888'}}>{icon}</span>
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

      {/* — Top bar — */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <button className="btn-ghost" onClick={() => setShowMenu(s => !s)}>
          <FiMenu size={24} color="#2D2D3A"/>
        </button>
        <button className="btn-ghost" onClick={() => navigate('/search')}>
          <FiSearch size={24} color="#2D2D3A"/>
        </button>
      </div>

      {/* — Menu latéral — */}
      {showMenu && (
        <>
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position:'fixed', inset:0, zIndex:99,
              background:'rgba(0,0,0,0.35)'
            }}
          />
          <div style={{
            position:'fixed', top:0, left:0,
            width:'72%', height:'100vh',
            background:'#fff', zIndex:100,
            borderRadius:'0 24px 24px 0',
            boxShadow:'4px 0 24px rgba(0,0,0,0.13)',
            display:'flex', flexDirection:'column',
            animation:'slideInLeft 0.25s ease'
          }}>
            <div style={{
              background:'linear-gradient(135deg,#f5a623,#f0c050)',
              padding:'40px 20px 24px',
              borderRadius:'0 24px 0 0'
            }}>
              <div style={{
                width:56, height:56, borderRadius:'50%',
                background:'rgba(255,255,255,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontWeight:700, fontSize:20, color:'#fff', marginBottom:10
              }}>
                {initials}
              </div>
              <div style={{color:'#fff', fontWeight:700, fontSize:18}}>{username}</div>
              <div style={{color:'rgba(255,255,255,0.8)', fontSize:13}}>{user?.email}</div>
            </div>

            <div style={{flex:1, padding:'12px 0'}}>
              <MenuItem icon={<FiHome/>}     label="Accueil"          onClick={() => { navigate('/');         setShowMenu(false); }} />
              <MenuItem icon={<FiCalendar/>}     label="Agenda"        onClick={() => { navigate('/calendar');    setShowMenu(false); }} />
               <MenuItem icon={<FiCheckSquare/>}     label="Taches"          onClick={() => { navigate('/tasks');         setShowMenu(false); }} />
              <hr style={{border:'none', borderTop:'1px solid #f0ede6', margin:'8px 16px'}}/>
              <MenuItem icon={<FiLogOut/>}   label="Se déconnecter"   danger
                onClick={() => { logout(); navigate('/login'); setShowMenu(false); }} />
            </div>
          </div>
        </>
      )}

      {/* ── Profile banner ── */}
      <div style={{
        background:'linear-gradient(135deg,#F5A623,#F7C55A)',
        borderRadius:22, padding:'22px 20px',
        display:'flex', alignItems:'center', gap:16, marginBottom:28,
        boxShadow:'0 8px 24px rgba(245,166,35,0.28)',
      }}>
        <div style={{
          width:56, height:56, borderRadius:'50%',
          background:'rgba(255,255,255,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center',
          border:'2.5px solid rgba(255,255,255,0.65)',
          fontSize:18, fontWeight:900, color:'white', flexShrink:0,
        }}>{initials}</div>
        <div style={{ flex:1 }}>
          <div style={{ color:'white', fontWeight:900, fontSize:17 }}>{username}</div>
          <div style={{ color:'rgba(255,255,255,0.85)', fontSize:12, fontWeight:700, marginTop:2 }}>
            {stats.total} note{stats.total !== 1 ? 's' : ''} au total
          </div>
        </div>
        <button onClick={() => navigate('/calendar')} style={{
          background:'rgba(255,255,255,0.25)', borderRadius:12, padding:10,
          display:'flex', alignItems:'center', border:'1.5px solid rgba(255,255,255,0.5)',
          cursor:'pointer',
        }}>
          <FiCalendar size={20} color="white"/>
        </button>
      </div>

      {/* ── Stats cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:28 }}>
        {[
          { label:'Haute',   value:stats.haute,   color:'#E8737A', bg:'#FDEAEB' },
          { label:'Moyenne', value:stats.moyenne, color:'#F5A623', bg:'#FFF3DC' },
          { label:'Basse',   value:stats.basse,   color:'#4DBFA8', bg:'#E1F7F3' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'14px 12px', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, fontWeight:800, color:'#9B9BAD', marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display:'flex', gap:8, marginBottom:20, overflowX:'auto', paddingBottom:4 }}>
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer',
            fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:12, whiteSpace:'nowrap',
            background: filter === f.value ? f.bg : 'white',
            color: filter === f.value ? f.color : '#9B9BAD',
            boxShadow: filter === f.value ? `0 0 0 2px ${f.color}` : '0 1px 4px rgba(0,0,0,0.06)',
            transition:'all 0.18s', flexShrink:0,
          }}>{f.label}</button>
        ))}
      </div>

      {/* ── Notes list ── */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontWeight:800, fontSize:17, color:'#2D2D3A' }}>Mes Notes</span>
          <button onClick={handleNew} style={{
            display:'flex', alignItems:'center', gap:6,
            background:'linear-gradient(135deg,#F5A623,#F7C55A)',
            border:'none', borderRadius:12, padding:'9px 14px',
            color:'white', fontWeight:800, fontSize:13,
            fontFamily:'Nunito,sans-serif', cursor:'pointer',
            boxShadow:'0 4px 14px rgba(245,166,35,0.3)',
          }}>
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
          <div className="modal-sheet" style={{ padding:'28px 24px 36px' }}>
            <div className="modal-handle"/>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🗑️</div>
              <h3 style={{ fontWeight:900, fontSize:18, color:'#2D2D3A', marginBottom:8 }}>Supprimer la note ?</h3>
              <p style={{ color:'#9B9BAD', fontSize:14, fontWeight:600, lineHeight:1.5 }}>
                «{confirmDel.title}» sera définitivement supprimée.
              </p>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmDel(null)} className="btn-secondary" style={{ flex:1 }}>Annuler</button>
              <button onClick={handleDelete} style={{
                flex:1, background:'linear-gradient(135deg,#E8737A,#C9565D)',
                color:'white', border:'none', borderRadius:12, padding:'15px',
                fontWeight:800, fontSize:15, fontFamily:'Nunito,sans-serif',
                cursor:'pointer', boxShadow:'0 6px 20px rgba(232,115,122,0.35)',
              }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  );
}