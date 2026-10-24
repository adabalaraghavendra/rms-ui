import { useEffect, useState } from 'react';
import api, { errMsg, money, thisMonth } from '../../api/client';

export default function AdminDashboard() {
  const [month, setMonth] = useState(thisMonth());
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/summary', { params: { month } }).then((r) => { setData(r.data); setError(''); }).catch((e) => setError(errMsg(e)));
  }, [month]);

  return (
    <>
      <div className="row between">
        <h2>Overview</h2>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <div className="stats">
            <div className="stat"><span>Total maintenance spend</span><b>{money(data.totalSpent)}</b></div>
            <div className="stat"><span>Total rent</span><b>{money(data.totalRent)}</b></div>
            <div className="stat"><span>Members</span><b>{data.members.length}</b></div>
          </div>
          <div className="card">
            <p className="muted small">Fair share = total maintenance ÷ members. Balance = spent − fair share (positive: the room owes them; negative: they owe the room).</p>
            <table>
              <thead><tr><th>Member</th><th className="num">Spent</th><th className="num">Fair share</th><th className="num">Balance</th><th className="num">Rent</th><th className="num">Total due</th></tr></thead>
              <tbody>
                {data.members.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}<div className="muted small">{m.email}</div></td>
                    <td className="num">{money(m.spent)}</td>
                    <td className="num">{money(m.fair_share)}</td>
                    <td className={`num ${m.balance >= 0 ? 'pos' : 'neg'}`}>{m.balance >= 0 ? '+' : ''}{money(m.balance)}</td>
                    <td className="num">{money(m.rent)}</td>
                    <td className="num"><b>{money(m.rent - m.balance)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="muted small">Total due = rent share − balance (what the person should pay/settle for the month).</p>
          </div>
        </>
      )}
    </>
  );
}
