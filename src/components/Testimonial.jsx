import React from "react";
import { motion } from "framer-motion";

const Testimonial = () => {
  const testimonials = [
    {
      name: "Syed Abdal",
      role: "Project Manager",
      feedback: `Talha has been an exceptional Full Stack Developer. He is a reliable team player who consistently delivers high-quality work. I highly recommend him.`,
      image: "/abdal.png",
    },
    {
      name: "Hamza Sohail",
      role: "Tech Lead",
      feedback: `His expertise and problem-solving skills have greatly benefited our team. He approaches every challenge with creativity and dedication. A valuable asset!`,
      image: "/hamza.png",
    },
    {
      name: "Muhammad Kashif",
      role: "CEO",
      feedback: `His commitment to excellence and teamwork is remarkable. Talha is a key contributor to our success and someone you can always count on.`,
      image: "/kashif.png",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div id="testimonial">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Testimonials
      </motion.h2>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.name}
            {...testimonial}
            variants={cardVariants}
          />
        ))}
      </motion.section>
    </div>
  );
};

const TestimonialCard = ({ name, role, feedback, image, variants }) => (
  <motion.article
    variants={variants}
    whileHover={{ 
      y: -10,
      transition: { duration: 0.3 }
    }}
  >
    <motion.img
      src={image}
      alt={name}
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    />
    <h4>{name}</h4>
    <span style={{ 
      fontSize: "0.8rem", 
      color: "var(--color-text-muted, #6a6a7a)",
      display: "block",
      marginBottom: "0.5rem"
    }}>
      {role}
    </span>
    <p>{feedback}</p>
  </motion.article>
);

export default Testimonial;
