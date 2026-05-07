import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(name, email, password, passwordConfirmation);
      navigate('/notes');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const mapped = {};
        Object.entries(apiErrors).forEach(([field, msgs]) => { mapped[field] = msgs[0]; });
        setErrors(mapped);
      } else {
        setErrors({ general: "Erreur lors de l'inscription." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl shadow-lg mb-3">📝</div>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-indigo-400'}`} />
              {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-indigo-400'}`} />
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 caractères"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${errors.password ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-indigo-400'}`} />
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} placeholder="Répétez le mot de passe"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="mt-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60">
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Déjà un compte ? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}