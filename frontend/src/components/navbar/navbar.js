import './navbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function Navbar( { user } ) {
    return (
        <div className="navbar">
          <div id="left-side">
            <a href="App.js">
              <img className="logo" src="/images/Logo.png" alt="Logo"></img>
            </a>
            <a className="about" href="#news">About</a>
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
            <li><a className="dropdown-item" href="#">Your Profile </a></li>
            <li><a className="dropdown-item" href="#">Friends </a></li>
            <li><a className="dropdown-item" href="#">Coupons </a></li>
          </ul>
          </div> 
         ) : ( 
            //When not logged in
            <button onClick={() => console.log("Go to login page")}> <a href="login/login.js"> Login </a></button>
           )} 
          
          
          </div>


    );
}

export default Navbar;