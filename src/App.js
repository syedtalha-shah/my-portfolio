import Header, { HeaderPhone } from "./components/Header";
import Home from "./components/Home";
import Work from "./components/Work";
import Timeline from "./components/Timeline";
import Services from "./components/Services";
import Testimonial from "./components/Testimonial";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import FloatingSkillIcons from "./components/FloatingSkillIcons";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  // Scroll spy for navigation highlighting
  useEffect(() => {
    if (isLoading) return; // Wait for page to load

    const sections = ["home", "work", "experience", "services", "testimonial", "contact"];
    
    const updateActiveSection = () => {
      const scrollY = window.scrollY;
      const offset = 200; // Offset for better detection

      // Check if we're at the very top
      if (scrollY < 100) {
        setActiveSection("home");
        return;
      }

      // Find the section currently in view
      let currentSection = "home";
      
      for (let i = 0; i < sections.length; i++) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const sectionBottom = sectionTop + rect.height;
          
          // Check if section is in the viewport with offset
          if (scrollY + offset >= sectionTop && scrollY < sectionBottom) {
            currentSection = sections[i];
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Use Intersection Observer for accurate detection
    const observerOptions = {
      root: null,
      rootMargin: "-150px 0px -60% 0px",
      threshold: 0.1,
    };

    const sectionObservers = new Map();

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          });
        }, observerOptions);

        observer.observe(element);
        sectionObservers.set(sectionId, observer);
      }
    });

    // Initial check
    const timeoutId = setTimeout(updateActiveSection, 200);
    
    // Listen to scroll events as backup
    window.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", updateActiveSection);
      sectionObservers.forEach((observer) => observer.disconnect());
    };
  }, [isLoading]);

  if (isLoading) {
    return (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg-primary)",
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              fontSize: "3rem",
              fontFamily: "var(--font-code)",
              fontWeight: 700,
              color: "var(--color-accent)",
              textShadow: "0 0 30px var(--color-accent-glow)",
            }}
          >
            STJ.
          </motion.div>
        </motion.div>
    );
  }

  return (
    <ThemeProvider>
      <FloatingSkillIcons />
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HeaderPhone menuOpen={menuOpen} setMenuOpen={setMenuOpen} activeSection={activeSection} />
          <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} activeSection={activeSection} />
          <Home />
          <Work />
          <Timeline />
          <Services />
          <Testimonial />
          <Contact />
          <Footer />
          <WhatsAppButton />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--color-bg-card)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                fontFamily: "var(--font-body)",
              },
              success: {
                iconTheme: {
                  primary: "var(--color-accent)",
                  secondary: "var(--color-bg-primary)",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ff5f56",
                  secondary: "var(--color-bg-primary)",
                },
              },
            }}
          />
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
