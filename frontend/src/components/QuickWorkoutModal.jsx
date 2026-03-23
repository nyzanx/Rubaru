import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const QuickWorkoutModal = ({ onClose }) => {
  const { api } = useAuth();
  const [minutes, setMinutes] = useState(15);
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const getQuickWorkout = async () => {
    setLoading(true);
    try {
      const response = await api.post("/plans/quick-workout", {
        date: today,
        available_minutes: minutes,
      });
      setWorkout(response.data.workout);
    } catch (error) {
      toast.error("Failed to get quick workout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-semibold text-stone-900">
            Quick Workout
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
          >
            ✕
          </button>
        </div>

        {!workout ? (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-stone-600 mb-4">How much time do you have?</p>
              <div className="flex gap-2 justify-center">
                {[10, 15, 20, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMinutes(m)}
                    data-testid={`quick-${m}min`}
                    className={`px-4 py-3 rounded-full font-medium transition-all ${
                      minutes === m
                        ? "bg-primary text-white"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={getQuickWorkout}
              disabled={loading}
              data-testid="get-quick-workout-btn"
              className="w-full bg-primary text-white hover:bg-primary/90 rounded-full h-12"
            >
              {loading ? "Generating..." : "Get Quick Workout"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl mb-2 block">⚡</span>
              <h3 className="font-heading text-xl font-semibold text-stone-900">
                {workout.name}
              </h3>
              <p className="text-stone-500">{workout.duration_minutes} minutes</p>
            </div>

            <div className="space-y-2">
              {workout.exercises?.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                >
                  <span className="font-medium text-stone-900">{exercise.name}</span>
                  <span className="text-stone-500 text-sm">
                    {exercise.reps ? `${exercise.reps} reps` : exercise.duration}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setWorkout(null)}
                variant="outline"
                className="flex-1 rounded-full"
              >
                Try Different
              </Button>
              <Button
                onClick={onClose}
                data-testid="start-workout-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full"
              >
                Let's Go!
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QuickWorkoutModal;
