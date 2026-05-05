const PRIORITY_CONFIG = {
  haute:   { label: 'Haute',   class: 'bg-rose-100 text-rose-700 border border-rose-200' },
  moyenne: { label: 'Moyenne', class: 'bg-amber-100 text-amber-700 border border-amber-200' },
  basse:   { label: 'Basse',   class: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function NoteItem({ note, onEdit, onDelete }) {
  const priority = PRIORITY_CONFIG[note.priority] ?? PRIORITY_CONFIG.basse;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* En-tête : titre + badge priorité */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800 text-base leading-snug flex-1 line-clamp-2">
          {note.title}
        </h3>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full ${priority.class}`}>
          {priority.label}
        </span>
      </div>

      {/* Contenu */}
      {note.content && (
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
          {note.content}
        </p>
      )}

      {/* Pied : date + actions */}
      <div className="flex items-center justify-between pt-1 mt-auto">
        <span className="text-xs text-slate-400">{formatDate(note.created_at)}</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors font-medium"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(note)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700 transition-colors font-medium"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}