import React from "react";
import { motion } from "framer-motion";
import { AiFillMobile } from "react-icons/ai";
import { FaReact, FaNodeJs } from "react-icons/fa";
import SkillsChart from "./SkillsChart";

const Services = () => {
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
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const services = [
    {
      icon: <FaReact />,
      title: "React Development",
      className: "servicesBox2",
    },
    {
      icon: <FaNodeJs />,
      title: "Backend Development",
      className: "servicesBox3",
    },
    {
      icon: <AiFillMobile />,
      title: "Mobile Apps",
      className: "servicesBox4",
    },
  ];

  return (
    <div id="services">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Services
      </motion.h2>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          className="servicesBox1"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <h3>3+</h3>
          <span>Years Experience</span>
        </motion.div>

        {services.map((service, index) => (
          <motion.div
            key={service.title}
            className={service.className}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
          >
            <motion.div
              initial={{ rotate: 0 }}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {service.icon}
            </motion.div>
            <span>{service.title}</span>
          </motion.div>
        ))}
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{ marginTop: "4rem", maxWidth: "800px", margin: "4rem auto 0" }}
      >
        <SkillsChart />
      </motion.div>
    </div>
  );
};

export default Services;
