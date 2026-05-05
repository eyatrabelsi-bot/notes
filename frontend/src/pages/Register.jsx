import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate('/notes');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        Object.entries(apiErrors).forEach(([field, msgs]) => { mapped[field] = msgs[0]; });
        setErrors(mapped);
      } else {
        setErrors({ general: 'Erreur lors de l\'inscription.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type} name={name} value={form[name]}
        onChange={handleChange} required placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
          ${errors[name] ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-indigo-400'}`}
      />
      {errors[name] && <p className="text-rose-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl shadow-lg mb-3">
            📝
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Notes Personnelles</h1>
          <p className="text-slate-500 text-sm mt-1">Créez votre compte gratuitement</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-6">Inscription</h2>

          {errors.general && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Field name="name" label="Nom d'utilisateur" placeholder="Jean Dupont" />
            <Field name="email" label="Email" type="email" placeholder="votre@email.com" />
            <Field name="password" label="Mot de passe" type="password" placeholder="Min. 8 caractères" />
            <Field name="password_confirmation" label="Confirmer le mot de passe" type="password" placeholder="Répétez le mot de passe" />

            <button
              type="submit" disabled={loading}
              className="mt-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}