import { useEffect, useState } from 'react';

function Coupons({ user }) {
  const [coupons, setCoupons] = useState([]);
  const [claimedCodes, setClaimedCodes] = useState(new Set());
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState({}); // code -> friend username
  const [sentTo, setSentTo] = useState({}); // code -> friend username just sent


  // Load all available coupons
  useEffect(() => {
    fetch("http://localhost:3001/coupons")
      .then(res => res.json())
      .then(data => setCoupons(Array.isArray(data.coupons) ? data.coupons : []))
      .catch(() => setCoupons([]));
  }, []);

  // Load user's claimed coupons whenever the logged-in user changes
  useEffect(() => {
    if (!user?.username) {
      setClaimedCodes(new Set());
      return;
    }
    fetch(`http://localhost:3001/users/${encodeURIComponent(user.username)}/coupons`)
      .then(res => res.json())
      .then(data => {
        const codes = new Set((data.coupons || []).map(c => c.code));
        setClaimedCodes(codes);
      })
      .catch(() => setClaimedCodes(new Set()));
  }, [user?.username]);

  useEffect(() => {
  if (!user?.username) {
    setFriends([]);
    return;
  }
  fetch(`http://localhost:3001/users/${encodeURIComponent(user.username)}/friends`)
    .then(res => res.json())
    .then(data => setFriends(Array.isArray(data.friends) ? data.friends : []))
    .catch(() => setFriends([]));
}, [user?.username]);


  const claimCoupon = async (code) => {
    if (!user?.username) {
      alert("Please log in to claim coupons.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3001/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, code })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Failed to claim");
        return;
      }
      // Update local claimed set so button disables immediately
      setClaimedCodes(prev => {
        const next = new Set(prev);
        next.add(code);
        return next;
      });
      alert(`Coupon ${code} claimed!`);
    } catch (e) {
      console.error(e);
      alert("Failed to claim");
    }
  };

  const sendToFriend = async (code) => {
  if (!user?.username) {
    alert("Please log in to send coupons.");
    return;
  }
  const friend = selectedFriend[code];
  if (!friend) {
    alert("Pick a friend to send to.");
    return;
  }
  try {
    const res = await fetch("http://localhost:3001/coupons/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUsername: user.username, toUsername: friend, code })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Failed to send");
      return;
    }
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
    {coupons.length === 0 ? (
      <p>No coupons available right now.</p>
    ) : (
      <div className="row g-3">
        {coupons.map(c => {
          const isClaimed = claimedCodes.has(c.code);
          const sentRecipient = sentTo[c.code]; // who you sent this code to (if any)

          return (
            <div className="col-12 col-md-6 col-lg-4" key={c.code}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-1">{c.title}</h2>
                  <p className="text-body-secondary mb-1">{c.description}</p>
                  <p className="mb-1"><strong>Code:</strong> {c.code}</p>
                  <p className="mb-1"><strong>Restaurant:</strong> {c.restaurant || "Any"}</p>

                  <div className="d-flex gap-2 mt-2">
                    {/* Claim */}
                    <button
                      className="btn btn-primary"
                      onClick={() => claimCoupon(c.code)}
                      disabled={isClaimed}
                      title={isClaimed ? "You already claimed this coupon" : "Claim this coupon"}
                    >
                      {isClaimed ? "Claimed" : "Claim"}
                    </button>

                    {/* Send to friend */}
                    <select
                      className="form-select"
                      style={{ maxWidth: 180 }}
                      value={selectedFriend[c.code] || ""}
                      onChange={(e) =>
                        setSelectedFriend(prev => ({ ...prev, [c.code]: e.target.value }))
                      }
                      disabled={!user?.username || friends.length === 0 || !!sentRecipient}
                    >
                      <option value="">Send to…</option>
                      {friends.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>

                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => sendToFriend(c.code)}
                      disabled={!selectedFriend[c.code] || !!sentRecipient}
                      title={sentRecipient ? `Already sent to ${sentRecipient}` : "Send to selected friend"}
                    >
                      {sentRecipient ? "Sent" : "Send"}
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
