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
              DinePerks is a platform that is all about food discovery with social interaction. Discover new places to eat, share your experiences, and even get coupons for your favorite restaurants! 
            </p>
            <div className="d-flex gap-2 flex-wrap">
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
          We wanted to combine reviews, rewards, and social networking through a single 
          platform. We want it to be the place where users can save money while making 
          connections with people from all around the world. 
          {/* We help users quickly find the best options for them by combining
          clear search with a lightweight, explainable recommendation system.
          You’ll also see socially relevant results through your friend network. */}
        </p>
      </section>

      {/* KEY FEATURES */}
      <section className="mb-5">
        <h2 className="h3 fw-bold mb-3">Key Features</h2>
        <div className="row g-3">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Search Function</h3>
                <p className="card-text">
                  Type a query and get results that can find restaurants
                   and their cuisine types, as well as finding users and their favorite 
                   places and cuisines.
              
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Recommendation List</h3>
                <p className="card-text">
                  When you view a restuarant, you can see similar restuarants based on the clicked restuarant, your query, and your personal preferences. 
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Friend List</h3>
                <p className="card-text">
                  Add friends, manage your list, and view user profiles to see their favorite restaurants, cuisines and reviews.
                </p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Easy Sign-In</h3>
                <p className="card-text">
                  Make a username and password for easy sign in. Supports 3rd-party authentication (e.g., Google) so you can
                  log in quickly and securely.
                </p>
              </div>
            </div>
          </div>

            <div className="col-12 col-md-6 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h3 className="h5 card-title">Coupon System</h3>
                <p className="card-text">
                  Get coupons for your favorite restaurants and cuisines. Save money while trying new places to eat! 
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mb-5">
        <h2 className="h3 fw-bold mb-3">How It Works</h2>
        <ul className="about-steps">
          <li><span className="fw-semibold">LogIn/Registration:</span> Register with a new username and password or if you already have an account simply log in to get started. </li>
          <li><span className="fw-semibold">Search:</span> Enter keywords (e.g., “sushi”, “bob”) to find restaunts that interest you and users with similar tastes. .</li>
          <li><span className="fw-semibold">Reviewing:</span> Click on any restuarant to give a rating and write a review for other people to see!</li>
          <li><span className="fw-semibold">Personalize:</span> Similar restaurants will be put based on your queries and personal preferences. </li>
          <li><span className="fw-semibold">Coupons:</span> Share and recieve coupons from other users to save money on your favorite restuarants </li>
        </ul>
      </section>

      {/* TEAM */}
      <section className="mb-5">
        <h2 className="h3 fw-bold mb-3">Team</h2>
        <div className="row g-3">
          {/* Team member information */}
          <div className="col-12 col-md-4">
            <div className="card h-100 team-card">
              <div className="card-body">
                <h3 className="h5 mb-1">Cruz</h3>
                <p className="text-body-secondary mb-2">• Foundation for Frontend/Backend <br/>• Search Function • MongoDB <br/> • Friends List • Login/Registration</p>
                <p className="mb-0">Focus: Authentication, UX, Data Foundation, and System Architecture.</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card h-100 team-card">
              <div className="card-body">
                <h3 className="h5 mb-1">Burhanuddin</h3>
                <p className="text-body-secondary mb-2">• Review Restuarant System <br/>• Recommendation System <br/> • Profile Updating </p>
                <p className="mb-0">Focus: Content, UX, and Interaction, Personalization.</p>
              </div>
            </div>
          </div>
          
          <div className="col-12 col-md-4">
            <div className="card h-100 team-card">
              <div className="card-body">
                <h3 className="h5 mb-1">Arun</h3>
                <p className="text-body-secondary mb-2">• About page • Coupons <br/> • Friend Adding/Removing  </p>
                <p className="mb-0">Focus: Content, UX, Coupon System, User Connectivity .</p>
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
          <li><span className="fw-semibold">Email:</span> some@email.com</li>
          <li><span className="fw-semibold">Repository:</span> <a href="https://github.com/btaquee/Cs110-Project" target="_blank" rel="noreferrer">GitHub</a></li>
        </ul>
      </section>
    </main>
  );
}

export default About;
