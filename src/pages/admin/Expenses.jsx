import { useCallback, useEffect, useState } from 'react';
import api, { ALL, errMsg, money, thisMonth } from '../../api/client';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

export default function AdminExpenses() {
  const [month, setMonth] = useState(thisMonth());
  const [userId, setUserId] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/users', { params: ALL }).then((r) => setUsers(r.data)).catch((e) => setError(errMsg(e))); }, []);

  const load = useCallback(() => api.get('/expenses', {
    params: { month: month || undefined, userId: userId || undefined, page, page_size: PAGE_SIZE },
  }).then((r) => {
    if (!r.data.length && page > 1) return setPage(page - 1); // last item of the page was removed
    setRows(r.data); setPagination(r.pagination); setError('');
  }).catch((e) => setError(errMsg(e))), [month, userId, page]);
  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };
  const pageTotal = rows.reduce((a, r) => a + r.amount, 0);

  return (
    <>
      <div className="row between">
        <h2>All Expenses</h2>
        <div className="row">
          <select value={userId} onChange={(e) => { setUserId(e.target.value); setPage(1); }}>
            <option value="">Everyone</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }} />
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Date</th><th>Person</th><th>Title</th><th>Category</th><th className="num">Amount</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.expense_date}</td><td>{r.user_name}</td><td>{r.title}</td><td>{r.category}</td>
                <td className="num">{money(r.amount)}</td>
                <td className="actions"><button className="btn small danger" onClick={() => remove(r.id)}>Delete</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="6" className="muted center">No expenses found</td></tr>}
          </tbody>
          {!!rows.length && <tfoot><tr><td colSpan="4"><b>Total on this page</b></td><td className="num"><b>{money(pageTotal)}</b></td><td /></tr></tfoot>}
        </table>
        <Pagination pagination={pagination} onPage={setPage} />
      </div>
    </>
  );
}
