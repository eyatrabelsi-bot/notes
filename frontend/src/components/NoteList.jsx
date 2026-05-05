import NoteItem from './NoteItem';

export default function NoteList({ notes, filter, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-100 rounded-2xl h-36 animate-pulse" />
        ))}
      </div>
    );
  }

  const filtered = filter === 'toutes'
    ? notes
    : notes.filter((n) => n.priority === filter);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <span className="text-5xl mb-3">📝</span>
        <p className="text-sm">Aucune note à afficher.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {filtered.map((note) => (
        <NoteItem key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}