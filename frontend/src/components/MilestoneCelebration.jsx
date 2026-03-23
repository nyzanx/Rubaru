import { useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

const celebrationMessages = {
  7: {
    title: "1 Week Strong! 🎉",
    message: "You both showed up every single day this week. That's not luck — that's commitment!",
  },
  14: {
    title: "Two Weeks Together! 💪",
    message: "14 days of supporting each other. You're building something beautiful here.",
  },
  30: {
    title: "One Month! 🏆",
    message: "A whole month of consistency! You've proven that you can do this together.",
  },
  60: {
    title: "60 Days! 🌟",
    message: "Two months of dedication. You're not just building habits — you're building a healthier life together.",
  },
  90: {
    title: "90 Day Champions! 🔥",
    message: "Three months! Science says habits are now locked in. You did it!",
  },
  180: {
    title: "Half a Year! 🎊",
    message: "Six months of showing up for each other. You're an inspiration!",
  },
  365: {
    title: "ONE YEAR! 👑",
    message: "365 days together. This is legendary. You've transformed your lives!",
  },
};

const MilestoneCelebration = ({ milestone, onClose, streakCount }) => {
  useEffect(() => {
    // Fire confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#D96C5B", "#E9C46A", "#84A98C", "#F4A261"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#D96C5B", "#E9C46A", "#84A98C", "#F4A261"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst at start
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#D96C5B", "#E9C46A", "#84A98C", "#F4A261"],
    });
  }, []);

  const days = milestone?.days || streakCount;
  const content = celebrationMessages[days] || {
    title: `${days} Day Streak! 🎉`,
    message: "Amazing work showing up together! Keep it going!",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200"
          >
            <span className="text-5xl">🏆</span>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-heading text-3xl font-bold text-stone-900 mb-4"
          >
            {content.title}
          </motion.h2>

          {/* Streak number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-6"
          >
            <span className="text-4xl font-heading font-bold text-primary">{days}</span>
            <span className="text-primary font-medium">days together</span>
            <span className="text-2xl">🔥</span>
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-stone-600 leading-relaxed mb-8"
          >
            {content.message}
          </motion.p>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={onClose}
            data-testid="celebration-close-btn"
            className="bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
          >
            Keep Going! 💪
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MilestoneCelebration;
