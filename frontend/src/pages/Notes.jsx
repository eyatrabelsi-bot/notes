import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import NoteList from '../components/NoteList';
import NoteForm from '../components/NoteForm';
import Toast from '../components/Toast';

const FILTERS = [
  { value: 'toutes',  label: 'Toutes' },
  { value: 'haute',   label: '🔴 Haute' },
  { value: 'moyenne', label: '🟠 Moyenne' },
  { value: 'basse',   label: '🟢 Basse' },
];

export default function Notes() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();

  const [notes, setNotes]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter]         = useState('toutes');
  const [toast, setToast]           = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // note à supprimer

  const showToast = (message, type = 'success') =>
    setToast({ message, type });

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } catch {
      showToast('Impossible de charger les notes.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (note) => setDeleteModal(note);

  const confirmDelete = async () => {
    try {
      await api.delete(`/notes/${deleteModal.id}`);
      showToast('Note supprimée.', 'success');
      setDeleteModal(null);
      fetchNotes();
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal de confirmation suppression */}
      {deleteModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-slate-800 mb-2">Confirmer la suppression</h3>
            <p className="text-slate-500 text-sm mb-5">
              Voulez-vous vraiment supprimer{' '}
              <span className="font-medium text-slate-700">« {deleteModal.title} »</span> ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <span className="font-bold text-slate-800 text-base">Notes Personnelles</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">
              Bonjour, <span className="font-medium text-slate-700">{user?.name}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sidebar : formulaire */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-20">
            <h2 className="font-semibold text-slate-800 mb-4">
              {editingNote ? '✏️ Modifier la note' : '➕ Nouvelle note'}
            </h2>
            <NoteForm
              editingNote={editingNote}
              onSaved={() => { setEditingNote(null); fetchNotes(); }}
              onCancel={() => setEditingNote(null)}
              showToast={showToast}
            />
          </div>
        </aside>

        {/* Zone notes */}
        <section className="lg:col-span-2">
          {/* En-tête + filtres */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="font-semibold text-slate-800">
              Mes notes{' '}
              <span className="text-slate-400 font-normal text-sm">({notes.length})</span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors
                    ${filter === f.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <NoteList
            notes={notes}
            filter={filter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </section>
      </main>
    </div>
  );
}