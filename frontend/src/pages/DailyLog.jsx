import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";

const DailyLog = () => {
  const { api, user } = useAuth();
  const [log, setLog] = useState({
    date: new Date().toISOString().split("T")[0],
    workout_completed: false,
    workout_details: null,
    meals_logged: [],
    water_intake: 0,
    energy_level: 3,
    pain_level: 1,
    pain_location: "",
    mood: "😊",
    sleep_hours: 7,
    sleep_quality: 3,
    menstrual_symptoms: [],
    cravings: "",
    weight: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const moods = ["😫", "😔", "😐", "😊", "😄"];
  const meals = ["breakfast", "lunch", "dinner", "snacks"];

  useEffect(() => {
    fetchTodayLog();
  }, []);

  const fetchTodayLog = async () => {
    try {
      const response = await api.get(`/logs/${log.date}`);
      if (response.data && Object.keys(response.data).length > 0) {
        setLog(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error("Error fetching log:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/logs", log);
      toast.success("Log saved!");
    } catch (error) {
      console.error("Error saving log:", error);
      toast.error("Failed to save log");
    } finally {
      setSaving(false);
    }
  };

  const toggleMeal = (meal) => {
    setLog(prev => ({
      ...prev,
      meals_logged: prev.meals_logged.includes(meal)
        ? prev.meals_logged.filter(m => m !== meal)
        : [...prev.meals_logged, meal]
    }));
  };

  const adjustWater = (delta) => {
    setLog(prev => ({
      ...prev,
      water_intake: Math.max(0, Math.min(12, prev.water_intake + delta))
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-primary text-xl font-heading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-app py-8 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
          <h1 className="font-heading text-3xl font-bold text-stone-900 tracking-tight mt-1">
            Daily Log
          </h1>
          <p className="text-stone-600 mt-2">Track your progress in under 60 seconds.</p>
        </motion.div>

        <div className="space-y-6">
          {/* Workout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-stone-900">Workout</h3>
                <p className="text-stone-500 text-sm">Did you complete today's workout?</p>
              </div>
              <button
                onClick={() => setLog(prev => ({ ...prev, workout_completed: !prev.workout_completed }))}
                data-testid="workout-toggle"
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                  log.workout_completed
                    ? "bg-success text-white"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {log.workout_completed ? "✓" : "🏋️"}
              </button>
            </div>
          </motion.div>

          {/* Meals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="font-heading text-lg font-semibold text-stone-900 mb-4">Meals</h3>
            <div className="grid grid-cols-4 gap-3">
              {meals.map((meal) => (
                <button
                  key={meal}
                  onClick={() => toggleMeal(meal)}
                  data-testid={`meal-${meal}`}
                  className={`p-4 rounded-2xl text-center transition-all ${
                    log.meals_logged.includes(meal)
                      ? "bg-success text-white"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  <span className="text-2xl block mb-1">
                    {meal === "breakfast" ? "🍳" : meal === "lunch" ? "🥗" : meal === "dinner" ? "🍽️" : "🍎"}
                  </span>
                  <span className="text-xs font-medium capitalize">{meal}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Water */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="font-heading text-lg font-semibold text-stone-900 mb-4">Water Intake</h3>
            <div className="flex items-center justify-between">
              <button
                onClick={() => adjustWater(-1)}
                data-testid="water-minus"
                className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center justify-center text-2xl"
              >
                -
              </button>
              <div className="text-center">
                <span className="font-heading text-4xl font-bold text-stone-900">{log.water_intake}</span>
                <span className="text-stone-500 block text-sm">glasses</span>
              </div>
              <button
                onClick={() => adjustWater(1)}
                data-testid="water-plus"
                className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center justify-center text-2xl"
              >
                +
              </button>
            </div>
            <div className="flex gap-1 mt-4 justify-center">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-8 rounded transition-colors ${
                    i < log.water_intake ? "bg-blue-400" : "bg-stone-200"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Energy & Pain */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Energy Level</Label>
                  <span className="text-sm text-stone-500">{log.energy_level}/5</span>
                </div>
                <Slider
                  value={[log.energy_level]}
                  onValueChange={([value]) => setLog(prev => ({ ...prev, energy_level: value }))}
                  min={1}
                  max={5}
                  step={1}
                  data-testid="energy-slider"
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Pain Level</Label>
                  <span className="text-sm text-stone-500">{log.pain_level}/5</span>
                </div>
                <Slider
                  value={[log.pain_level]}
                  onValueChange={([value]) => setLog(prev => ({ ...prev, pain_level: value }))}
                  min={1}
                  max={5}
                  step={1}
                  data-testid="pain-slider"
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-1">
                  <span>None</span>
                  <span>Severe</span>
                </div>
                {log.pain_level > 2 && (
                  <Input
                    placeholder="Where does it hurt?"
                    value={log.pain_location}
                    onChange={(e) => setLog(prev => ({ ...prev, pain_location: e.target.value }))}
                    data-testid="pain-location"
                    className="mt-3 rounded-xl"
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Mood */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="font-heading text-lg font-semibold text-stone-900 mb-4">How do you feel?</h3>
            <div className="flex justify-between">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setLog(prev => ({ ...prev, mood }))}
                  data-testid={`mood-${mood}`}
                  className={`w-14 h-14 rounded-2xl text-3xl transition-all ${
                    log.mood === mood
                      ? "bg-primary/10 scale-110"
                      : "bg-stone-100 hover:bg-stone-200"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sleep */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h3 className="font-heading text-lg font-semibold text-stone-900 mb-4">Sleep</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-stone-500">Hours</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    value={log.sleep_hours}
                    onChange={(e) => setLog(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) || 0 }))}
                    data-testid="sleep-hours"
                    className="h-12 rounded-xl text-center text-lg font-semibold"
                    min={0}
                    max={24}
                    step={0.5}
                  />
                  <span className="text-stone-500">hrs</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-stone-500">Quality</Label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      onClick={() => setLog(prev => ({ ...prev, sleep_quality: q }))}
                      data-testid={`sleep-quality-${q}`}
                      className={`flex-1 h-12 rounded-xl transition-all ${
                        q <= log.sleep_quality
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      😴
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weight (optional) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-stone-50 rounded-3xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-stone-900">Weight (optional)</h3>
                <p className="text-stone-500 text-sm">Track weekly for best results</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={log.weight}
                  onChange={(e) => setLog(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="--"
                  data-testid="weight-input"
                  className="w-20 h-12 rounded-xl text-center"
                  step={0.1}
                />
                <span className="text-stone-500">kg</span>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              data-testid="save-log-btn"
              className="w-full bg-primary text-white hover:bg-primary/90 rounded-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? "Saving..." : "Save Log"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DailyLog;
