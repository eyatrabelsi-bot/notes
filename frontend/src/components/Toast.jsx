import { useEffect } from 'react';
import { FiCheck, FiX, FiInfo } from 'react-icons/fi';

const CONFIG = {
  success: { icon: <FiCheck size={16}/>, bg: '#4DBFA8', shadow: 'rgba(77,191,168,0.4)' },
  error:   { icon: <FiX    size={16}/>, bg: '#E8737A', shadow: 'rgba(232,115,122,0.4)' },
  info:    { icon: <FiInfo size={16}/>, bg: '#7B6CF6', shadow: 'rgba(123,108,246,0.4)' },
};

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const { icon, bg, shadow } = CONFIG[type] ?? CONFIG.info;

  return (
    <div className="toast-in" style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: bg, color: 'white',
      padding: '13px 18px', borderRadius: 16,
      fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 700,
      boxShadow: `0 8px 28px ${shadow}`,
      maxWidth: 320,
    }}>
      <span style={{ display:'flex', alignItems:'center', flexShrink:0 }}>{icon}</span>
      <span style={{ flex:1, lineHeight:1.4 }}>{message}</span>
      <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.7)', display:'flex', padding:0, marginLeft:4 }}>
        <FiX size={16}/>
      </button>
    </div>
  );
}