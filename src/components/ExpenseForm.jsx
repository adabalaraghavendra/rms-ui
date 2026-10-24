import { useState } from 'react';
import api, { errMsg } from '../api/client';

export const CATEGORIES = ['Groceries', 'Electricity', 'Water', 'Internet', 'Gas', 'Cleaning', 'Repairs', 'Furniture', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ initial, onSaved, onCancel }) {
  const [f, setF] = useState(initial || { title: '', category: 'Groceries', amount: '', expenseDate: today(), note: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (initial?.id) await api.put(`/expenses/${initial.id}`, f);
      else await api.post('/expenses', f);
      onSaved();
      if (!initial?.id) setF({ ...f, title: '', amount: '', note: '' });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form className="card form-grid" onSubmit={submit}>
      <h3>{initial?.id ? 'Edit expense' : 'Add expense'}</h3>
      <label>Title<input required value={f.title} onChange={set('title')} placeholder="e.g. Vegetables" /></label>
      <label>Category
        <select value={f.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </label>
      <label>Amount<input required type="number" min="0.01" step="0.01" value={f.amount} onChange={set('amount')} /></label>
      <label>Date<input required type="date" value={f.expenseDate} onChange={set('expenseDate')} /></label>
      <label className="wide">Note<input value={f.note || ''} onChange={set('note')} placeholder="optional" /></label>
      {error && <p className="error wide">{error}</p>}
      <div className="wide row">
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
