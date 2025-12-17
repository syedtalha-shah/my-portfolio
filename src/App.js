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
      const viewportHeight = window.innerHeight;
      const viewportTop = scrollY;
      const viewportBottom = scrollY + viewportHeight;
      const viewportCenter = scrollY + viewportHeight / 2;

      // Check if we're at the very top
      if (scrollY < 100) {
        setActiveSection("home");
        return;
      }

      // Find the section that contains the viewport center or is most visible
      let currentSection = "home";
      let bestScore = -1;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          const sectionTop = rect.top + scrollY;
          const sectionBottom = sectionTop + rect.height;
          
          // Check if viewport center is within this section (highest priority)
          if (viewportCenter >= sectionTop && viewportCenter <= sectionBottom) {
            currentSection = sections[i];
            break;
          }
          
          // Calculate visibility score
          const visibleTop = Math.max(rect.top, 0);
          const visibleBottom = Math.min(rect.bottom, viewportHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          
          // Score based on how much is visible and how close to viewport center
          if (visibleHeight > 0) {
            const distanceFromCenter = Math.abs((sectionTop + sectionBottom) / 2 - viewportCenter);
            const score = visibleHeight / rect.height - (distanceFromCenter / viewportHeight) * 0.5;
            
            if (score > bestScore) {
              bestScore = score;
              currentSection = sections[i];
            }
          }
        }
      }

      setActiveSection(currentSection);
    };

    // Use Intersection Observer with better configuration
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -30% 0px", // Only trigger when section is in middle 40% of viewport
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    // Track all sections and their intersection states
    const sectionStates = new Map();
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;
        if (sectionId) {
          sectionStates.set(sectionId, {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            boundingClientRect: entry.boundingClientRect,
          });
        }
      });

      // Find the section with the best intersection (highest ratio and intersecting)
      let bestSection = "home";
      let bestRatio = 0;

      sectionStates.forEach((state, id) => {
        if (state.isIntersecting && state.intersectionRatio > bestRatio) {
          bestRatio = state.intersectionRatio;
          bestSection = id;
        }
      });

      // Only update if we have a good intersection
      if (bestRatio > 0.2) {
        setActiveSection(bestSection);
      }
    }, observerOptions);

    // Observe all sections
    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    // Initial check
    const timeoutId = setTimeout(updateActiveSection, 300);
    
    // Listen to scroll events with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Handle hash changes (when clicking nav links)
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sections.includes(hash)) {
        setActiveSection(hash);
        // Also trigger scroll update after a short delay to ensure correct state
        setTimeout(updateActiveSection, 100);
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
      observer.disconnect();
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
