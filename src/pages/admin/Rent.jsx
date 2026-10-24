import { useEffect, useState } from 'react';
import api, { errMsg, money, thisMonth } from '../../api/client';

export default function AdminRent() {
  const [month, setMonth] = useState(thisMonth());
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null); // ids paying rent; null = everyone
  const [total, setTotal] = useState('');
  const [mode, setMode] = useState('equal');
  const [shares, setShares] = useState({}); // userId -> amount string
  const [saved, setSaved] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data.filter((u) => u.is_active))).catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
    api.get('/room').then((r) => setTotal((t) => t || String(Number(r.data.monthly_rent) || ''))).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/rent', { params: { month } }).then((r) => {
      setSaved(r.data.split);
      if (r.data.split) {
        setTotal(String(r.data.split.totalRent)); setMode(r.data.split.mode);
        setSelected(r.data.split.shares.map((s) => s.user_id));
        setShares(Object.fromEntries(r.data.split.shares.map((s) => [s.user_id, String(s.amount)])));
      } else { setSelected(null); setShares({}); }
    }).catch((e) => setMsg({ type: 'error', text: errMsg(e) }));
  }, [month]);

  const isOn = (id) => (selected ? selected.includes(id) : true);
  const payers = users.filter((u) => isOn(u.id));
  const toggle = (id) => {
    const cur = selected ?? users.map((u) => u.id);
    setSelected(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  const sum = payers.reduce((a, u) => a + (Number(shares[u.id]) || 0), 0);
  const diff = Math.round((Number(total || 0) - sum) * 100) / 100;
  const equalShare = payers.length ? Number(total || 0) / payers.length : 0;
  const invalid = !total || !payers.length || (mode === 'custom' && diff !== 0);

  const save = async () => {
    setMsg({ type: '', text: '' });
    try {
      await api.put('/rent', {
        month, totalRent: Number(total), mode,
        userIds: payers.map((u) => u.id),
        shares: mode === 'custom' ? payers.map((u) => ({ userId: u.id, amount: Number(shares[u.id]) || 0 })) : [],
      });
      await api.patch('/room', { monthlyRent: Number(total) });
      setMsg({ type: 'ok', text: 'Rent split saved' });
      const r = await api.get('/rent', { params: { month } });
      setSaved(r.data.split);
    } catch (err) { setMsg({ type: 'error', text: errMsg(err) }); }
  };

  return (
    <>
      <div className="row between">
        <h2>Rent Split</h2>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      <div className="card form-grid">
        <label>Total rent for {month}<input type="number" min="0" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} /></label>
        <label>Split mode
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="equal">Equal among selected members</option>
            <option value="custom">Custom amount per selected member</option>
          </select>
        </label>

        <table className="wide">
          <thead>
            <tr><th>Pays rent?</th><th>Member</th><th className="num">{mode === 'equal' ? 'Share (preview)' : 'Share'}</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={isOn(u.id) ? '' : 'muted'}>
                <td><input type="checkbox" checked={isOn(u.id)} onChange={() => toggle(u.id)} /></td>
                <td>{u.name}{u.role === 'admin' && <span className="muted small"> (admin)</span>}</td>
                <td className="num">
                  {!isOn(u.id) ? 'Not paying'
                    : mode === 'equal' ? money(equalShare)
                    : <input className="amt" type="number" min="0" step="0.01" value={shares[u.id] ?? ''} onChange={(e) => setShares({ ...shares, [u.id]: e.target.value })} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!payers.length && <p className="wide neg">Select at least one member who pays rent.</p>}
        {mode === 'custom' && !!payers.length && (
          <p className={`wide ${diff === 0 ? 'pos' : 'neg'}`}>
            Allocated {money(sum)} of {money(total)} — {diff === 0 ? 'balanced ✓' : `${money(Math.abs(diff))} ${diff > 0 ? 'left to allocate' : 'over'}`}
          </p>
        )}
        {msg.text && <p className={`wide ${msg.type === 'ok' ? 'pos' : 'error'}`}>{msg.text}</p>}
        <div className="wide"><button className="btn" onClick={save} disabled={invalid}>{saved ? 'Update split' : 'Save split'}</button></div>
      </div>

      {saved && (
        <div className="card">
          <h3>Saved split ({saved.mode}) — total {money(saved.totalRent)}</h3>
          <table>
            <tbody>{saved.shares.map((s) => <tr key={s.user_id}><td>{s.name}</td><td className="num">{money(s.amount)}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
