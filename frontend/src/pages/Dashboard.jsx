import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import MilestoneCelebration from "../components/MilestoneCelebration";
import QuickWorkoutModal from "../components/QuickWorkoutModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { api, user, couple, refreshCouple } = useAuth();
  const [todayPlan, setTodayPlan] = useState(null);
  const [coupleLogs, setCoupleLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingMilestone, setPendingMilestone] = useState(null);
  const [showQuickWorkout, setShowQuickWorkout] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  useEffect(() => {
    // Don't redirect during initial load
    if (!user) return;
    
    if (!user.onboarding_complete) {
      navigate("/onboarding");
      return;
    }
    
    // Allow access to dashboard even without pairing
    // Just show limited functionality
    fetchData();
    if (couple?.paired) {
      checkMilestones();
    }
    fetchInsight();
  }, [user, couple]);

  const fetchData = async () => {
    try {
      // Fetch current plan
      const planResponse = await api.get("/plans/current");
      if (planResponse.data.plan) {
        const todayWorkout = planResponse.data.plan.workouts?.find(w => w.day === dayName);
        const todayMeals = planResponse.data.plan.meals?.find(m => m.day === dayName);
        setTodayPlan({ workout: todayWorkout, meals: todayMeals, tip: planResponse.data.plan.weekly_tip });
      }

      // Fetch couple's logs for today
      const logsResponse = await api.get(`/logs/couple/${today}`);
      setCoupleLogs(logsResponse.data.logs || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkMilestones = async () => {
    try {
      const response = await api.get("/milestones");
      if (response.data.pending_celebration) {
        setPendingMilestone(response.data.pending_celebration);
      }
    } catch (error) {
      console.error("Error checking milestones:", error);
    }
  };

  const fetchInsight = async () => {
    try {
      const response = await api.get("/insights/weekly");
      setWeeklyInsight(response.data.insight);
    } catch (error) {
      console.error("Error fetching insight:", error);
    }
  };

  const celebrateMilestone = async () => {
    if (pendingMilestone) {
      try {
        await api.post(`/milestones/${pendingMilestone.days}/celebrate`);
      } catch (error) {
        console.error("Error marking milestone:", error);
      }
    }
    setPendingMilestone(null);
  };

  const getUserLog = (userId) => {
    return coupleLogs.find(log => log.user_id === userId) || {};
  };

  const myLog = getUserLog(user?.id);
  const partnerLog = getUserLog(couple?.partner?.id);

  const myProgress = calculateProgress(myLog);
  const partnerProgress = calculateProgress(partnerLog);

  function calculateProgress(log) {
    if (!log) return 0;
    let score = 0;
    if (log.workout_completed) score += 40;
    if (log.meals_logged?.length >= 2) score += 30;
    if (log.water_intake >= 4) score += 15;
    if (log.energy_level) score += 15;
    return Math.min(score, 100);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-primary text-xl font-heading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Milestone Celebration */}
      {pendingMilestone && (
        <MilestoneCelebration
          milestone={pendingMilestone}
          streakCount={couple?.streak_count}
          onClose={celebrateMilestone}
        />
      )}

      {/* Quick Workout Modal */}
      {showQuickWorkout && (
        <QuickWorkoutModal onClose={() => setShowQuickWorkout(false)} />
      )}

      <div className="container-app py-8">
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
            Good {getTimeOfDay()}, {user?.name}
          </h1>
        </motion.div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Streak Card - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bento-large bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 text-white relative overflow-hidden"
            data-testid="streak-card"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-400">
                  Shared Streak
                </span>
                {couple?.travel_mode && (
                  <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-medium">
                    Travel Mode
                  </span>
                )}
              </div>
              
              <div className="flex items-end gap-4 mb-8">
                <span className="font-heading text-7xl font-bold">{couple?.streak_count || 0}</span>
                <span className="text-2xl mb-2">🔥</span>
                <span className="text-stone-400 mb-3">days together</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-sm font-semibold">
                      {user?.name?.charAt(0)}
                    </div>
                    <span className="text-sm text-stone-300">You</span>
                    <span className="ml-auto text-sm">{myProgress}%</span>
                  </div>
                  <Progress value={myProgress} className="h-2 bg-stone-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-success/30 flex items-center justify-center text-sm font-semibold">
                      {couple?.partner?.name?.charAt(0)}
                    </div>
                    <span className="text-sm text-stone-300">{couple?.partner?.name}</span>
                    <span className="ml-auto text-sm">{partnerProgress}%</span>
                  </div>
                  <Progress value={partnerProgress} className="h-2 bg-stone-700" />
                </div>
              </div>

              {myProgress === 100 && partnerProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-success/20 rounded-2xl text-center"
                >
                  <span className="text-success font-semibold">Both complete! Streak extended! 🎉</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Today's Workout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] card-hover"
            data-testid="workout-card"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
                Today's Workout
              </span>
              {myLog.workout_completed && (
                <span className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
            
            {todayPlan?.workout ? (
              <>
                <h3 className="font-heading text-xl font-semibold text-stone-900 mb-2">
                  {todayPlan.workout.name}
                </h3>
                <p className="text-stone-500 text-sm mb-4">
                  {todayPlan.workout.duration_minutes} min • {todayPlan.workout.type}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowQuickWorkout(true)}
                    variant="outline"
                    data-testid="quick-workout-btn"
                    className="flex-1 rounded-full border-stone-200"
                  >
                    ⚡ 15 min
                  </Button>
                  <Button
                    onClick={() => navigate("/log")}
                    data-testid="log-workout-btn"
                    className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full"
                  >
                    {myLog.workout_completed ? "View" : "Log"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-stone-500 mb-4">No plan generated yet</p>
                <Button
                  onClick={() => navigate("/plan")}
                  data-testid="generate-plan-btn"
                  className="bg-primary text-white hover:bg-primary/90 rounded-full"
                >
                  Generate Plan
                </Button>
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            data-testid="water-card"
          >
            <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
              Water Today
            </span>
            <div className="flex items-end gap-2 mt-4">
              <span className="font-heading text-4xl font-bold text-stone-900">
                {myLog.water_intake || 0}
              </span>
              <span className="text-stone-500 mb-1">/ 8 glasses</span>
            </div>
            <div className="flex gap-1 mt-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-3 rounded-full transition-colors ${
                    i < (myLog.water_intake || 0) ? "bg-blue-400" : "bg-stone-200"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Meals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bento-wide bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            data-testid="meals-card"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
                Today's Meals
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/plan")}
                className="text-primary"
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {["breakfast", "lunch", "dinner"].map((meal) => {
                const mealData = todayPlan?.meals?.[meal];
                const isLogged = myLog.meals_logged?.includes(meal);
                
                return (
                  <div
                    key={meal}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      isLogged ? "border-success bg-success/5" : "border-stone-200"
                    }`}
                  >
                    <span className="text-xs font-medium text-stone-500 capitalize">{meal}</span>
                    <p className="font-medium text-stone-900 mt-1 text-sm">
                      {mealData?.name || "Not planned"}
                    </p>
                    {isLogged && (
                      <span className="text-xs text-success mt-2 block">✓ Logged</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Energy & Mood */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            data-testid="mood-card"
          >
            <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
              How You Feel
            </span>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-xs text-stone-500">Energy</span>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        level <= (myLog.energy_level || 0)
                          ? "bg-warning text-white"
                          : "bg-stone-200 text-stone-400"
                      }`}
                    >
                      ⚡
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-stone-500">Mood</span>
                <div className="text-2xl mt-1">
                  {myLog.mood || "😐"}
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/log")}
              variant="outline"
              data-testid="update-mood-btn"
              className="w-full mt-4 rounded-full border-stone-200"
            >
              {myLog.energy_level ? "Update" : "Log Now"}
            </Button>
          </motion.div>

          {/* Weekly Tip */}
          {(weeklyInsight || todayPlan?.tip) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bento-wide bg-accent/30 rounded-3xl p-6"
              data-testid="tip-card"
            >
              <span className="uppercase tracking-[0.2em] text-xs font-semibold text-accent-foreground">
                💡 Weekly Insight
              </span>
              <p className="text-stone-900 mt-2 leading-relaxed">
                {weeklyInsight || todayPlan.tip}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default Dashboard;
