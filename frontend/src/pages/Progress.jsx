import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const Progress = () => {
  const { api, user, couple } = useAuth();
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const [statsResponse, weeklyResponse] = await Promise.all([
        api.get("/progress/stats"),
        api.get("/progress/weekly-summary"),
      ]);
      setStats(statsResponse.data);
      setWeeklyData(weeklyResponse.data);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-primary text-xl font-heading">Loading...</div>
      </div>
    );
  }

  const weightData = stats?.weight_trend?.map(w => ({
    date: new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    weight: w.weight,
  })) || [];

  const recentLogsData = stats?.recent_logs?.map(log => ({
    date: new Date(log.date).toLocaleDateString("en-US", { weekday: "short" }),
    energy: log.energy_level || 0,
    sleep: log.sleep_hours || 0,
    water: log.water_intake || 0,
  })).reverse() || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-app py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
            Your Journey
          </span>
          <h1 className="font-heading text-3xl font-bold text-stone-900 tracking-tight mt-1">
            Progress
          </h1>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <span className="text-3xl mb-2 block">🏋️</span>
            <span className="font-heading text-3xl font-bold text-stone-900">{stats?.total_workouts || 0}</span>
            <span className="text-stone-500 text-sm block">Workouts</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <span className="text-3xl mb-2 block">🍽️</span>
            <span className="font-heading text-3xl font-bold text-stone-900">{stats?.total_meals_logged || 0}</span>
            <span className="text-stone-500 text-sm block">Meals Logged</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <span className="text-3xl mb-2 block">💧</span>
            <span className="font-heading text-3xl font-bold text-stone-900">{Math.round(stats?.avg_water || 0)}</span>
            <span className="text-stone-500 text-sm block">Avg. Water/Day</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <span className="text-3xl mb-2 block">😴</span>
            <span className="font-heading text-3xl font-bold text-stone-900">{(stats?.avg_sleep || 0).toFixed(1)}</span>
            <span className="text-stone-500 text-sm block">Avg. Sleep Hours</span>
          </motion.div>
        </div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading text-xl font-semibold text-stone-900">This Week</h3>
              <p className="text-stone-500 text-sm">
                Week of {weeklyData?.week_start ? new Date(weeklyData.week_start).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "..."}
              </p>
            </div>
            <div className="text-right">
              <span className="font-heading text-3xl font-bold text-primary">
                {weeklyData?.completion_percentage || 0}%
              </span>
              <span className="text-stone-500 text-sm block">Complete</span>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="progress-ring w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E7E5E4"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#D96C5B"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(weeklyData?.completion_percentage || 0) * 2.83} 283`}
                  className="progress-ring__circle"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-2xl font-bold text-stone-900">
                  {weeklyData?.days_completed || 0}/7
                </span>
                <span className="text-stone-500 text-sm">days</span>
              </div>
            </div>
          </div>

          {/* Day indicators */}
          <div className="flex justify-center gap-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
              const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
              const isCompleted = weeklyData?.logs?.[Object.keys(weeklyData.logs || {})[i]]?.workout_completed;
              return (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted
                      ? "bg-success text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Weight Trend */}
          {weightData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <h3 className="font-heading text-lg font-semibold text-stone-900 mb-4">Weight Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weightData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D96C5B" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#D96C5B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#78716C" />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12 }} stroke="#78716C" />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E7E5E4",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#D96C5B"
                      strokeWidth={2}
                      fill="url(#weightGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Energy & Sleep */}
          {recentLogsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <h3 className="font-heading text-lg font-semibold text-stone-900 mb-4">Energy & Sleep</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={recentLogsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#78716C" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#78716C" />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #E7E5E4",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#E9C46A"
                      strokeWidth={2}
                      dot={{ fill: "#E9C46A" }}
                      name="Energy"
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      stroke="#84A98C"
                      strokeWidth={2}
                      dot={{ fill: "#84A98C" }}
                      name="Sleep (hrs)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm text-stone-600">Energy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm text-stone-600">Sleep</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Milestones */}
        {couple?.milestones?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-gradient-to-br from-accent/50 to-accent/20 rounded-3xl p-6"
          >
            <h3 className="font-heading text-lg font-semibold text-stone-900 mb-4">🏆 Milestones</h3>
            <div className="flex flex-wrap gap-3">
              {couple.milestones.map((milestone, i) => (
                <div
                  key={i}
                  className="bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm"
                >
                  <span className="text-lg">🎉</span>
                  <span className="font-medium text-stone-900">{milestone.days}-day streak!</span>
                  <span className="text-xs text-stone-500">
                    {new Date(milestone.achieved_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Progress;
