import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import TypeWriter from "typewriter-effect";
import { BsArrowUpRight, BsChevronDown } from "react-icons/bs";
import Terminal from "./Terminal";
import ParticleBackground from "./ParticleBackground";
import ErrorBoundary from "./ErrorBoundary";

const Home = ({ ratio }) => {
  const clientCount = useRef(null);
  const projectCount = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true });

  const animationClientCount = () => {
    let count = 0;
    const target = 100;
    const duration = 1500;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }
      if (clientCount.current) {
        clientCount.current.textContent = Math.floor(count);
      }
    }, 16);
  };

  const animationProjectCount = () => {
    let count = 0;
    const target = 500;
    const duration = 1500;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }
      if (projectCount.current) {
        projectCount.current.textContent = Math.floor(count);
      }
    }, 16);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div id="home" ref={sectionRef}>
      <ErrorBoundary>
        <ParticleBackground density="high" color="var(--color-accent)" section="home" />
      </ErrorBoundary>
      <section>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.h1 variants={itemVariants}>
            Hi, I Am <br />
            <span>Talha.</span>
          </motion.h1>

          <motion.div variants={itemVariants}>
            <TypeWriter
              options={{
                strings: [
                  "Full Stack Developer",
                  "React Specialist",
                  "Node.js Expert",
                  "Problem Solver",
                ],
                autoStart: true,
                loop: true,
                wrapperClassName: "typewriterpara",
                cursor: "|",
                cursorClassName: "typewriterpara",
              }}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <a href="mailto:syedtalha497@gmail.com">Hire me</a>
            <a href="#work">
              Projects <BsArrowUpRight />
            </a>
          </motion.div>

          <motion.aside variants={containerVariants}>
            <motion.article
              variants={statsVariants}
              whileHover={{ scale: 1.05 }}
              onViewportEnter={animationClientCount}
            >
              <p>
                +<span ref={clientCount}>0</span>
              </p>
              <span>Clients Worldwide</span>
            </motion.article>

            <motion.article
              variants={statsVariants}
              whileHover={{ scale: 1.05 }}
              onViewportEnter={animationProjectCount}
            >
              <p>
                +<span ref={projectCount}>0</span>
              </p>
              <span>Projects Done</span>
            </motion.article>

            <motion.article
              variants={statsVariants}
              whileHover={{ scale: 1.05 }}
            >
              <p>
                Contact
              </p>
              <a 
                href="mailto:syedtalha497@gmail.com"
              >
                syedtalha497@gmail.com
              </a>
            </motion.article>
          </motion.aside>
        </motion.div>
      </section>

      <section>
        <Terminal />
      </section>

      <motion.a
        href="#work"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <BsChevronDown />
      </motion.a>
    </div>
  );
};

export default Home;
