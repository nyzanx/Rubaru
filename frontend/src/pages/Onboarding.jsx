import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { useAuth } from "../App";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { api, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    health_goals: [],
    dietary_preferences: [],
    food_allergies: [],
    ingredient_dislikes: "",
    busiest_days: [],
    workout_times: "morning",
    workout_types: [],
    fitness_level: "intermediate",
    track_cycle: false,
    cycle_length: "28",
    last_period_date: "",
    grace_period_enabled: true,
  });

  const totalSteps = 5;

  const healthGoals = [
    { id: "weight_loss", label: "Lose weight", icon: "📉" },
    { id: "muscle_gain", label: "Build muscle", icon: "💪" },
    { id: "energy", label: "More energy", icon: "⚡" },
    { id: "reduce_pain", label: "Reduce pain", icon: "🩹" },
    { id: "reduce_stress", label: "Reduce stress", icon: "🧘" },
    { id: "better_sleep", label: "Better sleep", icon: "😴" },
  ];

  const dietaryOptions = [
    { id: "none", label: "No restrictions" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "pescatarian", label: "Pescatarian" },
    { id: "keto", label: "Keto" },
    { id: "gluten_free", label: "Gluten-free" },
    { id: "dairy_free", label: "Dairy-free" },
  ];

  const workoutTypes = [
    { id: "gym", label: "Gym / Weightlifting", icon: "🏋️" },
    { id: "running", label: "Running / Cardio", icon: "🏃" },
    { id: "yoga", label: "Yoga / Stretching", icon: "🧘" },
  ];

  const weekdays = [
    { id: "monday", label: "Mon" },
    { id: "tuesday", label: "Tue" },
    { id: "wednesday", label: "Wed" },
    { id: "thursday", label: "Thu" },
    { id: "friday", label: "Fri" },
    { id: "saturday", label: "Sat" },
    { id: "sunday", label: "Sun" },
  ];

  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        age: parseInt(formData.age) || null,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        cycle_length: parseInt(formData.cycle_length) || 28,
        ingredient_dislikes: formData.ingredient_dislikes.split(",").map(s => s.trim()).filter(Boolean),
      };
      
      await api.post("/onboarding", data);
      toast.success("Onboarding complete! Let's get started.");
      
      // Update user state
      setUser(prev => ({ ...prev, onboarding_complete: true }));
      navigate("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-bold text-stone-900 mb-2">
                Let's get to know you
              </h2>
              <p className="text-stone-600">Basic info helps us personalize your plan.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="30"
                  data-testid="onboarding-age"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  data-testid="onboarding-weight"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="170"
                  data-testid="onboarding-height"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-bold text-stone-900 mb-2">
                What are your goals?
              </h2>
              <p className="text-stone-600">Select all that apply.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {healthGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => setFormData({
                    ...formData,
                    health_goals: toggleArrayItem(formData.health_goals, goal.id)
                  })}
                  data-testid={`goal-${goal.id}`}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    formData.health_goals.includes(goal.id)
                      ? "border-primary bg-primary/5"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{goal.icon}</span>
                  <span className="font-medium text-stone-900">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-bold text-stone-900 mb-2">
                Dietary preferences
              </h2>
              <p className="text-stone-600">Help us plan meals you'll actually enjoy.</p>
            </div>

            <div className="space-y-4">
              <Label>Diet type</Label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({
                      ...formData,
                      dietary_preferences: toggleArrayItem(formData.dietary_preferences, option.id)
                    })}
                    data-testid={`diet-${option.id}`}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      formData.dietary_preferences.includes(option.id)
                        ? "border-primary bg-primary text-white"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Food allergies (optional)</Label>
              <Input
                id="allergies"
                value={formData.food_allergies.join(", ")}
                onChange={(e) => setFormData({
                  ...formData,
                  food_allergies: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                })}
                placeholder="e.g., peanuts, shellfish"
                data-testid="onboarding-allergies"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dislikes">Ingredients you dislike (optional)</Label>
              <Input
                id="dislikes"
                value={formData.ingredient_dislikes}
                onChange={(e) => setFormData({ ...formData, ingredient_dislikes: e.target.value })}
                placeholder="e.g., cilantro, mushrooms"
                data-testid="onboarding-dislikes"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-bold text-stone-900 mb-2">
                Workout preferences
              </h2>
              <p className="text-stone-600">What kind of exercise do you enjoy?</p>
            </div>

            <div className="space-y-4">
              <Label>Workout types</Label>
              <div className="grid grid-cols-3 gap-4">
                {workoutTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({
                      ...formData,
                      workout_types: toggleArrayItem(formData.workout_types, type.id)
                    })}
                    data-testid={`workout-${type.id}`}
                    className={`p-4 rounded-2xl border-2 text-center transition-all ${
                      formData.workout_types.includes(type.id)
                        ? "border-primary bg-primary/5"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <span className="text-3xl mb-2 block">{type.icon}</span>
                    <span className="text-sm font-medium text-stone-900">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Fitness level</Label>
              <div className="flex gap-2">
                {["beginner", "intermediate", "advanced"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFormData({ ...formData, fitness_level: level })}
                    data-testid={`fitness-${level}`}
                    className={`flex-1 py-3 rounded-full border transition-all capitalize ${
                      formData.fitness_level === level
                        ? "border-primary bg-primary text-white"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Busiest days (we'll go easier on you)</Label>
              <div className="flex gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => setFormData({
                      ...formData,
                      busiest_days: toggleArrayItem(formData.busiest_days, day.id)
                    })}
                    data-testid={`busy-${day.id}`}
                    className={`flex-1 py-2 rounded-full border text-sm transition-all ${
                      formData.busiest_days.includes(day.id)
                        ? "border-warning bg-warning text-stone-900"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl font-bold text-stone-900 mb-2">
                Almost done!
              </h2>
              <p className="text-stone-600">A few more optional settings.</p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900">Track menstrual cycle</p>
                  <p className="text-sm text-stone-500">We'll adjust workouts and meals accordingly</p>
                </div>
                <Checkbox
                  checked={formData.track_cycle}
                  onCheckedChange={(checked) => setFormData({ ...formData, track_cycle: checked })}
                  data-testid="track-cycle-checkbox"
                />
              </div>

              {formData.track_cycle && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4 border-t border-stone-200"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cycle length (days)</Label>
                      <Input
                        type="number"
                        value={formData.cycle_length}
                        onChange={(e) => setFormData({ ...formData, cycle_length: e.target.value })}
                        data-testid="cycle-length"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last period start</Label>
                      <Input
                        type="date"
                        value={formData.last_period_date}
                        onChange={(e) => setFormData({ ...formData, last_period_date: e.target.value })}
                        data-testid="last-period"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-stone-500">
                    This information is private and only affects your personal plan adjustments.
                  </p>
                </motion.div>
              )}
            </div>

            <div className="bg-stone-50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900">Grace period for streaks</p>
                  <p className="text-sm text-stone-500">Allow one missed day without breaking streak</p>
                </div>
                <Checkbox
                  checked={formData.grace_period_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, grace_period_enabled: checked })}
                  data-testid="grace-period-checkbox"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-lg mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-stone-600">Step {step} of {totalSteps}</span>
            <span className="text-sm text-stone-500">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button
              onClick={prevStep}
              variant="outline"
              data-testid="onboarding-back"
              className="flex-1 rounded-full h-12 border-stone-200"
            >
              Back
            </Button>
          )}
          <Button
            onClick={nextStep}
            disabled={loading}
            data-testid="onboarding-next"
            className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full h-12"
          >
            {loading ? "Saving..." : step === totalSteps ? "Complete Setup" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
