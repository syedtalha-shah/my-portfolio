import React from "react";
import { useState } from "react";
import vg from "../assets/vg.png";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  });

  const handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;
    // console.log(name, value);
    setFormData((prevName) => {
      return {
        ...prevName,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormData({
      name: "",
      email: "",
      message: "",
    });
    try {
      await addDoc(collection(db, "contact"), {
        formData,
      });
      toast.success("Message Sent Success");
    } catch (error) {
      toast.error("Error");
      console.log(error);
    }
  };

  const animation = {
    form: {
      initial: {
        x: "-100%",
        opacity: 0,
      },
      whileInView: {
        x: 0,
        opacity: 1,
      },
    },
    button: {
      initial: {
        y: "-100%",
        opacity: 0,
      },
      whileInView: {
        y: 0,
        opacity: 1,
      },
      transition: {
        delay: 0.5,
      },
    },
  };
  return (
    <div id="contact">
      <section>
        <motion.form onSubmit={handleSubmit} {...animation.form}>
          <h2>Contact</h2>
          <input
            type="text"
            placeholder="Your Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            placeholder="Your Email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Your Message"
            name="message"
            value={formData.message}
            required
            onChange={handleChange}
          />
          <motion.button {...animation.button} type="submit">
            Send
          </motion.button>
        </motion.form>
      </section>
      <aside>
        <img src={vg} alt="Graphics" />
      </aside>
    </div>
  );
};

export default Contact;
