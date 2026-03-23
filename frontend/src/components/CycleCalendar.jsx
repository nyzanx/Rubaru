import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const phaseColors = {
  menstrual: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" },
  follicular: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  ovulatory: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  luteal: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200" },
};

const phaseInfo = {
  menstrual: { name: "Menstrual", emoji: "🌙", desc: "Rest & recover" },
  follicular: { name: "Follicular", emoji: "🌱", desc: "Energy rising" },
  ovulatory: { name: "Ovulatory", emoji: "☀️", desc: "Peak energy" },
  luteal: { name: "Luteal", emoji: "🍂", desc: "Wind down" },
};

const CycleCalendar = () => {
  const { api } = useAuth();
  const [cycleData, setCycleData] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCycleData();
  }, []);

  const fetchCycleData = async () => {
    try {
      const [currentRes, calendarRes] = await Promise.all([
        api.get("/cycle/current"),
        api.get("/cycle/calendar"),
      ]);
      setCycleData(currentRes.data);
      setCalendarData(calendarRes.data.days || []);
    } catch (error) {
      console.error("Error fetching cycle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const logPeriod = async () => {
    try {
      await api.post("/cycle/log-period");
      toast.success("Period logged! Calendar updated.");
      fetchCycleData();
    } catch (error) {
      toast.error("Failed to log period");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-stone-200 rounded w-1/3" />
          <div className="h-32 bg-stone-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cycleData?.tracking) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="font-heading text-lg font-semibold text-stone-900 mb-2">
          Cycle Tracking
        </h3>
        <p className="text-stone-500 text-sm">
          Enable cycle tracking in your profile settings to see personalized insights.
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const currentPhase = cycleData.phase;
  const colors = phaseColors[currentPhase];
  const info = phaseInfo[currentPhase];

  // Group calendar by weeks
  const weeks = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Current Phase */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
            Current Phase
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl">{info.emoji}</span>
            <h3 className="font-heading text-xl font-semibold text-stone-900">
              {info.name}
            </h3>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}>
          Day {cycleData.days_since_period + 1} of {cycleData.cycle_length}
        </div>
      </div>

      {/* Recommendations */}
      {cycleData.recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl ${colors.bg} mb-6`}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-medium text-stone-500">Workout</span>
              <p className={`text-sm ${colors.text} mt-1`}>
                {cycleData.recommendations.workout}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-stone-500">Nutrition</span>
              <p className={`text-sm ${colors.text} mt-1`}>
                {cycleData.recommendations.nutrition}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Period */}
      <div className="flex items-center justify-between mb-6 p-4 bg-stone-50 rounded-2xl">
        <div>
          <span className="text-sm text-stone-500">Next period in</span>
          <p className="font-heading text-2xl font-bold text-stone-900">
            {cycleData.days_until_next_period} days
          </p>
        </div>
        <Button
          onClick={logPeriod}
          variant="outline"
          data-testid="log-period-btn"
          className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          Period Started
        </Button>
      </div>

      {/* Calendar */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        {weeks.slice(0, 4).map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIdx) => {
              const isToday = day.date === today;
              const dayColors = phaseColors[day.phase];
              return (
                <div
                  key={dayIdx}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                    isToday
                      ? `ring-2 ring-primary ${dayColors.bg} ${dayColors.text}`
                      : `${dayColors.bg} ${dayColors.text} opacity-70`
                  }`}
                  title={`${day.date} - ${phaseInfo[day.phase].name}`}
                >
                  {new Date(day.date).getDate()}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Phase Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-stone-100">
        {Object.entries(phaseInfo).map(([phase, info]) => (
          <div key={phase} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${phaseColors[phase].bg}`} />
            <span className="text-xs text-stone-500">{info.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CycleCalendar;
