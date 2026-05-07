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
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: 'linear-gradient(135deg,#F5A623,#F7C55A)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
            boxShadow: '0 8px 24px rgba(245,166,35,0.35)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" fillOpacity=".9"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#2D2D3A', marginBottom: 6 }}>
            Notes Personnelles
          </h1>
          <p style={{ fontSize: 14, color: '#9B9BAD', fontWeight: 600 }}>
            Connectez-vous pour accéder à vos notes
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#2D2D3A', marginBottom: 24 }}>
            Connexion
          </h2>

          {error && (
            <div className="slide-down" style={{
              background: '#FDEAEB', border: '1.5px solid #E8737A',
              borderRadius: 12, padding: '12px 16px',
              color: '#E8737A', fontSize: 13, fontWeight: 700, marginBottom: 20,
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label className="field-label">Email</label>
              <div style={{ position: 'relative' }}>
                <FiMail size={17} color="#9B9BAD" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="votre@email.com"
                  className="field-input"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <FiLock size={17} color="#9B9BAD" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="••••••••"
                  className="field-input"
                  style={{ paddingLeft: 42, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9B9BAD', display:'flex' }}>
                  {showPwd ? <FiEyeOff size={17}/> : <FiEye size={17}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 4 }}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:14, color:'#9B9BAD', marginTop:24, fontWeight:600 }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color:'#F5A623', fontWeight:800, textDecoration:'none' }}>
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}