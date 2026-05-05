import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/notes');
    } catch (err) {
      const msg = err.response?.data?.errors?.email?.[0]
        ?? err.response?.data?.message
        ?? 'Erreur de connexion.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl shadow-lg mb-3">
            📝
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Notes Personnelles</h1>
          <p className="text-slate-500 text-sm mt-1">Connectez-vous pour accéder à vos notes</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-6">Connexion</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="mt-2 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm
                hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}