import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, money, thisMonth } from '../../api/client';
import ExpenseForm from '../../components/ExpenseForm';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

export default function MyExpenses() {
  const [month, setMonth] = useState(thisMonth());
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [e, s] = await Promise.all([
        api.get('/expenses/mine', { params: { month, page, page_size: PAGE_SIZE } }),
        api.get('/summary/mine', { params: { month } }),
      ]);
      if (!e.data.length && page > 1) return setPage(page - 1); // last item of the page was removed
      setRows(e.data); setPagination(e.pagination); setSummary(s.data); setError('');
    } catch (err) { setError(errMsg(err)); }
  }, [month, page]);
  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); load(); } catch (err) { setError(errMsg(err)); }
  };

  return (
    <>
      <div className="row between">
        <h2>My Expenses</h2>
        <input type="month" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }} />
      </div>
      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div className="stat"><span>Total I spent</span><b>{money(summary?.totalSpent)}</b></div>
        <div className="stat"><span>My rent share</span><b>{summary?.rent == null ? 'Not set yet' : money(summary.rent)}</b></div>
        {summary?.byCategory.map((c) => <div className="stat" key={c.category}><span>{c.category}</span><b>{money(c.total)}</b></div>)}
      </div>

      {editing
        ? <ExpenseForm key={editing.id} initial={editing} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
        : <ExpenseForm onSaved={() => { setPage(1); load(); }} />}

      <div className="card">
        <table>
          <thead><tr><th>Date</th><th>Title</th><th>Category</th><th className="num">Amount</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.expense_date}</td><td>{r.title}{r.note && <div className="muted small">{r.note}</div>}</td><td>{r.category}</td>
                <td className="num">{money(r.amount)}</td>
                <td className="actions">
                  <button className="btn small ghost" onClick={() => { setEditing({ id: r.id, title: r.title, category: r.category, amount: r.amount, expenseDate: r.expense_date, note: r.note }); window.scrollTo(0, 0); }}>Edit</button>
                  <button className="btn small danger" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="5" className="muted center">No expenses this month</td></tr>}
          </tbody>
        </table>
        <Pagination pagination={pagination} onPage={setPage} />
      </div>
    </>
  );
}
