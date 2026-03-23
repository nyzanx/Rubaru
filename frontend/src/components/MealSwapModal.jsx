import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

const MealSwapModal = ({ meal, mealType, date, onClose, onSwapped }) => {
  const { api } = useAuth();
  const [ingredients, setIngredients] = useState("");
  const [newMeal, setNewMeal] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    if (!ingredients.trim()) {
      toast.error("Please enter some ingredients");
      return;
    }

    setLoading(true);
    try {
      const ingredientList = ingredients.split(",").map(s => s.trim()).filter(Boolean);
      
      const response = await api.post("/plans/swap-meal", {
        date,
        meal_type: mealType,
        available_ingredients: ingredientList,
      });

      setNewMeal(response.data.swapped_meal);
      toast.success("Found an alternative meal!");
    } catch (error) {
      toast.error("Failed to find alternative meal");
    } finally {
      setLoading(false);
    }
  };

  const confirmSwap = () => {
    if (onSwapped) {
      onSwapped(newMeal);
    }
    onClose?.();
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
            Swap {mealType}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
          >
            ✕
          </button>
        </div>

        {/* Current Meal */}
        <div className="p-4 bg-stone-50 rounded-2xl mb-6">
          <span className="text-xs text-stone-500">Current meal</span>
          <p className="font-medium text-stone-900 mt-1">{meal?.name || "Not set"}</p>
        </div>

        {!newMeal ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-2">
                What ingredients do you have?
              </label>
              <Input
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g., chicken, rice, broccoli, garlic"
                data-testid="swap-ingredients-input"
                className="rounded-xl"
              />
              <p className="text-xs text-stone-400 mt-1">
                Separate ingredients with commas
              </p>
            </div>

            <Button
              onClick={handleSwap}
              disabled={loading || !ingredients.trim()}
              data-testid="find-alternative-btn"
              className="w-full bg-primary text-white hover:bg-primary/90 rounded-full h-12"
            >
              {loading ? "Finding alternatives..." : "Find Alternative"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* New Meal */}
            <div className="p-4 bg-success/10 rounded-2xl border border-success/20">
              <span className="text-xs text-success font-medium">Suggested alternative</span>
              <h3 className="font-heading text-lg font-semibold text-stone-900 mt-1">
                {newMeal.name}
              </h3>
              {newMeal.prep_time && (
                <p className="text-sm text-stone-500 mt-1">
                  {newMeal.prep_time} min prep
                </p>
              )}
              {newMeal.ingredients && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newMeal.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white rounded-full text-xs text-stone-600"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              )}
              {newMeal.instructions && (
                <p className="text-sm text-stone-600 mt-3">
                  {newMeal.instructions}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setNewMeal(null)}
                variant="outline"
                className="flex-1 rounded-full"
              >
                Try Again
              </Button>
              <Button
                onClick={confirmSwap}
                data-testid="confirm-swap-btn"
                className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full"
              >
                Use This Meal
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MealSwapModal;
