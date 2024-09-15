import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="header navbar-area">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-12">
            <nav className="navbar navbar-expand-lg">
              <Link className="navbar-brand" to="/">
                {/* <img src="/assets/images/logo/white-logo.svg" alt="Logo" /> */}
                <h1>BLINK</h1>
              </Link>
              <button className="navbar-toggler mobile-menu-btn" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                aria-expanded="false" aria-label="Toggle navigation">
                <span className="toggler-icon"></span>
                <span className="toggler-icon"></span>
                <span className="toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse sub-menu-bar" id="navbarSupportedContent">
                <ul id="nav" className="navbar-nav ms-auto">
                  <li className="nav-item">
                    <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/signin" className={location.pathname === "/signin" ? "active" : ""}>Login</Link>
                  </li>
                
                </ul>
              </div>
              <div className="button">
                <Link to="/signup" className="btn">Get started</Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;