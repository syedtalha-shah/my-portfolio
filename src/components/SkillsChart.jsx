import React from "react";
import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import skillsData from "../assets/skillsData.json";

const SkillsChart = () => {
  const chartData = skillsData.skills.map((skill) => ({
    subject: skill.name,
    A: skill.level,
    fullMark: 100,
  }));

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      className="skills-chart"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <h3>Technical Skills</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "var(--color-text-secondary)", fontSize: 12, fontFamily: "var(--font-code)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
          />
          <Radar
            name="Skills"
            dataKey="A"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default SkillsChart;

