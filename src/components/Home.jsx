import React from "react";
import { animate, motion } from "framer-motion";
import TypeWriter from "typewriter-effect";
import { BsArrowUpRight, BsChevronDown } from "react-icons/bs";
import me from "../assets/logo.png";
import { useRef } from "react";

const Home = ({ ratio }) => {
  const clientCount = useRef(null);
  const projectCount = useRef(null);

  const animationClientCount = () => {
    animate(0, 100, {
      duration: 1,
      onUpdate: (val) => (clientCount.current.textContent = val.toFixed()),
    });
  };
  const animationProjectCount = () => {
    animate(0, 500, {
      duration: 1,
      onUpdate: (val) => (projectCount.current.textContent = val.toFixed()),
    });
  };
  const animation = {
    h1: {
      initial: {
        x: "-100%",
        opacity: 0,
      },
      whileInView: {
        x: 0,
        opacity: 1,
      },
    },
  };
  return (
    <div id="home">
      <section>
        <div>
          <motion.h1 {...animation.h1}>
            Hi, I Am <br /> Talha.
          </motion.h1>
          <TypeWriter
            options={{
              strings: ["An Engineer","A Developer", "A Designer", "A Creator"],
              autoStart: true,
              loop: true,
              wrapperClassName: "typewriterpara",
              cursor: "",
            }}
          />
          <div>
            <a href="mailto:syedtalha497@gmail.com">Hire me</a>
            <a href="#work">
              Projects <BsArrowUpRight />{" "}
            </a>
          </div>

          <article>
            <p>
              +
              {ratio < 3 && (
                <motion.span
                  ref={clientCount}
                  whileInView={animationClientCount}
                ></motion.span>
              )}
            </p>
            <span>Client Worldwide</span>
          </article>

          <aside>
            <article>
              <p>
                +
                {ratio < 3 && (
                  <motion.span
                    ref={projectCount}
                    whileInView={animationProjectCount}
                  ></motion.span>
                )}
              </p>
              <span>Projects Done</span>
            </article>
            <article data-special>
              <p>Contact</p>
              <span>syedtalha497@gmail.com</span>
            </article>
          </aside>
        </div>
      </section>
      <section>
        <img src={me} alt="Syed Talha Jan" />
      </section>
      <BsChevronDown />
    </div>
  );
};

export default Home;
