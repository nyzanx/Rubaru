import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import QuickWorkoutModal from "../components/QuickWorkoutModal";
import MealSwapModal from "../components/MealSwapModal";
import IngredientScanner from "../components/IngredientScanner";

const SortableDay = ({ day, isSelected, isToday, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: day.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      data-testid={`day-${day.id}`}
      className={`flex-shrink-0 w-14 py-3 rounded-2xl transition-all cursor-grab active:cursor-grabbing ${
        isSelected
          ? "bg-primary text-white"
          : isToday
          ? "bg-primary/10 text-primary border border-primary"
          : "bg-white border border-stone-200 text-stone-700 hover:border-stone-300"
      }`}
    >
      <div className="text-xs font-medium">{day.label}</div>
      <div className="text-lg font-bold">{day.date}</div>
    </button>
  );
};

const WeeklyPlan = () => {
  const { api, couple } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [groceryList, setGroceryList] = useState(null);
  const [showQuickWorkout, setShowQuickWorkout] = useState(false);
  const [showMealSwap, setShowMealSwap] = useState(null);
  const [showIngredientScanner, setShowIngredientScanner] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const weekStart = monday.toISOString().split("T")[0];

  const weekdays = [
    { id: "monday", label: "Mon", date: formatDate(monday, 0) },
    { id: "tuesday", label: "Tue", date: formatDate(monday, 1) },
    { id: "wednesday", label: "Wed", date: formatDate(monday, 2) },
    { id: "thursday", label: "Thu", date: formatDate(monday, 3) },
    { id: "friday", label: "Fri", date: formatDate(monday, 4) },
    { id: "saturday", label: "Sat", date: formatDate(monday, 5) },
    { id: "sunday", label: "Sun", date: formatDate(monday, 6) },
  ];

  function formatDate(baseDate, offset) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + offset);
    return date.getDate();
  }

  function getCurrentDay() {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  }

  useEffect(() => {
    fetchPlan();
    fetchGroceryList();
  }, []);

  const fetchPlan = async () => {
    try {
      const response = await api.get("/plans/current");
      if (response.data.plan) {
        setPlan(response.data);
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroceryList = async () => {
    try {
      const response = await api.get("/grocery-list");
      setGroceryList(response.data.categories);
    } catch (error) {
      console.error("Error fetching grocery list:", error);
    }
  };

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const response = await api.post("/plans/generate", {
        week_start: weekStart,
        travel_mode: couple?.travel_mode || false,
        available_ingredients: availableIngredients.length > 0 ? availableIngredients : undefined,
      });
      setPlan(response.data);
      toast.success("Weekly plan generated!");
      fetchGroceryList();
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate plan");
    } finally {
      setGenerating(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    try {
      await api.post("/plans/reschedule", {
        week_start: weekStart,
        from_day: active.id,
        to_day: over.id,
      });
      
      toast.success("Workout rescheduled!");
      fetchPlan();
    } catch (error) {
      toast.error("Failed to reschedule");
    }
  };

  const getDayPlan = (dayId) => {
    if (!plan?.plan) return { workout: null, meals: null };
    return {
      workout: plan.plan.workouts?.find(w => w.day === dayId),
      meals: plan.plan.meals?.find(m => m.day === dayId),
    };
  };

  const isToday = (dayId) => dayId === getCurrentDay();

  const handleIngredientsFound = (ingredients) => {
    setAvailableIngredients(ingredients);
    toast.success(`Added ${ingredients.length} ingredients!`);
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
      <div className="container-app py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
              Week of {new Date(weekStart).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
            </span>
            <h1 className="font-heading text-3xl font-bold text-stone-900 tracking-tight mt-1">
              Weekly Plan
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowIngredientScanner(true)}
              variant="outline"
              data-testid="scan-ingredients-btn"
              className="rounded-full border-stone-200"
            >
              📷 Scan Ingredients
            </Button>
            <Button
              onClick={generatePlan}
              disabled={generating}
              data-testid="generate-plan-btn"
              className="bg-primary text-white hover:bg-primary/90 rounded-full"
            >
              {generating ? "Generating..." : plan ? "Regenerate" : "Generate Plan"}
            </Button>
          </div>
        </motion.div>

        {/* Available Ingredients Badge */}
        {availableIngredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-success/10 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-success">Using scanned ingredients</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableIngredients.slice(0, 5).map((ing, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white rounded-full text-xs text-stone-600">
                      {ing}
                    </span>
                  ))}
                  {availableIngredients.length > 5 && (
                    <span className="px-2 py-0.5 bg-white rounded-full text-xs text-stone-500">
                      +{availableIngredients.length - 5} more
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setAvailableIngredients([])}
                variant="ghost"
                size="sm"
                className="text-stone-500"
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}

        {!plan ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-bold text-stone-900 mb-2">
              No plan yet
            </h2>
            <p className="text-stone-600 mb-6 max-w-md mx-auto">
              Generate your first weekly plan to get personalized workouts and meals for both of you.
            </p>
            <Button
              onClick={generatePlan}
              disabled={generating}
              data-testid="generate-first-plan-btn"
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg"
            >
              {generating ? "Creating your plan..." : "Generate Your Plan"}
            </Button>
          </motion.div>
        ) : (
          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="bg-stone-100 rounded-full p-1">
              <TabsTrigger value="schedule" data-testid="tab-schedule" className="rounded-full">Schedule</TabsTrigger>
              <TabsTrigger value="grocery" data-testid="tab-grocery" className="rounded-full">Grocery List</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              {/* Day Selector with Drag & Drop */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={weekdays.map(d => d.id)} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {weekdays.map((day) => (
                      <SortableDay
                        key={day.id}
                        day={day}
                        isSelected={selectedDay === day.id}
                        isToday={isToday(day.id)}
                        onClick={() => setSelectedDay(day.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              
              <p className="text-xs text-stone-400 mb-4">
                💡 Drag days to reschedule workouts
              </p>

              {/* Day Content */}
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Workout Card */}
                <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500">
                      Workout
                    </span>
                    <div className="flex gap-2">
                      {getDayPlan(selectedDay).workout?.type !== "rest" && (
                        <Button
                          onClick={() => setShowQuickWorkout(true)}
                          variant="outline"
                          size="sm"
                          data-testid="quick-workout-btn"
                          className="rounded-full text-xs"
                        >
                          ⚡ Quick Version
                        </Button>
                      )}
                      {getDayPlan(selectedDay).workout?.type === "rest" ? (
                        <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                          Rest Day
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                          {getDayPlan(selectedDay).workout?.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {getDayPlan(selectedDay).workout && getDayPlan(selectedDay).workout.type !== "rest" ? (
                    <>
                      <h3 className="font-heading text-xl font-semibold text-stone-900 mb-2">
                        {getDayPlan(selectedDay).workout.name}
                      </h3>
                      <p className="text-stone-500 mb-4">
                        {getDayPlan(selectedDay).workout.duration_minutes} minutes • {getDayPlan(selectedDay).workout.description}
                      </p>
                      
                      {getDayPlan(selectedDay).workout.exercises?.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {getDayPlan(selectedDay).workout.exercises.map((exercise, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-stone-50 rounded-xl"
                            >
                              <span className="font-medium text-stone-900">{exercise.name}</span>
                              <span className="text-stone-500 text-sm">
                                {exercise.sets && `${exercise.sets} sets`}
                                {exercise.reps && ` × ${exercise.reps}`}
                                {exercise.duration && exercise.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-4 block">🧘</span>
                      <h3 className="font-heading text-xl font-semibold text-stone-900 mb-2">
                        Rest & Recover
                      </h3>
                      <p className="text-stone-500">
                        Take it easy today. Light stretching or a gentle walk is perfect.
                      </p>
                    </div>
                  )}
                </div>

                {/* Meals Card */}
                <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500 mb-4 block">
                    Meals
                  </span>
                  
                  <div className="space-y-4">
                    {["breakfast", "lunch", "dinner"].map((mealType) => {
                      const meal = getDayPlan(selectedDay).meals?.[mealType];
                      return (
                        <div
                          key={mealType}
                          className="p-4 bg-stone-50 rounded-2xl group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-stone-500 capitalize">{mealType}</span>
                            <div className="flex items-center gap-2">
                              {meal?.prep_time && (
                                <span className="text-xs text-stone-400">{meal.prep_time} min prep</span>
                              )}
                              <Button
                                onClick={() => setShowMealSwap({ meal, mealType, date: selectedDay })}
                                variant="ghost"
                                size="sm"
                                data-testid={`swap-${mealType}-btn`}
                                className="opacity-0 group-hover:opacity-100 text-xs rounded-full"
                              >
                                🔄 Swap
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-medium text-stone-900">
                            {meal?.name || "Not planned"}
                          </h4>
                          {meal?.ingredients && (
                            <p className="text-sm text-stone-500 mt-1">
                              {meal.ingredients.slice(0, 4).join(", ")}
                              {meal.ingredients.length > 4 && "..."}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {getDayPlan(selectedDay).meals?.snacks?.length > 0 && (
                      <div className="p-4 bg-accent/30 rounded-2xl">
                        <span className="text-xs font-medium text-stone-500">Snacks</span>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {getDayPlan(selectedDay).meals.snacks.map((snack, i) => (
                            <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-stone-700">
                              {snack.name || snack}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="grocery">
              <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="font-heading text-xl font-semibold text-stone-900 mb-6">
                  Shopping List
                </h3>
                
                {groceryList ? (
                  <div className="space-y-6">
                    {Object.entries(groceryList).map(([category, items]) => (
                      items.length > 0 && (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3 capitalize">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {items.map((item, index) => (
                              <label
                                key={index}
                                className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors"
                              >
                                <input type="checkbox" className="checkbox-custom" />
                                <span className="text-stone-900">{item.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 text-center py-8">
                    Generate a meal plan to see your grocery list.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Modals */}
      {showQuickWorkout && (
        <QuickWorkoutModal onClose={() => setShowQuickWorkout(false)} />
      )}

      {showMealSwap && (
        <MealSwapModal
          meal={showMealSwap.meal}
          mealType={showMealSwap.mealType}
          date={showMealSwap.date}
          onClose={() => setShowMealSwap(null)}
          onSwapped={(newMeal) => {
            toast.success("Meal swapped!");
            fetchPlan();
          }}
        />
      )}

      {showIngredientScanner && (
        <IngredientScanner
          onIngredientsFound={handleIngredientsFound}
          onClose={() => setShowIngredientScanner(false)}
        />
      )}
    </div>
  );
};

export default WeeklyPlan;
