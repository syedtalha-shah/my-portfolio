import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
function Header({ menuOpen, setMenuOpen }) {
  return (
    <>
      <nav>
        <NavContent setMenuOpen={setMenuOpen} />
      </nav>

      <button className="navBtn" onClick={() => setMenuOpen(!menuOpen)}>
        <AiOutlineMenu />
      </button>
    </>
  );
}

export const HeaderPhone = ({ menuOpen, setMenuOpen }) => {
  return (
    <div className={`navPhone ${menuOpen ? "navPhoneComes" : ""}`}>
      <NavContent setMenuOpen={setMenuOpen} />
    </div>
  );
};

 const NavContent = ({setMenuOpen}) => (
  <>
    <h2>STJ.</h2>
    <div>
      <a onClick={() => setMenuOpen(false)} href="#home">Home</a>
      <a onClick={() => setMenuOpen(false)} href="#work">Work</a>
      <a onClick={() => setMenuOpen(false)} href="#experience">Experience</a>
      <a onClick={() => setMenuOpen(false)} href="#services">Services</a>
      <a onClick={() => setMenuOpen(false)} href="#testimonial">Testimonial</a>
      <a onClick={() => setMenuOpen(false)} href="#contact">Contact</a>
    </div>
    <a href="mailto:syedtalha497@gmail.com">
      <button>Email</button>
    </a>
  </>
);

export default Header;
