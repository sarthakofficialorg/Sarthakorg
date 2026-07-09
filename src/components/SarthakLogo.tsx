import React from 'react';
import { motion } from 'motion/react';

interface SarthakLogoProps {
  className?: string;
  animate?: boolean;
}

export const SarthakLogo: React.FC<SarthakLogoProps> = ({ className = 'w-10 h-10', animate = false }) => {
  const imageUrl = "https://drive.google.com/thumbnail?id=13V8OYEg5PKatMutFfUwQshQL22UGvSkC&sz=w1000";

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-xl bg-transparent ${className}`}>
      <img
        src={imageUrl}
        alt="Sarthak NGO Logo"
        className="w-full h-full object-contain max-h-full transition-transform duration-300 hover:scale-105"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback if the thumbnail service fails
          const target = e.target as HTMLImageElement;
          const fallbackUrl = "https://docs.google.com/uc?export=download&id=13V8OYEg5PKatMutFfUwQshQL22UGvSkC";
          if (target.src !== fallbackUrl) {
            target.src = fallbackUrl;
          }
        }}
      />
    </div>
  );
};

interface SarthakIntroProps {
  onComplete: () => void;
}

export const SarthakIntro: React.FC<SarthakIntroProps> = ({ onComplete }) => {
  React.useEffect(() => {
    // Beautiful minimalist starting text screen: lasts 3 seconds total, then transitions out
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white overflow-hidden transition-colors duration-300"
    >
      {/* Decorative premium ambient lights */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-rose-50/60 rounded-full blur-3xl opacity-40" />

      {/* Center content container - text only as requested */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 sm:gap-6"
        >
          {/* Sarthak - give a hand, change a life */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2.5 md:gap-4">
            <h1 className="font-serif text-5xl md:text-7xl font-extrabold tracking-wide text-[#de5678]">
              Sarthak
            </h1>
            <span className="hidden md:inline text-3xl text-rose-300 font-light">
              —
            </span>
            <p className="font-serif italic text-xl md:text-2xl text-gray-700 font-medium">
              give a hand, change a life
            </p>
          </div>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
            className="h-[2px] bg-rose-300/80 rounded-full"
          />
        </motion.div>
      </div>

      {/* Sleek Progress Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-50 overflow-hidden">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2.8, ease: 'easeInOut' }}
          className="h-full bg-gradient-to-r from-rose-400 via-[#de5678] to-rose-600 origin-left"
        />
      </div>
    </motion.div>
  );
};
