import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const PRIORITY = {
  haute:   { label:'Haute',   color:'#E8737A', bg:'#FDEAEB', dot:'🔴' },
  moyenne: { label:'Moyenne', color:'#F5A623', bg:'#FFF3DC', dot:'🟠' },
  basse:   { label:'Basse',   color:'#4DBFA8', bg:'#E1F7F3', dot:'🟢' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' });
}

export default function NoteItem({ note, onEdit, onDelete }) {
  const p = PRIORITY[note.priority] ?? PRIORITY.basse;

  return (
    <div className="card fade-in" style={{
      padding: '18px 18px 14px',
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.11)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=''; }}
    >
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
        <h3 style={{ flex:1, fontWeight:800, fontSize:14, color:'#2D2D3A', lineHeight:1.4, wordBreak:'break-word' }}>
          {note.title}
        </h3>
        <span className="badge" style={{ background:p.bg, color:p.color, flexShrink:0 }}>
          {p.dot} {p.label}
        </span>
      </div>

      {/* Content preview */}
      {note.content && (
        <p style={{ color:'#9B9BAD', fontSize:13, fontWeight:600, lineHeight:1.5,
          display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {note.content}
        </p>
      )}

      {/* Bottom row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #F0EEF8', paddingTop:10 }}>
        <span style={{ fontSize:11, fontWeight:700, color:'#C4C4D0' }}>
          {formatDate(note.date || note.created_at)}
        </span>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => onEdit(note)} style={{
            background:'#FFF3DC', border:'none', borderRadius:10,
            padding:'7px 12px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:5,
            color:'#F5A623', fontSize:12, fontWeight:800,
            fontFamily:'Nunito,sans-serif', transition:'opacity 0.15s',
          }}>
            <FiEdit2 size={13}/> Modifier
          </button>
          <button onClick={() => onDelete(note)} style={{
            background:'#FDEAEB', border:'none', borderRadius:10,
            padding:'7px 12px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:5,
            color:'#E8737A', fontSize:12, fontWeight:800,
            fontFamily:'Nunito,sans-serif', transition:'opacity 0.15s',
          }}>
            <FiTrash2 size={13}/> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}