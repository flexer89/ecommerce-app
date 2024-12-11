import React, { useRef } from 'react';
import '../assets/style/style.css';

const Navbar = () => {
  const navbarRef = useRef(null);
  const overlayRef = useRef(null);
  const navTogglers = useRef([]);
  const navbarLinks = useRef([]);

  const toggleNavbar = () => {
    navbarRef.current.classList.toggle('active');
    overlayRef.current.classList.toggle('active');
  };

  const closeNavbar = () => {
    navbarRef.current.classList.remove('active');
    overlayRef.current.classList.remove('active');
  };

  return (
    <header>
      <div className="navbar" ref={navbarRef} data-navbar>
        <button ref={(el) => (navTogglers.current[0] = el)} data-nav-toggler onClick={toggleNavbar}>
          Toggle Navbar
        </button>
        <nav>
          <ul>
            <li ref={(el) => (navbarLinks.current[0] = el)} data-nav-link onClick={closeNavbar}>
              <a href="#home">Home</a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="overlay" ref={overlayRef} data-overlay></div>
    </header>
  );
};

export default Navbar;
