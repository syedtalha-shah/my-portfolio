import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import ParticleBackground from "./ParticleBackground";

const Contact = () => {
  const formRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // EmailJS configuration
      // Replace these with your actual EmailJS credentials
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      await emailjs.sendForm(serviceId, templateId, formRef.current, publicKey);

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div id="contact" style={{ position: "relative" }}>
      <ParticleBackground density="medium" color="var(--color-accent)" section="contact" />
      <section style={{ position: "relative", zIndex: 1 }}>
        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 variants={itemVariants}>Get In Touch</motion.h2>

          <motion.input
            type="text"
            placeholder="Your Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            variants={itemVariants}
            whileFocus={{ scale: 1.02, borderColor: "var(--color-accent)" }}
          />

          <motion.input
            type="email"
            placeholder="Your Email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            variants={itemVariants}
            whileFocus={{ scale: 1.02, borderColor: "var(--color-accent)" }}
          />

          <motion.textarea
            placeholder="Your Message"
            name="message"
            rows={5}
            required
            value={formData.message}
            onChange={handleChange}
            variants={itemVariants}
            whileFocus={{ scale: 1.02, borderColor: "var(--color-accent)" }}
          />

          <motion.button
            type="submit"
            disabled={isLoading}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <span className="contact-loading">Sending...</span>
            ) : (
              "Send Message"
            )}
          </motion.button>
        </motion.form>
      </section>

      <aside style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-accent-dim) 0%, rgba(0, 184, 169, 0.1) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid var(--color-border-glow)",
            }}
          />
          <motion.span
            style={{
              fontSize: "4rem",
              color: "var(--color-accent)",
              fontFamily: "var(--font-code)",
            }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✉
          </motion.span>
        </motion.div>
      </aside>
    </div>
  );
};

export default Contact;
