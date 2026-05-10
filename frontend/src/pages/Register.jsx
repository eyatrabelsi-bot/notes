import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import logo from '../assets/logo.png';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name:'', email:'', password:'', password_confirmation:'' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate('/notes');
    } catch (err) {
      const api = err.response?.data?.errors;
      if (api) {
        const mapped = {};
        Object.entries(api).forEach(([field, msgs]) => { mapped[field] = msgs[0]; });
        setErrors(mapped);
      } else {
        setErrors({ general: "Erreur lors de l'inscription." });
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key:'name',                  label:"Nom d'utilisateur",          type:'text',     icon:<FiUser size={17}/>,  placeholder:'tapez votre nom' },
    { key:'email',                 label:'Email',                      type:'email',    icon:<FiMail size={17}/>,  placeholder:'votre@email.com' },
    { key:'password',              label:'Mot de passe',               type:'password', icon:<FiLock size={17}/>,  placeholder:'Min. 8 caractères', pwd:true },
    { key:'password_confirmation', label:'Confirmer le mot de passe',  type:'password', icon:<FiLock size={17}/>,  placeholder:'Répétez le mot de passe' },
  ];

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
          <p className="auth-logo__subtitle">Créez votre compte gratuitement</p>
        </div>

        <div className="auth-card">
          <h2 className="auth-card__heading">Inscription</h2>

          {errors.general && (
            <div className="auth-error-banner slide-down">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            {fields.map(({ key, label, type, icon, placeholder, pwd }) => (
              <div key={key} className="auth-form__field">
                <label className="field-label">{label}</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-wrap__icon">{icon}</span>
                  <input
                     type={pwd ? (showPwd ? 'text' : 'password') : type}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className={`field-input auth-input-wrap__input${errors[key] ? ' error' : ''}${pwd ? ' auth-input-wrap__input--pwd' : ''}`}
                  />
                  {pwd && (
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      className="auth-input-wrap__eye-btn"
                    >
                      {showPwd ? <FiEyeOff size={17}/> : <FiEye size={17}/>}
                    </button>
                  )}
                </div>
                {errors[key] && (
                  <p className="auth-form__field-error">{errors[key]}</p>
                )}
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary auth-form__submit">
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <p className="auth-card__footer">
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-card__footer-link">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}