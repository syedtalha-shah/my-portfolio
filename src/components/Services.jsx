import React from "react";
import { delay, motion } from "framer-motion";
import { AiFillIeCircle, AiFillAndroid, AiFillWindows } from "react-icons/ai";

const Services = () => {
  const animation = {
    whileInView: {
      x: 0,
      y: 0,
      opacity: 1,
    },
    one: {
      opacity: 0,
      x: "-100%",
    },
    twoAndThree: {
      opacity: 0,
      y: "-100%",
    },
    four: {
      opacity: 0,
      x: "100%",
    },
  };

  return (
    <div id="services">
      <h2>Services</h2>
      <section>
        <motion.div
          className="servicesBox1"
          whileInView={animation.whileInView}
          initial={animation.one}
        >
          <h3>1+</h3>
          <p>Years Experience</p>
        </motion.div>
        <motion.div
          className="servicesBox2"
          whileInView={animation.whileInView}
          initial={animation.twoAndThree}
        >
          <AiFillIeCircle />
          <span>Web Development</span>
        </motion.div>
        <motion.div
          className="servicesBox3"
          whileInView={animation.whileInView}
          initial={animation.twoAndThree}
          transition={{ delay: 0.3 }}
        >
          <AiFillAndroid />
          <span>Android Applications</span>
        </motion.div>
        <motion.div
          className="servicesBox4"
          whileInView={animation.whileInView}
          initial={animation.four}
        >
          <AiFillWindows />
          <span>Desktop Applications</span>
        </motion.div>
      </section>
    </div>
  );
};

export default Services;
