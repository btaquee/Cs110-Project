
import { useEffect, useMemo, useState } from 'react';

function Coupons({ user }) {
  const [catalog, setCatalog] = useState([]);     // personalized, sendable items for this user
  const [myCoupons, setMyCoupons] = useState([]); // includes private + any favorites I've got
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState({}); // code -> friend username
  const [sentTo, setSentTo] = useState({});                 // code -> friend just sent


  useEffect(() => {
    fetch(`http://localhost:3001/coupons?me=${encodeURIComponent(user?.username || '')}`)
      .then(res => res.json())
      .then(data => setCatalog(Array.isArray(data.coupons) ? data.coupons : []))
      .catch(() => setCatalog([]));
    // re-run when user changes to refetch personalized catalog
  }, [user?.username]);

  // Load MY coupons (including private ones)
  useEffect(() => {
    if (!user?.username) { setMyCoupons([]); return; }
    fetch(`http://localhost:3001/users/${encodeURIComponent(user.username)}/coupons`)
      .then(res => res.json())
      .then(data => setMyCoupons(Array.isArray(data.coupons) ? data.coupons : []))
      .catch(() => setMyCoupons([]));
  }, [user?.username]);

  // Load my friends for sending 
  useEffect(() => {
    if (!user?.username) { setFriends([]); return; }
    fetch(`http://localhost:3001/friends-list/${encodeURIComponent(user.username)}`)
      .then(res => res.json())
      .then(data => setFriends(Array.isArray(data.friends) ? data.friends : []))
      .catch(() => setFriends([]));
  }, [user?.username]);

  // Merge: show private-only from myCoupons + the personalized catalog
  const list = useMemo(() => {
    const privates = myCoupons.filter(c => c.private === true && c.owner === user?.username);
    const seen = new Set(privates.map(c => c.code));
    return [...privates, ...catalog.filter(c => !seen.has(c.code))];
  }, [myCoupons, catalog, user?.username]);

  const sendToFriend = async (code) => {
    if (!user?.username) return alert("Please log in to send coupons.");
    const friend = selectedFriend[code];
    if (!friend) return alert("Pick a friend to send to.");

    try {
      const res = await fetch("http://localhost:3001/coupons/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUsername: user.username, toUsername: friend, code })
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || "Failed to send");
      setSentTo(prev => ({ ...prev, [code]: friend }));
      alert(`Sent ${code} to ${friend}!`);
    } catch (e) {
      console.error(e);
      alert("Failed to send");
    }
  };

  return (
    <main className="container py-4">
      <h1 className="h3 mb-3">Coupons</h1>

      {list.length === 0 ? (
        <p>No coupons to show yet.</p>
      ) : (
        <div className="row g-3">
          {list.map(c => {
            const isPrivate = c.private === true;
            const isOwner   = !!user?.username && c.owner === user.username;
            const sentRecipient = sentTo?.[c.code];
            const canSend   = c.sendable === true && (isPrivate ? isOwner : true);

            const disabledReason =
              !c.sendable ? 'Not sendable' :
              (isPrivate && !isOwner) ? 'Only the owner can send' :
              (friends.length === 0) ? 'Add friends first' :
              sentRecipient ? `Already sent to ${sentRecipient}` :
              !user?.username ? 'Log in to send' : '';

            return (
              <div className="col-12 col-md-6 col-lg-4" key={c.code}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between">
                      <h2 className="h5 mb-1">{c.title || c.description || 'Coupon'}</h2>
                      {isPrivate ? (
                        <span className={`badge ${c.sendable ? 'text-bg-info' : 'text-bg-secondary'}`}>
                          {c.sendable ? 'Private • Sendable' : 'Private'}
                        </span>
                      ) : (
                        <span className="badge text-bg-success">Sendable</span>
                      )}
                    </div>
                    <p className="text-body-secondary mb-1">{c.description}</p>
                    <p className="mb-1"><strong>Code:</strong> {c.code}</p>
                    <p className="mb-2"><strong>Restaurant:</strong> {c.restaurant || "Any"}</p>

                    {/* Send controls */}
                    <div className="d-flex gap-2">
                      <select
                        className="form-select"
                        style={{ maxWidth: 180 }}
                        value={selectedFriend[c.code] || ""}
                        onChange={(e) =>
                          setSelectedFriend(prev => ({ ...prev, [c.code]: e.target.value }))
                        }
                        disabled={!canSend || !user?.username || friends.length === 0 || !!sentRecipient}
                        title={canSend ? "Choose a friend" : disabledReason || "You cannot send this coupon"}
                      >
                        <option value="">
                          {canSend ? "Send to…" : (friends.length === 0 ? "Add friends first" : "Private")}
                        </option>
                        {canSend && friends.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>

                      <button
                        className={`btn ${canSend ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => canSend && !sentRecipient && sendToFriend(c.code)}
                        disabled={!canSend || !selectedFriend[c.code] || !!sentRecipient}
                        title={canSend
                          ? (sentRecipient ? `Already sent to ${sentRecipient}` : "Send to selected friend")
                          : (disabledReason || "You cannot send this coupon")}
                      >
                        {canSend ? (sentRecipient ? "Sent" : "Send") : "Private"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Coupons;
