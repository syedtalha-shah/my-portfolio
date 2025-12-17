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
      name: "Hamza",
      role: "Co-Founder (MetaKlouds)",
      feedback: `His expertise and problem-solving skills have greatly benefited our team. He approaches every challenge with creativity and dedication. A valuable asset!`,
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2300f5d4'/%3E%3Ccircle cx='50' cy='35' r='12' fill='%230a0a0f'/%3E%3Cpath d='M 30 75 Q 30 60 50 60 Q 70 60 70 75 L 70 85 L 30 85 Z' fill='%230a0a0f'/%3E%3C/svg%3E",
    },
    {
      name: "Muhammad Kashif",
      role: "Founder (MetaKlouds)",
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
  <motion.div
    variants={variants}
    style={{ width: "100%" }}
  >
    <article className="testimonial-card">
      <motion.img
        src={image}
        alt={name}
        className="testimonial-image"
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
    </article>
  </motion.div>
);

export default Testimonial;
