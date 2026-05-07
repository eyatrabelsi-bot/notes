import NoteItem from './NoteItem';

export default function NoteList({ notes, filter, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height:110, animationDelay:`${i*0.12}s` }} />
        ))}
      </div>
    );
  }

  const filtered = filter === 'toutes' ? notes : notes.filter(n => n.priority === filter);

  if (filtered.length === 0) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'48px 0', gap:12 }}>
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background:'white',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:32, boxShadow:'0 4px 16px rgba(0,0,0,0.07)',
        }}>📝</div>
        <p style={{ color:'#9B9BAD', fontSize:14, fontWeight:700, textAlign:'center' }}>
          {filter !== 'toutes' ? `Aucune note de priorité "${filter}"` : 'Aucune note pour l\'instant'}
        </p>
        <p style={{ color:'#C4C4D0', fontSize:13, fontWeight:600 }}>
          Appuyez sur + pour en créer une
        </p>
      </div>
    );
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12 }}>
      {filtered.map(note => (
        <NoteItem key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}