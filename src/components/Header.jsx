import React from "react";
import { motion } from "framer-motion";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";

function Header({ menuOpen, setMenuOpen }) {
  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <NavContent setMenuOpen={setMenuOpen} />
      </motion.nav>

      <motion.button
        className="navBtn"
        onClick={() => setMenuOpen(!menuOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {menuOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
      </motion.button>
    </>
  );
}

export const HeaderPhone = ({ menuOpen, setMenuOpen }) => {
  const menuVariants = {
    closed: {
      y: "-100%",
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="navPhone"
      initial="closed"
      animate={menuOpen ? "open" : "closed"}
      variants={menuVariants}
    >
      <motion.h2 variants={itemVariants}>STJ.</motion.h2>
      <motion.div variants={itemVariants}>
        <a onClick={() => setMenuOpen(false)} href="#home">
          Home
        </a>
        <a onClick={() => setMenuOpen(false)} href="#work">
          Work
        </a>
        <a onClick={() => setMenuOpen(false)} href="#experience">
          Experience
        </a>
        <a onClick={() => setMenuOpen(false)} href="#services">
          Services
        </a>
        <a onClick={() => setMenuOpen(false)} href="#testimonial">
          Testimonial
        </a>
        <a onClick={() => setMenuOpen(false)} href="#contact">
          Contact
        </a>
      </motion.div>
      <motion.a variants={itemVariants} href="mailto:syedtalha497@gmail.com">
        <button>Email</button>
      </motion.a>
    </motion.div>
  );
};

const NavContent = ({ setMenuOpen }) => {
  const linkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
      },
    }),
  };

  const links = [
    { href: "#home", text: "Home" },
    { href: "#work", text: "Work" },
    { href: "#experience", text: "Experience" },
    { href: "#services", text: "Services" },
    { href: "#testimonial", text: "Testimonial" },
    { href: "#contact", text: "Contact" },
  ];

  return (
    <>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        STJ.
      </motion.h2>
      <div>
        {links.map((link, i) => (
          <motion.a
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            custom={i}
            variants={linkVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2 }}
          >
            {link.text}
          </motion.a>
        ))}
      </div>
      <motion.a
        href="mailto:syedtalha497@gmail.com"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Email
        </motion.button>
      </motion.a>
    </>
  );
};

export default Header;
