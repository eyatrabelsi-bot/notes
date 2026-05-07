import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

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
    { key:'name',                  label:"Nom d'utilisateur",       type:'text',     icon:<FiUser size={17}/>,  placeholder:'Jean Dupont' },
    { key:'email',                 label:'Email',                   type:'email',    icon:<FiMail size={17}/>,  placeholder:'votre@email.com' },
    { key:'password',              label:'Mot de passe',            type:'password', icon:<FiLock size={17}/>,  placeholder:'Min. 8 caractères', pwd:true },
    { key:'password_confirmation', label:'Confirmer le mot de passe', type:'password', icon:<FiLock size={17}/>, placeholder:'Répétez le mot de passe' },
  ];

  return (
    <div className="auth-page">
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            width:68, height:68, borderRadius:20,
            background:'linear-gradient(135deg,#F5A623,#F7C55A)',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            marginBottom:14, boxShadow:'0 8px 24px rgba(245,166,35,0.35)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="white" fillOpacity=".9"/>
              <path d="M7 8h10M7 12h10M7 16h6" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize:24, fontWeight:900, color:'#2D2D3A', marginBottom:6 }}>Notes Personnelles</h1>
          <p style={{ fontSize:14, color:'#9B9BAD', fontWeight:600 }}>Créez votre compte gratuitement</p>
        </div>

        <div className="auth-card">
          <h2 style={{ fontSize:18, fontWeight:800, color:'#2D2D3A', marginBottom:24 }}>Inscription</h2>

          {errors.general && (
            <div className="slide-down" style={{ background:'#FDEAEB', border:'1.5px solid #E8737A', borderRadius:12, padding:'12px 16px', color:'#E8737A', fontSize:13, fontWeight:700, marginBottom:20 }}>
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {fields.map(({ key, label, type, icon, placeholder, pwd }) => (
              <div key={key}>
                <label className="field-label">{label}</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#9B9BAD', display:'flex', pointerEvents:'none' }}>
                    {icon}
                  </span>
                  <input
                    type={pwd && !showPwd ? 'password' : type === 'password' && !pwd ? 'password' : type}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    placeholder={placeholder}
                    className={`field-input${errors[key] ? ' error' : ''}`}
                    style={{ paddingLeft:42, paddingRight: pwd ? 44 : 16 }}
                  />
                  {pwd && (
                    <button type="button" onClick={() => setShowPwd(s => !s)}
                      style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9B9BAD', display:'flex' }}>
                      {showPwd ? <FiEyeOff size={17}/> : <FiEye size={17}/>}
                    </button>
                  )}
                </div>
                {errors[key] && <p style={{ color:'#E8737A', fontSize:12, fontWeight:700, marginTop:5 }}>{errors[key]}</p>}
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop:6 }}>
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:14, color:'#9B9BAD', marginTop:24, fontWeight:600 }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color:'#F5A623', fontWeight:800, textDecoration:'none' }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}