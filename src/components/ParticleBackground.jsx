import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const ParticleBackground = ({ density = "medium", color = "#00f5d4", section = "home" }) => {
  const [Particles, setParticles] = useState(null);
  const [loadSlim, setLoadSlim] = useState(null);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Dynamically import to avoid SSR issues
    const loadParticles = async () => {
      try {
        const ParticlesModule = await import("react-particles");
        const loadSlimModule = await import("tsparticles-slim");
        
        // react-particles exports Particles as default
        const ParticlesComponent = ParticlesModule.default;
        setParticles(() => ParticlesComponent);
        setLoadSlim(() => loadSlimModule.loadSlim);
      } catch (err) {
        console.error("Failed to load particles:", err);
        setError(err);
      }
    };
    if (typeof window !== "undefined") {
      loadParticles();
    }
  }, []);

  const particlesInit = useCallback(
    async (engine) => {
      if (loadSlim) {
        await loadSlim(engine);
      }
    },
    [loadSlim]
  );

  // Get color based on current theme - directly use theme colors for reliability
  const particleColor = useMemo(() => {
    // Use theme-specific colors directly for consistent behavior
    return theme === "light" ? "#e85d4c" : "#00f5d4";
  }, [theme]);

  // Configure particle count based on density
  const getParticleCount = () => {
    switch (density) {
      case "low":
        return 30;
      case "medium":
        return 50;
      case "high":
        return 80;
      default:
        return 50;
    }
  };

  const particlesConfig = {
    particles: {
      number: {
        value: getParticleCount(),
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: particleColor,
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.3,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.5,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: particleColor,
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "grab",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 0.4,
          },
        },
        push: {
          particles_nb: 4,
        },
      },
    },
    retina_detect: true,
  };

  // Don't render if there's an error or Particles hasn't loaded yet
  if (error || !Particles || !loadSlim) {
    return null; // Silently fail if particles can't load
  }

  try {
    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Particles
          key={`particles-${section}-${theme}`}
          id={`particles-${section}-${theme}`}
          init={particlesInit}
          options={particlesConfig}
          style={{
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  } catch (err) {
    console.error("Error rendering particles:", err);
    return null;
  }
};

export default ParticleBackground;


