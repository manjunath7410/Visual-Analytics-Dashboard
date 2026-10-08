import { Variants, Transition } from 'motion/react';

/**
 * Visual Analytics Dashboard Motion Design System
 * Centralized motion tokens and reusable animation variants.
 * Professional, fast, subtle, and accessible.
 */

export const motionTokens = {
  duration: {
    instant: 0.08,
    fast: 0.15,
    standard: 0.22,
    medium: 0.32,
    slow: 0.45,
  },
  ease: {
    easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
    easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
    sharp: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  }
};

export const defaultTransition: Transition = {
  duration: motionTokens.duration.standard,
  ease: motionTokens.ease.easeOut,
};

export const fastTransition: Transition = {
  duration: motionTokens.duration.fast,
  ease: motionTokens.ease.easeOut,
};

// Page Transition Variants (Subtle fade + 4px vertical movement)
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 4,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.standard,
      ease: motionTokens.ease.easeOut,
    }
  },
  exit: {
    opacity: 0,
    y: -2,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.easeIn,
    }
  }
};

// Fade In Variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: motionTokens.duration.standard,
      ease: motionTokens.ease.easeOut,
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.easeIn,
    }
  }
};

// Fade Up Variants
export const fadeUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 6 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: motionTokens.duration.standard,
      ease: motionTokens.ease.easeOut,
    }
  },
  exit: { 
    opacity: 0, 
    y: -4,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.easeIn,
    }
  }
};

// Scale In Variants
export const scaleInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: motionTokens.duration.standard,
      ease: motionTokens.ease.easeOut,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.easeIn,
    }
  }
};

// Stagger Container Variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    }
  }
};

// Modal Backdrop Variants
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: motionTokens.duration.fast }
  },
  exit: { 
    opacity: 0,
    transition: { duration: motionTokens.duration.fast }
  }
};

// Modal Content Variants
export const modalContentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.98, 
    y: 6 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: motionTokens.duration.standard, 
      ease: motionTokens.ease.easeOut 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: 4,
    transition: { 
      duration: motionTokens.duration.fast, 
      ease: motionTokens.ease.easeIn 
    }
  }
};

// Drawer Slide Variants (Right to Left)
export const drawerVariants: Variants = {
  hidden: { 
    x: '100%',
    opacity: 0.8
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { 
      duration: motionTokens.duration.medium, 
      ease: motionTokens.ease.easeOut 
    }
  },
  exit: { 
    x: '100%',
    opacity: 0.8,
    transition: { 
      duration: motionTokens.duration.fast, 
      ease: motionTokens.ease.easeIn 
    }
  }
};
