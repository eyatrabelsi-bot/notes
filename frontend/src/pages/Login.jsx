import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/notes');
    } catch (err) {
      setError(
        err.response?.data?.errors?.email?.[0] ??
        err.response?.data?.message ??
        'Email ou mot de passe incorrect.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__inner">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" fillOpacity=".9"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="auth-logo__title">Notes Personnelles</h1>
          <p className="auth-logo__subtitle">
            Connectez-vous pour accéder à vos notes
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 className="auth-card__heading">Connexion</h2>

          {error && (
            <div className="auth-error slide-down">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {/* Email */}
            <div>
              <label className="field-label">Email</label>
              <div className="field-icon-wrap">
                <FiMail size={17} color="#9B9BAD" className="field-icon" />
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="votre@email.com"
                  className="field-input field-input--icon-left"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Mot de passe</label>
              <div className="field-icon-wrap">
                <FiLock size={17} color="#9B9BAD" className="field-icon" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="field-input field-input--icon-left field-input--icon-right"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="field-icon-btn">
                  {showPwd ? <FiEyeOff size={17}/> : <FiEye size={17}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary auth-submit">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="auth-card__footer">
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-card__link">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}