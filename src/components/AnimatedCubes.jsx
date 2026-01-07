import { motion, useAnimation } from "framer-motion";
import { memo, useEffect, useRef } from "react";

const generateRandom = (min, max) => Math.random() * (max - min) + min;

// Memoize the Cube component to prevent unnecessary re-renders
const Cube = memo(({ delay }) => {
  const controls = useAnimation();
  const cubeRef = useRef(null);
  const size = generateRandom(40, 100); // px, slightly wider range for more variety

  useEffect(() => {
    const animateCube = async () => {
      const x = generateRandom(-500, 500); // Wider range for x movement
      const y = generateRandom(-1200, -100); // Deeper vertical movement
      const rotate = generateRandom(0, 720); // More rotation
      const duration = generateRandom(10, 20); // Longer animation durations

      // Use a single animation sequence with less complexity
      controls.start({
        x,
        y,
        rotate,
        opacity: [0.2, 0.6, 0.2], // Increased opacity for better visibility
        transition: {
          duration,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay,
        },
      });
    };

    animateCube();

    // Cleanup function to stop animations when component unmounts
    return () => {
      controls.stop();
    };
  }, [controls, delay]);

  return (
    <motion.div
      ref={cubeRef}
      style={{
        width: size,
        height: size,
        left: generateRandom(0, window.innerWidth), // full-screen width
        top: generateRandom(0, window.innerHeight),
        boxShadow: "0 0 15px rgba(129, 140, 248, 0.3)", // Adding glow effect
      }}
      className="absolute rounded-md bg-indigo-400/30 opacity-30 backdrop-blur-sm"
      animate={controls}
      initial={{ opacity: 0 }}
    />
  );
});

const AnimatedCubes = ({ count = 25, performance = "medium" }) => {
  // Adjust cube count based on performance setting
  const actualCount = performance === "low" ? Math.min(count, 10) : 
                      performance === "medium" ? Math.min(count, 25) : 
                      Math.min(count, 40);
  
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {[...Array(actualCount)].map((_, i) => (
        <Cube key={i} delay={i * 0.3} />
      ))}
    </div>
  );
};

export default AnimatedCubes;
