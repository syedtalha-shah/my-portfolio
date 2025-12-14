import React from "react";
import { motion } from "framer-motion";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import data from "../assets/data.json";

const Work = () => {
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <div id="work">
      <motion.h2
        variants={titleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        PROJECTS
      </motion.h2>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {data.projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} variants={cardVariants} />
        ))}
      </motion.section>
    </div>
  );
};

const ProjectCard = ({ project, variants }) => {
  return (
    <motion.article className="project-card" variants={variants}>
      <div className="project-card__image">
        <img src={project.imgSrc} alt={project.title} loading="lazy" />
        <div className="project-card__overlay">
          {project.url && (
            <motion.a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="View Live Demo"
            >
              <FiExternalLink />
            </motion.a>
          )}
          {project.github && (
            <motion.a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card__link project-card__link--github"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="View Source Code"
            >
              <FiGithub />
            </motion.a>
          )}
        </div>
      </div>

      <div className="project-card__content">
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__description">{project.description}</p>
        
        {project.tech && (
          <div className="project-card__tech">
            {project.tech.map((tech, index) => (
              <motion.span
                key={tech}
                className="project-card__tag"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
};

export default Work;
