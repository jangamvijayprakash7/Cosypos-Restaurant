import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    setMsg('We will add reset flow later.');
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 24 }}>
      <div style={{ position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center', fontWeight: 700, color: '#FAC1D9', fontSize: 28 }}>COSYPOS</div>
      <div style={{ width: '100%', maxWidth: 640, background: '#292C2D', borderRadius: 32, color: '#fff', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
        <div style={{ textAlign: 'center', fontWeight: 600, fontSize: 36, marginTop: 10 }}>Forgot your password?</div>
        <div style={{ textAlign: 'center', marginTop: 8, opacity: .9 }}>Please enter your username or email to recover your password</div>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 24, placeItems: 'center' }}>
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Username</div>
            <input placeholder="Enter your username" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: '#3D4142', color: '#fff' }} />
          </div>
          <button style={{ marginTop: 12, padding: '20px 50px', borderRadius: 10, background: '#FAC1D9', border: 'none', color: '#333', fontWeight: 600 }}>Submit Now</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'underline' }}>Back to Login!</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, opacity: .85 }}>{msg}</div>
      </div>
    </div>
  );
}


