import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";

const tutorialSteps = [
  {
    id: "welcome",
    title: "Welcome to Rubaru! 🎉",
    description: "Your partner health journey starts here. Let us show you around — it'll take less than a minute.",
    position: "center",
    highlight: null,
  },
  {
    id: "streak",
    title: "Your Shared Streak 🔥",
    description: "This is the heart of Rubaru. Both you AND your partner need to complete the day's tasks for the streak to count. It's accountability built on love.",
    position: "top",
    highlight: "[data-testid='streak-card']",
    arrow: "bottom",
  },
  {
    id: "workout",
    title: "Today's Workout 💪",
    description: "Your personalized workout for today. Tap 'Log' when done, or use the '⚡ 15 min' button if you're short on time.",
    position: "right",
    highlight: "[data-testid='workout-card']",
    arrow: "left",
  },
  {
    id: "water",
    title: "Stay Hydrated 💧",
    description: "Track your water intake with quick taps. Aim for 8 glasses a day!",
    position: "left",
    highlight: "[data-testid='water-card']",
    arrow: "right",
  },
  {
    id: "meals",
    title: "Your Meals 🍽️",
    description: "We plan breakfast, lunch, dinner & snacks for you. Tap any meal to log it or swap it based on what you have.",
    position: "top",
    highlight: "[data-testid='meals-card']",
    arrow: "bottom",
  },
  {
    id: "mood",
    title: "How Do You Feel? 😊",
    description: "Quick daily check-in on energy and mood. This helps us optimize your plan over time.",
    position: "left",
    highlight: "[data-testid='mood-card']",
    arrow: "right",
  },
  {
    id: "nav-plan",
    title: "Weekly Plan 📅",
    description: "See your full week's workouts and meals. You can drag days to reschedule, scan ingredients from your fridge, and swap meals.",
    position: "right",
    highlight: "[data-testid='nav-desktop-calendar']",
    arrow: "left",
  },
  {
    id: "nav-log",
    title: "Daily Log ✏️",
    description: "Log everything in under 60 seconds: workout, meals, water, sleep, and how you're feeling.",
    position: "right",
    highlight: "[data-testid='nav-desktop-edit']",
    arrow: "left",
  },
  {
    id: "nav-progress",
    title: "Track Progress 📊",
    description: "See your journey: weight trends, energy patterns, milestones achieved, and cycle insights if enabled.",
    position: "right",
    highlight: "[data-testid='nav-desktop-chart']",
    arrow: "left",
  },
  {
    id: "partner",
    title: "Better Together 💑",
    description: "Remember: Rubaru works best when you do it with your partner. Share your invite code from Settings to pair up!",
    position: "center",
    highlight: null,
  },
  {
    id: "done",
    title: "You're All Set! 🚀",
    description: "Start by generating your first weekly plan. Show up every day, and watch your streak grow together. You've got this!",
    position: "center",
    highlight: null,
    cta: "Let's Go!",
  },
];

const Tutorial = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPos, setHighlightPos] = useState(null);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    if (step.highlight) {
      const element = document.querySelector(step.highlight);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightPos({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
        
        // Scroll element into view if needed
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setHighlightPos(null);
      }
    } else {
      setHighlightPos(null);
    }
  }, [currentStep, step.highlight]);

  const nextStep = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (step.position === "center" || !highlightPos) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 20;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (step.position) {
      case "top":
        return {
          top: highlightPos.top - tooltipHeight - padding,
          left: highlightPos.left + highlightPos.width / 2 - tooltipWidth / 2,
        };
      case "bottom":
        return {
          top: highlightPos.top + highlightPos.height + padding,
          left: highlightPos.left + highlightPos.width / 2 - tooltipWidth / 2,
        };
      case "left":
        return {
          top: highlightPos.top + highlightPos.height / 2 - tooltipHeight / 2,
          left: highlightPos.left - tooltipWidth - padding,
        };
      case "right":
        return {
          top: highlightPos.top + highlightPos.height / 2 - tooltipHeight / 2,
          left: highlightPos.left + highlightPos.width + padding,
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  const getArrowStyle = () => {
    if (!step.arrow) return null;
    
    const base = "absolute w-4 h-4 bg-white transform rotate-45";
    
    switch (step.arrow) {
      case "top":
        return `${base} -top-2 left-1/2 -translate-x-1/2`;
      case "bottom":
        return `${base} -bottom-2 left-1/2 -translate-x-1/2`;
      case "left":
        return `${base} top-1/2 -left-2 -translate-y-1/2`;
      case "right":
        return `${base} top-1/2 -right-2 -translate-y-1/2`;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60"
        onClick={onSkip}
      />

      {/* Highlight cutout */}
      {highlightPos && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute rounded-2xl ring-4 ring-primary ring-offset-4 ring-offset-transparent z-[101]"
          style={{
            top: highlightPos.top,
            left: highlightPos.left,
            width: highlightPos.width,
            height: highlightPos.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-[102] w-80 bg-white rounded-3xl p-6 shadow-2xl"
          style={getTooltipPosition()}
        >
          {/* Arrow */}
          {step.arrow && <div className={getArrowStyle()} />}

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep
                    ? "bg-primary"
                    : idx < currentStep
                    ? "bg-primary/40"
                    : "bg-stone-200"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <h3 className="font-heading text-xl font-bold text-stone-900 mb-2 text-center">
            {step.title}
          </h3>
          <p className="text-stone-600 text-center leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex-1 rounded-full border-stone-200"
              >
                Back
              </Button>
            )}
            {isFirstStep && (
              <Button
                onClick={onSkip}
                variant="ghost"
                className="flex-1 rounded-full text-stone-500"
                data-testid="skip-tutorial-btn"
              >
                Skip
              </Button>
            )}
            <Button
              onClick={nextStep}
              className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full"
              data-testid="next-tutorial-btn"
            >
              {step.cta || (isLastStep ? "Finish" : "Next")}
            </Button>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-stone-400 mt-4">
            {currentStep + 1} of {tutorialSteps.length}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Tutorial;
