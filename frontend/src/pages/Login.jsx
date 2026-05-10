import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../assets/logo.png';

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
            <img src={logo} alt="The writing room" 
            style={{ 
              width: 64, 
              height: 64, 
              objectFit: 'cover',  // ← change 'contain' en 'cover'
              borderRadius: 16 
            }} />
          </div>
          <h1 className="auth-logo__title">The writing room</h1>
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