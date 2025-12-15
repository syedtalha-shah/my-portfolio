import React, { useMemo } from "react";
import {
  FaReact,
  FaNodeJs,
  FaAws,
  FaDocker,
  FaGitAlt,
  FaPython,
  FaDatabase,
} from "react-icons/fa";
import {
  SiTypescript,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiExpress,
  SiGraphql,
  SiTailwindcss,
  SiRedux,
  SiPostgresql,
  SiFirebase,
} from "react-icons/si";
import "./FloatingSkillIcons.scss";

const skillIcons = [
  { Icon: FaReact, color: "#61dafb", name: "React" },
  { Icon: FaNodeJs, color: "#339933", name: "Node.js" },
  { Icon: SiTypescript, color: "#3178c6", name: "TypeScript" },
  { Icon: SiJavascript, color: "#f7df1e", name: "JavaScript" },
  { Icon: SiMongodb, color: "#47a248", name: "MongoDB" },
  { Icon: SiNextdotjs, color: "#ffffff", name: "Next.js" },
  { Icon: SiExpress, color: "#ffffff", name: "Express" },
  { Icon: FaAws, color: "#ff9900", name: "AWS" },
  { Icon: FaDocker, color: "#2496ed", name: "Docker" },
  { Icon: FaGitAlt, color: "#f05032", name: "Git" },
  { Icon: SiGraphql, color: "#e10098", name: "GraphQL" },
  { Icon: SiTailwindcss, color: "#06b6d4", name: "Tailwind" },
  { Icon: SiRedux, color: "#764abc", name: "Redux" },
  { Icon: FaPython, color: "#3776ab", name: "Python" },
  { Icon: SiPostgresql, color: "#4169e1", name: "PostgreSQL" },
  { Icon: FaDatabase, color: "#00758f", name: "SQL" },
  { Icon: SiFirebase, color: "#ffca28", name: "Firebase" },
];

const FloatingSkillIcons = () => {
  // Generate random positions and animation properties for each icon
  const floatingIcons = useMemo(() => {
    return skillIcons.map((skill, index) => {
      const randomX = Math.random() * 100;
      const randomY = Math.random() * 100;
      const randomDelay = Math.random() * 20;
      const randomDuration = 15 + Math.random() * 25;
      const randomSize = 20 + Math.random() * 24;
      const randomOpacity = 0.15 + Math.random() * 0.25;
      const randomRotation = Math.random() * 360;
      const animationType = index % 4; // Different animation patterns

      return {
        ...skill,
        id: `${skill.name}-${index}`,
        style: {
          left: `${randomX}%`,
          top: `${randomY}%`,
          fontSize: `${randomSize}px`,
          opacity: randomOpacity,
          animationDelay: `${randomDelay}s`,
          animationDuration: `${randomDuration}s`,
          transform: `rotate(${randomRotation}deg)`,
        },
        animationType,
      };
    });
  }, []);

  // Duplicate icons for more coverage
  const duplicatedIcons = useMemo(() => {
    const duplicates = [];
    floatingIcons.forEach((icon, idx) => {
      duplicates.push(icon);
      // Add a duplicate with different position
      duplicates.push({
        ...icon,
        id: `${icon.id}-dup`,
        style: {
          ...icon.style,
          left: `${(parseFloat(icon.style.left) + 50) % 100}%`,
          top: `${(parseFloat(icon.style.top) + 30) % 100}%`,
          animationDelay: `${parseFloat(icon.style.animationDelay.replace('s', '')) + 10}s`,
          opacity: icon.style.opacity * 0.8,
        },
        animationType: (icon.animationType + 2) % 4,
      });
    });
    return duplicates;
  }, [floatingIcons]);

  return (
    <div className="floating-skill-icons">
      {duplicatedIcons.map(({ Icon, color, id, style, animationType }) => (
        <div
          key={id}
          className={`floating-icon floating-animation-${animationType}`}
          style={{
            ...style,
            color: color,
            textShadow: `0 0 20px ${color}40`,
          }}
        >
          <Icon />
        </div>
      ))}
    </div>
  );
};

export default FloatingSkillIcons;

