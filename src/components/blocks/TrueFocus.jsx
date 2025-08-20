import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const TrueFocus = ({
  manualMode = false,
  blurAmount = 4,
  borderColor = "rgba(255, 255, 255, 0.7)",
  glowColor = "rgba(255, 255, 255, 0.7)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
}) => {
  const lines = [
    ["Sekolah"],
    ["Adiwiyata"],
  ];
  const subheading = "Bersama Selamatkan Bumi";

  const words = lines.flat();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState(null);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);
      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();

    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    });
  }, [currentIndex]);

  const handleMouseEnter = (index) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      setCurrentIndex(lastActiveIndex);
    }
  };

  let wordIndex = 0;

  return (
    <div ref={containerRef} className="relative w-full text-left max-w-5xl">
      <h1 className="text-5xl md:text-8xl font-black leading-tight text-white">
        {lines.map((line, lineIndex) => (
          <div key={lineIndex} className="mb-2">
            {line.map((word) => {
              const isActive = wordIndex === currentIndex;
              const refIndex = wordIndex;

              const el = (
                <span
                  key={refIndex}
                  ref={(el) => (wordRefs.current[refIndex] = el)}
                  className="inline-block mr-3 bg-gradient-to-r from-green-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent cursor-pointer opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: `${0.2 + refIndex * 0.2}s`,
                    animationFillMode: "both",
                    filter: isActive ? "blur(0)" : `blur(${blurAmount}px)`,
                    transition: `filter ${animationDuration}s ease`,
                  }}
                  onMouseEnter={() => handleMouseEnter(refIndex)}
                  onMouseLeave={handleMouseLeave}
                >
                  {word}
                </span>
              );

              wordIndex++;
              return el;
            })}
          </div>
        ))}
        <span
          className="block text-2xl md:text-4xl font-medium text-white text-opacity-90 mt-6 opacity-0 animate-fadeInUp"
          style={{
            animationDelay: `${0.4 + words.length * 0.2}s`,
            animationFillMode: "both",
          }}
        >
          {subheading}
        </span>
      </h1>

      <motion.div
        className="absolute top-0 left-0 pointer-events-none box-border border-0"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
        }}
        transition={{ duration: animationDuration }}
        style={{
          "--border-color": borderColor,
          "--glow-color": glowColor,
        }}
      >
        {["top-[-10px] left-[-10px] border-r-0 border-b-0",
          "top-[-10px] right-[-10px] border-l-0 border-b-0",
          "bottom-[-10px] left-[-10px] border-r-0 border-t-0",
          "bottom-[-10px] right-[-10px] border-l-0 border-t-0"
        ].map((pos, idx) => (
          <span
            key={idx}
            className={`absolute w-4 h-4 border-[3px] rounded-[3px] ${pos}`}
            style={{
              borderColor: "var(--border-color)",
              filter: "drop-shadow(0 0 6px var(--glow-color))",
            }}
          ></span>
        ))}
      </motion.div>
    </div>
  );
};

export default TrueFocus;
