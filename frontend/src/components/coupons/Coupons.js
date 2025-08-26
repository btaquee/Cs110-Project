import { useEffect, useState } from 'react';

function Coupons({ user }) {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    console.log('Fetching coupons from http://localhost:3001/coupons');
    fetch("http://localhost:3001/coupons")
      .then(res => res.json())
      .then(data => setCoupons(data.coupons || []));
  }, []);

  const claimCoupon = async (code) => {
    if (!user?.username) {
      alert("Please log in to claim coupons.");
      return;
    }
    const res = await fetch("http://localhost:3001/coupons/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, code })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Coupon ${code} claimed!`);
    } else {
      alert(data.error || "Failed to claim");
    }
  };

  return (
    <main className="container py-4">
      <h1>Coupons</h1>
      {coupons.length === 0 ? (
        <p>No coupons available right now.</p>
      ) : (
        <div className="row g-3">
          {coupons.map(c => (
            <div className="col-md-4" key={c.code}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{c.title}</h5>
                  <p className="card-text">{c.description}</p>
                  <p><strong>Code:</strong> {c.code}</p>
                  <p><strong>Restaurant:</strong> {c.restaurant || "Any"}</p>
                  <button className="btn btn-primary" onClick={() => claimCoupon(c.code)}>
                    Claim
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Coupons;
