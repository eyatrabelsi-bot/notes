import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { FiX } from 'react-icons/fi';

const EMPTY = { title: '', content: '', priority: 'moyenne' };

const PRIORITIES = [
  { value: 'haute',   label: 'Haute',   color: '#E8737A', bg: '#FDEAEB' },
  { value: 'moyenne', label: 'Moyenne', color: '#F5A623', bg: '#FFF3DC' },
  { value: 'basse',   label: 'Basse',   color: '#4DBFA8', bg: '#E1F7F3' },
];

export default function NoteForm({ editingNote, onSaved, onCancel, showToast }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editingNote
      ? { title: editingNote.title, content: editingNote.content ?? '', priority: editingNote.priority }
      : EMPTY
    );
    setErrors({});
  }, [editingNote]);

  const handle = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErrors({ title: 'Le titre est obligatoire.' }); return; }
    setLoading(true);
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, form);
        showToast('Note modifiée !', 'success');
      } else {
        await api.post('/notes', form);
        showToast('Note créée !', 'success');
      }
      setForm(EMPTY);
      onSaved();
    } catch (err) {
      const api_errs = err.response?.data?.errors;
      if (api_errs) {
        const mapped = {};
        Object.entries(api_errs).forEach(([f, msgs]) => { mapped[f] = msgs[0]; });
        setErrors(mapped);
      } else {
        showToast("Une erreur s'est produite.", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:18 }}>
      {/* Handle + close */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <h3 style={{ fontSize:18, fontWeight:800, color:'#2D2D3A' }}>
          {editingNote ? 'Modifier la note' : 'Nouvelle note'}
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            <FiX size={20} color="#9B9BAD"/>
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="field-label">Titre *</label>
        <input
          type="text" value={form.title} maxLength={100}
          onChange={e => handle('title', e.target.value)}
          placeholder="Titre de la note…"
          className={`field-input${errors.title ? ' error' : ''}`}
        />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
          {errors.title
            ? <span style={{ color:'#E8737A', fontSize:12, fontWeight:700 }}>{errors.title}</span>
            : <span/>
          }
          <span style={{ color:'#9B9BAD', fontSize:11, fontWeight:600 }}>{form.title.length}/100</span>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="field-label">Contenu</label>
        <textarea
          value={form.content}
          onChange={e => handle('content', e.target.value)}
          rows={4}
          placeholder="Contenu de la note (optionnel)…"
          className="field-input"
          style={{ resize:'none', lineHeight:1.6 }}
        />
      </div>

      {/* Priority */}
      <div>
        <label className="field-label">Priorité</label>
        <div style={{ display:'flex', gap:8 }}>
          {PRIORITIES.map(p => (
            <button
              key={p.value} type="button"
              onClick={() => handle('priority', p.value)}
              style={{
                flex:1, padding:'10px 6px', borderRadius:12, border:'none', cursor:'pointer',
                fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:12,
                background: form.priority === p.value ? p.bg : '#F4F2EE',
                color: form.priority === p.value ? p.color : '#9B9BAD',
                boxShadow: form.priority === p.value ? `0 0 0 2px ${p.color}` : 'none',
                transition:'all 0.18s',
              }}
            >
              {p.value === 'haute' ? '🔴' : p.value === 'moyenne' ? '🟠' : '🟢'} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display:'flex', gap:10, marginTop:4 }}>
        <button type="submit" disabled={loading} className="btn-primary" style={{ flex:1 }}>
          {loading ? 'Enregistrement…' : editingNote ? 'Mettre à jour' : 'Ajouter la note'}
        </button>
      </div>
    </form>
  );
}