import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  pageVariants, 
  fadeInVariants, 
  fadeUpVariants, 
  scaleInVariants, 
  staggerContainerVariants,
  motionTokens
} from '../../design-system/motion';

/**
 * PageTransition Wrapper
 * Provides smooth, subtle page entrance and exit transitions respecting user reduced motion preferences.
 */
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * FadeIn Wrapper
 */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * FadeUp Wrapper
 */
export const FadeUp: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * ScaleIn Wrapper
 */
export const ScaleIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={scaleInVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Stagger Container
 */
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animated Card with subtle hover elevation
 */
export const MotionCard: React.FC<React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  className?: string;
  isInteractive?: boolean;
}> = ({ children, className = '', isInteractive = false, ...props }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !isInteractive) {
    return (
      <div className={`transition-all ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.995 }}
      className={className}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animated Metric / Number Transition
 */
export const AnimatedMetric: React.FC<{
  value: string | number;
  className?: string;
}> = ({ value, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={String(value)}
        initial={{ opacity: 0.6, y: -2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0.6, y: 2 }}
        transition={{ duration: motionTokens.duration.fast }}
        className={className}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
};
