import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const calculateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollableHeight = documentHeight - viewportHeight;
      
      const progress = scrollableHeight > 0 
        ? Math.min((scrollTop / scrollableHeight) * 100, 100)
        : 0;
      
      setScrollProgress(progress);
    };

    // Initial calculation
    calculateScrollProgress();

    // Throttle scroll events using requestAnimationFrame
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Recalculate on resize (content height might change)
    window.addEventListener("resize", calculateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateScrollProgress);
    };
  }, []);

  // Calculate stroke-dasharray and stroke-dashoffset for circular progress
  // WhatsApp button is 60px, container is 80px
  // Now that container is offset to center-align with button:
  // - Button center and container center are both at (40, 40) in viewBox
  // - Button radius = 30px
  // - We want ring to wrap around with equal spacing
  // - Gap = (80 - 60) / 2 = 10px total, so 5px on each side
  // - Ring radius = button_radius + gap/2 = 30 + 5 = 35px
  // - But stroke-width 5 means stroke extends 2.5px inward and outward
  // - So actual radius for the circle path = 35 - 2.5 = 32.5px
  const radius = 32.5; // Perfectly centered around 60px button
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (scrollProgress / 100) * circumference;

  return (
    <motion.div 
      className="scroll-progress-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Circular progress ring */}
      <svg 
        className="scroll-progress-ring" 
        viewBox="0 0 80 80"
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--color-accent)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-accent-hover)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          className="scroll-progress-ring-bg"
          cx="40"
          cy="40"
          r={radius}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          className="scroll-progress-ring-fill"
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 30
          }}
          transform="rotate(-90 40 40)"
        />
      </svg>

      {/* Percentage display - positioned on top of WhatsApp icon */}
      <motion.div 
        className="scroll-progress-percentage"
        animate={{ 
          opacity: scrollProgress > 1 ? 1 : 0,
          scale: scrollProgress > 1 ? 1 : 0.9
        }}
        transition={{ duration: 0.3 }}
      >
        {Math.round(scrollProgress)}%
      </motion.div>
    </motion.div>
  );
};

export default ScrollProgress;
