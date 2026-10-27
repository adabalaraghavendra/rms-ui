import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../../api/client';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 10;
const EMPTY = { name: '', email: '', password: '', role: 'user' };

export default function AdminMembers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [f, setF] = useState(EMPTY);
  const [error, setError] = useState('');

  const load = useCallback(() => api.get('/users', { params: { page, page_size: PAGE_SIZE } })
    .then((r) => {
      if (!r.data.length && page > 1) return setPage(page - 1); // last member of the page was removed
      setUsers(r.data); setPagination(r.pagination);
    }).catch((e) => setError(errMsg(e))), [page]);
  useEffect(() => { load(); }, [load]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault(); setError('');
    try { await api.post('/users', f); setF(EMPTY); load(); }
    catch (err) { setError(errMsg(err)); }
  };
  const toggle = async (u) => {
    try { await api.patch(`/users/${u.id}`, { isActive: !u.is_active }); load(); } catch (err) { setError(errMsg(err)); }
  };
  const remove = async (u) => {
    if (!confirm(`Permanently delete ${u.name}?\n\nThis also deletes all their expenses and rent shares and cannot be undone. Use Deactivate instead to keep their history.`)) return;
    try { await api.delete(`/users/${u.id}`); load(); } catch (err) { setError(errMsg(err)); }
  };
  const resetPw = async (u) => {
    const password = prompt(`New password for ${u.name} (min 6 chars):`);
    if (!password) return;
    try { await api.patch(`/users/${u.id}`, { password }); alert('Password updated'); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <h2>Members</h2>
      {error && <p className="error">{error}</p>}
      <form className="card form-grid" onSubmit={add}>
        <h3>Add member</h3>
        <label>Name<input required value={f.name} onChange={set('name')} /></label>
        <label>Email<input required type="email" value={f.email} onChange={set('email')} /></label>
        <label>Password<input required minLength={6} type="text" value={f.password} onChange={set('password')} /></label>
        <label>Role<select value={f.role} onChange={set('role')}><option value="user">User</option><option value="admin">Admin</option></select></label>
        <div className="wide"><button className="btn">Add member</button></div>
      </form>
      <div className="card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td>{u.is_active ? <span className="pos">Active</span> : <span className="neg">Inactive</span>}</td>
                <td className="actions">
                  <button className="btn small ghost" onClick={() => resetPw(u)}>Reset password</button>
                  <button className="btn small ghost" onClick={() => toggle(u)}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                  {u.id !== me.id && <button className="btn small danger" onClick={() => remove(u)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination pagination={pagination} onPage={setPage} />
      </div>
    </>
  );
}
