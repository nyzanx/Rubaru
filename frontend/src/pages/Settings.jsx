import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { api, user, couple, logout, refreshCouple } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [onboardingData, setOnboardingData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [codeResponse, onboardingResponse] = await Promise.all([
        api.get("/auth/invite-code"),
        api.get("/onboarding"),
      ]);
      setInviteCode(codeResponse.data.invite_code);
      setOnboardingData(onboardingResponse.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const toggleTravelMode = async () => {
    try {
      const response = await api.post("/couple/travel-mode");
      await refreshCouple();
      toast.success(response.data.travel_mode ? "Travel mode enabled" : "Travel mode disabled");
    } catch (error) {
      console.error("Error toggling travel mode:", error);
      toast.error("Failed to toggle travel mode");
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast.success("Invite code copied!");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-app py-8 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold text-stone-900 tracking-tight">
            Settings
          </h1>
        </motion.div>

        <div className="space-y-6">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h2 className="font-heading text-lg font-semibold text-stone-900 mb-4">Profile</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-stone-900">{user?.name}</h3>
                <p className="text-stone-500">{user?.email}</p>
              </div>
            </div>

            {onboardingData && (
              <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-2xl font-bold text-stone-900">{onboardingData.age || "--"}</span>
                  <span className="text-stone-500 text-sm block">Age</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-stone-900">{onboardingData.weight || "--"}</span>
                  <span className="text-stone-500 text-sm block">Weight (kg)</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-stone-900">{onboardingData.height || "--"}</span>
                  <span className="text-stone-500 text-sm block">Height (cm)</span>
                </div>
              </div>
            )}

            <Button
              onClick={() => navigate("/onboarding")}
              variant="outline"
              data-testid="edit-profile-btn"
              className="w-full mt-6 rounded-full border-stone-200"
            >
              Edit Profile
            </Button>
          </motion.div>

          {/* Partner & Couple */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h2 className="font-heading text-lg font-semibold text-stone-900 mb-4">Partner</h2>
            
            {couple?.paired ? (
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-xl font-bold text-success">
                  {couple.partner?.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-stone-900">{couple.partner?.name}</h3>
                  <p className="text-stone-500 text-sm">Paired</p>
                </div>
                <div className="text-right">
                  <span className="font-heading text-2xl font-bold text-primary">{couple.streak_count}</span>
                  <span className="text-stone-500 text-sm block">🔥 streak</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-stone-500 mb-4">Not paired yet</p>
                <Button
                  onClick={() => navigate("/invite")}
                  data-testid="pair-partner-btn"
                  className="bg-primary text-white hover:bg-primary/90 rounded-full"
                >
                  Pair with Partner
                </Button>
              </div>
            )}

            {/* Invite Code */}
            <div className="pt-4 border-t border-stone-100">
              <Label className="text-sm text-stone-500 mb-2 block">Your Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteCode}
                  readOnly
                  className="font-mono text-center tracking-widest"
                />
                <Button
                  onClick={copyInviteCode}
                  variant="outline"
                  data-testid="copy-invite-btn"
                  className="rounded-full px-6"
                >
                  Copy
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Travel Mode */}
          {couple?.paired && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-stone-900">Travel Mode</h2>
                  <p className="text-stone-500 text-sm mt-1">
                    Pauses streak without breaking it. Adjusts workouts for travel.
                  </p>
                </div>
                <Switch
                  checked={couple.travel_mode}
                  onCheckedChange={toggleTravelMode}
                  data-testid="travel-mode-toggle"
                />
              </div>
              
              {couple.travel_mode && (
                <div className="mt-4 p-4 bg-warning/10 rounded-2xl">
                  <p className="text-warning text-sm font-medium">
                    ✈️ Travel mode is active. Your streak is paused.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Goals */}
          {onboardingData?.health_goals?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <h2 className="font-heading text-lg font-semibold text-stone-900 mb-4">Your Goals</h2>
              <div className="flex flex-wrap gap-2">
                {onboardingData.health_goals.map((goal) => (
                  <span
                    key={goal}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize"
                  >
                    {goal.replace("_", " ")}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <h2 className="font-heading text-lg font-semibold text-stone-900 mb-4">Help</h2>
            <Button
              onClick={() => {
                localStorage.removeItem(`tutorial_seen_${user?.id}`);
                navigate("/dashboard");
                toast.success("Tutorial will replay on dashboard!");
              }}
              variant="outline"
              data-testid="replay-tutorial-btn"
              className="w-full rounded-full border-stone-200 mb-3"
            >
              📖 Replay Tutorial
            </Button>
            <p className="text-xs text-stone-500 text-center">
              Take the guided tour again to learn about all features.
            </p>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-stone-50 rounded-3xl p-6"
          >
            <h2 className="font-heading text-lg font-semibold text-stone-900 mb-4">Account</h2>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  data-testid="logout-btn"
                  className="w-full rounded-full border-stone-300 text-stone-700"
                >
                  Log Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading">Log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    data-testid="confirm-logout-btn"
                    className="bg-primary text-white rounded-full"
                  >
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
