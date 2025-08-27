import React, { useEffect, useState } from 'react';

export default function GiftHistory({ username }) {
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const [sRes, rRes] = await Promise.all([
        fetch(`http://localhost:3001/users/${encodeURIComponent(username)}/gifts/sent`),
        fetch(`http://localhost:3001/users/${encodeURIComponent(username)}/gifts/received`)
      ]);
      const s = await sRes.json();
      const r = await rRes.json();
      if (!sRes.ok) throw new Error(s.error || 'Failed to load sent');
      if (!rRes.ok) throw new Error(r.error || 'Failed to load received');
      setSent(Array.isArray(s.sent) ? s.sent : []);
      setReceived(Array.isArray(r.received) ? r.received : []);
    } catch (e) {
      setError(e.message || 'Error loading history');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (username) load(); }, [username]);

  const List = ({ rows, kind }) => (
    <ul className="list-group">
      {rows.length === 0 && <li className="list-group-item text-muted">No {kind} yet.</li>}
      {rows.map((g, i) => (
        <li key={i} className="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <div><strong>{g.code}</strong>{g.message ? ` — ${g.message}` : ''}</div>
            <small className="text-secondary">
              {kind === 'sent'
                ? <>To <strong>{g.to}</strong></>
                : <>From <strong>{g.from}</strong></>
              } · {new Date(g.sentAt).toLocaleString()}
            </small>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">Coupon History</h5>
          <div className="btn-group" role="group" aria-label="History tabs">
            <button className={`btn btn-sm ${tab==='received'?'btn-primary':'btn-outline-primary'}`} onClick={()=>setTab('received')}>Received</button>
            <button className={`btn btn-sm ${tab==='sent'?'btn-primary':'btn-outline-primary'}`} onClick={()=>setTab('sent')}>Sent</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={load} title="Refresh">Refresh</button>
          </div>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : (
          <>
            {tab === 'received' ? <List rows={received} kind="received" /> : <List rows={sent} kind="sent" />}
          </>
        )}
      </div>
    </div>
  );
}
