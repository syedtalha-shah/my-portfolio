import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Terminal = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const codeLines = [
    { type: "comment", text: "// Welcome to my portfolio" },
    { type: "command", text: "const developer = {" },
    { type: "property", text: '  name: "Talha",' },
    { type: "property", text: '  role: "Full Stack Developer",' },
    { type: "property", text: "  skills: [" },
    { type: "array", text: '    "React", "Node.js", "Next.js", "TypeScript",' },
    { type: "array", text: '    "AWS", "NestJS", "WebSockets"' },
    { type: "property", text: "  ]," },
    { type: "property", text: "  passion: \"Building amazing apps\"" },
    { type: "command", text: "};" },
    { type: "blank", text: "" },
    { type: "output", text: "> developer.sayHello()" },
    { type: "result", text: '"Hello! Let\'s build something great!"' },
  ];

  useEffect(() => {
    if (currentLine >= codeLines.length) {
      // Reset after a delay
      const resetTimeout = setTimeout(() => {
        setCurrentLine(0);
        setDisplayedText("");
        setIsTyping(true);
      }, 4000);
      return () => clearTimeout(resetTimeout);
    }

    const line = codeLines[currentLine];
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      if (charIndex <= line.text.length) {
        setDisplayedText(line.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Move to next line after a short delay
        const nextLineTimeout = setTimeout(() => {
          setCurrentLine(prev => prev + 1);
          setDisplayedText("");
          setIsTyping(true);
        }, line.type === "blank" ? 100 : 300);
        
        return () => clearTimeout(nextLineTimeout);
      }
    }, 40);

    return () => clearInterval(typingInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLine]);

  const getLineClass = (type) => {
    switch (type) {
      case "comment":
        return "terminal__comment";
      case "command":
        return "terminal__keyword";
      case "property":
        return "terminal__variable";
      case "array":
        return "terminal__string";
      case "output":
        return "terminal__prompt";
      case "result":
        return "terminal__string";
      default:
        return "";
    }
  };

  const renderLine = (line, index) => {
    const isCurrentLine = index === currentLine;
    const isPastLine = index < currentLine;
    
    if (!isPastLine && !isCurrentLine) return null;

    return (
      <motion.div
        key={index}
        className="terminal__line"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className={getLineClass(line.type)}>
          {isCurrentLine ? displayedText : line.text}
          {isCurrentLine && isTyping && <span className="terminal__cursor" />}
        </span>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="terminal"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="terminal__header">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--yellow" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">talha@portfolio ~ </span>
      </div>
      <div className="terminal__body">
        {codeLines.map((line, index) => renderLine(line, index))}
      </div>
    </motion.div>
  );
};

export default Terminal;

