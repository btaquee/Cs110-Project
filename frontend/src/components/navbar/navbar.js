import { Link } from "react-router-dom"
import './navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Navbar( { user } ) {
    return (
        <div className="navbar">
          <div id="left-side">
            <Link to="/">
              <img className="logo" src="/images/Logo.png" alt="Logo"></img>
            </Link>
             <Link to="/about">About</Link>
          </div>
          {user ? (
          <div className="dropdown">
          <button className="btn btn-secondary dropdown-toggle" 
            type="button"
            id="dropdownMenuButton" 
            data-bs-toggle="dropdown" 
            aria-expanded="false">
            {user.username}
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li> <Link to="/profile">Your Profile </Link></li>
            <li> <Link to="/friends">Friends </Link></li>
            <li> <Link to="/about">Coupons </Link></li>
          </ul>
          </div> 
         ) : ( 
            //When not logged in
            <Link to="/login">
            <button onClick={() => console.log("Go to login page")}> Login </button>
            </Link>
           )} 
          
          
          </div>


    );
}

export default Navbar;