/**
 * Animation constants and variants for Framer Motion
 */

/**
 * Enhanced animation variants for consistent motion design
 */
export const ANIMATION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

/**
 * Common animation durations
 */
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.4,
  SLOW: 0.6,
  EXTRA_SLOW: 0.8,
};

/**
 * Common easing functions
 */
export const EASING = {
  EASE_OUT: "easeOut",
  EASE_IN: "easeIn",
  EASE_IN_OUT: "easeInOut",
  BOUNCE: [0.68, -0.55, 0.265, 1.55],
};
