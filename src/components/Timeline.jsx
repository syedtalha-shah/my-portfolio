import React from "react";
import { motion } from "framer-motion";

const Timeline = () => {
  const experiences = [
    {
      title: "Senior Full Stack Developer",
      company: "Tech Company",
      period: "2023 - Present",
      description: "Leading development of scalable web applications",
    },
    {
      title: "Full Stack Developer",
      company: "Software Agency",
      period: "2021 - 2023",
      description: "Built modern React and Node.js applications",
    },
    {
      title: "Frontend Developer",
      company: "Startup",
      period: "2020 - 2021",
      description: "Developed responsive user interfaces",
    },
    {
      title: "Junior Developer",
      company: "Freelance",
      period: "2019 - 2020",
      description: "Started journey in web development",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  return (
    <div id="experience">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Experience
      </motion.h2>

      <motion.div
        className="timelineBox"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {experiences.map((item, index) => (
          <TimelineItem
            key={index}
            {...item}
            index={index}
            variants={itemVariants}
          />
        ))}
      </motion.div>
    </div>
  );
};

const TimelineItem = ({ title, company, period, description, index, variants }) => (
  <motion.div
    className={`timelineItem ${index % 2 === 0 ? "leftTimeline" : "rightTimeline"}`}
    variants={variants}
  >
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <h2>{title}</h2>
      <p>{company}</p>
      <span>{period}</span>
    </motion.div>
  </motion.div>
);

export default Timeline;
