import { useState } from 'react';
import api, { errMsg } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [p, setP] = useState({ name: user.name, email: user.email });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pMsg, setPMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.patch('/auth/profile', p);
      setUser(data);
      setPMsg({ type: 'ok', text: 'Profile updated' });
    } catch (err) { setPMsg({ type: 'error', text: errMsg(err) }); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return setPwMsg({ type: 'error', text: 'New passwords do not match' });
    try {
      await api.post('/auth/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg({ type: 'ok', text: 'Password changed' });
    } catch (err) { setPwMsg({ type: 'error', text: errMsg(err) }); }
  };

  return (
    <>
      <h2>My Profile <span className="muted small">({user.role})</span></h2>

      <form className="card form-grid" onSubmit={saveProfile}>
        <h3>Account details</h3>
        <label>Name<input required value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></label>
        <label>Email (used to log in)<input required type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /></label>
        {pMsg.text && <p className={`wide ${pMsg.type === 'ok' ? 'pos' : 'error'}`}>{pMsg.text}</p>}
        <div className="wide"><button className="btn">Save details</button></div>
      </form>

      <form className="card form-grid" onSubmit={savePassword}>
        <h3>Change password</h3>
        <label>Current password<input required type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
        <label>New password<input required minLength={6} type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
        <label>Confirm new password<input required minLength={6} type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></label>
        {pwMsg.text && <p className={`wide ${pwMsg.type === 'ok' ? 'pos' : 'error'}`}>{pwMsg.text}</p>}
        <div className="wide"><button className="btn">Change password</button></div>
      </form>
    </>
  );
}
