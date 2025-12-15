import React from "react";
import { motion } from "framer-motion";
import {
  AiFillGithub,
  AiFillInstagram,
  AiFillLinkedin,
  AiOutlineArrowUp,
} from "react-icons/ai";
import { HiDownload } from "react-icons/hi";

const Footer = () => {
  const socialLinks = [
    {
      icon: <AiFillLinkedin />,
      href: "https://www.linkedin.com/in/syed-talha-jan-093005189",
      label: "LinkedIn",
    },
    {
      icon: <AiFillInstagram />,
      href: "https://www.instagram.com/talha______shah",
      label: "Instagram",
    },
    {
      icon: <AiFillGithub />,
      href: "https://github.com/syedtalha-shah",
      label: "GitHub",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div variants={itemVariants}>
        <motion.div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00f5d4 0%, #00b8a9 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            fontSize: "2.5rem",
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: "#0a0a0f",
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          T
        </motion.div>

        <h2>Talha.</h2>
        <p>Building digital experiences with passion and precision.</p>
      </motion.div>

      <motion.aside variants={itemVariants}>
        <h2>Connect</h2>

        <article>
          {socialLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {link.icon}
            </motion.a>
          ))}
        </article>

        <motion.a
          href="/SyedTalhaJanResume.pdf"
          download="SyedTalhaJanResume.pdf"
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          style={{
            marginTop: "1.5rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.8rem 1.5rem",
            border: "1px solid var(--color-accent, #00f5d4)",
            borderRadius: "4px",
            color: "var(--color-accent, #00f5d4)",
            fontFamily: "var(--font-code, 'JetBrains Mono', monospace)",
            fontSize: "0.9rem",
            fontWeight: 500,
            letterSpacing: "1px",
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
          onHoverStart={(e) => {
            e.currentTarget.style.background = "var(--color-accent, #00f5d4)";
            e.currentTarget.style.color = "var(--color-bg-primary, #0a0a0f)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 245, 212, 0.4)";
          }}
          onHoverEnd={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--color-accent, #00f5d4)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <HiDownload />
          Download CV
        </motion.a>
      </motion.aside>

      <motion.a
        href="#home"
        variants={itemVariants}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Scroll to top"
      >
        <AiOutlineArrowUp />
      </motion.a>
    </motion.footer>
  );
};

export default Footer;
