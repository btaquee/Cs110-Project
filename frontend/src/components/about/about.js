import './about.css';
// import Navbar from '../navbar/navbar.js';

function About() {
  return (
    <main className="about container py-4">
      {/* HERO */}
      <section className="hero bg-light rounded-4 p-4 p-md-5 mb-4">
        <div className="row align-items-center g-4">
          <div className="col-12 col-md-7">
            <h1 className="display-5 fw-bold mb-2">About Our App</h1>
            <p className="lead mb-3">
              Discover places you’ll love, connect with friends, and get
              smart recommendations tailored to your tastes.
            </p>
            <div className="d-flex gap-2 flex-wrap">
              <a href="#mission" className="btn btn-primary">Our Mission</a>
              <a href="#recs" className="btn btn-outline-primary">How Recommendations Work</a>
            </div>
          </div>
          <div className="col-12 col-md-5 text-center">
            <img
              src="/images/Logo.png"
              alt="App logo"
              className="about-hero-img img-fluid"
            />
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="mb-5">
        <h2 className="h3 fw-bold mb-3">Our Mission</h2>
        <p className="mb-0">
          We help users quickly find the best options for them by combining
          clear search with a lightweight, explainable recommendation system.
          You’ll also see socially relevant results through your friend network.
        </p>
      </section>

      {/* KEY FEATURES */}
      <section className="mb-5">
        <h2 className="h3 fw-bold mb-3">Key Features</h2>
        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Smart Search</h3>
                <p className="card-text">
                  Type a query and get ranked results that consider title,
                  description, categories, and popularity.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Similar Items</h3>
                <p className="card-text">
                  When you view an item, see a curated list of similar options
                  on the same page—just like Airbnb’s “Similar stays.”
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Friend List</h3>
                <p className="card-text">
                  Add friends, manage your list, and discover items your
                  network likes or views more often.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Easy Sign-In</h3>
                <p className="card-text">
                  Supports 3rd-party authentication (e.g., Google) so you can
                  log in quickly and securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mb-5">
        <h2 className="h3 fw-bold mb-3">How It Works</h2>
        <ol className="about-steps">
          <li><span className="fw-semibold">Search:</span> Enter keywords (e.g., “sushi”, “budget”).</li>
          <li><span className="fw-semibold">Rank:</span> We score items using content and basic popularity.</li>
          <li><span className="fw-semibold">Personalize:</span> Your favorites and friend activity boost relevant items.</li>
          <li><span className="fw-semibold">Explore:</span> On an item page, browse “Similar items.”</li>
        </ol>
      </section>

      {/* RECOMMENDATION SYSTEM EXPLAINER */}
      <section id="recs" className="mb-5">
        <h2 className="h3 fw-bold mb-3">Our Recommendation System</h2>
        <p className="mb-3">
          We use an explainable, lightweight approach that blends
          content-based signals with small personalization boosts:
        </p>

        <div className="about-callout bg-body-tertiary border rounded-4 p-3 mb-3">
          <p className="mb-1"><span className="fw-semibold">Search ranking (per result):</span></p>
          <pre className="mb-0">
{`score = 2 × (title contains query)
      + 1 × (description contains query)
      + 1 × (category/tag match)
      + 1 × (popularity/recency boost)
      + 1 × (matches your favorites)
      + 1 × (liked/viewed by your friends)`}
          </pre>
        </div>

        <div className="about-callout bg-body-tertiary border rounded-4 p-3">
          <p className="mb-1"><span className="fw-semibold">“Similar items” (on item page):</span></p>
          <pre className="mb-0">
{`similarity = overlap in tags/categories
break ties with popularity and recency
limit to 3–6 items for clarity`}
          </pre>
        </div>

        <p className="mt-3 mb-0">
          This keeps recommendations transparent and fast to compute while still
          feeling personalized.
        </p>
      </section>

      {/* TEAM */}
      <section className="mb-5">
        <h2 className="h3 fw-bold mb-3">Team</h2>
        <div className="row g-3">
          {/* Replace placeholder names/roles as needed */}
          <div className="col-12 col-md-4">
            <div className="card h-100 team-card">
              <div className="card-body">
                <h3 className="h5 mb-1">Arun</h3>
                <p className="text-body-secondary mb-2">About page • Recs • Friends • Auth</p>
                <p className="mb-0">Focus: content, UX, and recommendation logic.</p>
              </div>
            </div>
          </div>
          {/* Add more teammates here */}
        </div>
      </section>

      {/* CONTACT / LINKS */}
      <section className="mb-4">
        <h2 className="h3 fw-bold mb-3">Contact & Links</h2>
        <ul className="list-unstyled mb-0">
          <li><span className="fw-semibold">Email:</span> your@email.com</li>
          <li><span className="fw-semibold">Repository:</span> <a href="https://github.com/your-org/your-repo" target="_blank" rel="noreferrer">GitHub</a></li>
        </ul>
      </section>
    </main>
  );
}

export default About;
