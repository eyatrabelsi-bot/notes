import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const EMPTY_FORM = { title: '', content: '', priority: 'moyenne' };

export default function NoteForm({ editingNote, onSaved, onCancel, showToast }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  // Pré-remplir le formulaire lors de l'édition
  useEffect(() => {
    if (editingNote) {
      setForm({
        title:    editingNote.title,
        content:  editingNote.content ?? '',
        priority: editingNote.priority,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingNote]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation côté client
    if (!form.title.trim()) {
      setErrors({ title: 'Le titre est obligatoire.' });
      return;
    }

    setLoading(true);
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, form);
        showToast('Note modifiée avec succès !', 'success');
      } else {
        await api.post('/notes', form);
        showToast('Note créée avec succès !', 'success');
      }
      setForm(EMPTY_FORM);
      onSaved();
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        // Récupérer les erreurs de validation Laravel (422)
        const mapped = {};
        Object.entries(apiErrors).forEach(([field, msgs]) => {
          mapped[field] = msgs[0];
        });
        setErrors(mapped);
      } else {
        showToast("Une erreur s'est produite.", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Titre <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          maxLength={100}
          placeholder="Titre de la note…"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
            ${errors.title
              ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
              : 'border-slate-200 bg-white focus:border-indigo-400'}`}
        />
        {errors.title && (
          <p className="text-rose-500 text-xs mt-1">{errors.title}</p>
        )}
        <p className="text-xs text-slate-400 mt-1 text-right">{form.title.length}/100</p>
      </div>

      {/* Contenu */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={4}
          placeholder="Contenu de la note (optionnel)…"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
            outline-none focus:border-indigo-400 transition-colors resize-none"
        />
      </div>

      {/* Priorité */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
            outline-none focus:border-indigo-400 transition-colors cursor-pointer"
        >
          <option value="basse">🟢 Basse</option>
          <option value="moyenne">🟠 Moyenne</option>
          <option value="haute">🔴 Haute</option>
        </select>
      </div>

      {/* Boutons */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold
            hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement…' : editingNote ? 'Mettre à jour' : 'Ajouter la note'}
        </button>
        {editingNote && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm
              font-medium hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}