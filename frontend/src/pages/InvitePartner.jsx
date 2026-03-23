import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../App";
import { toast } from "sonner";

const InvitePartner = () => {
  const navigate = useNavigate();
  const { api, user, couple, refreshCouple } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const [myCode, setMyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");

  useEffect(() => {
    fetchInviteCode();
  }, []);

  useEffect(() => {
    if (couple?.paired) {
      if (!user?.onboarding_complete) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [couple, user, navigate]);

  const fetchInviteCode = async () => {
    try {
      const response = await api.get("/auth/invite-code");
      setMyCode(response.data.invite_code);
    } catch (error) {
      console.error("Error fetching invite code:", error);
    }
  };

  const handleJoinPartner = async () => {
    if (!partnerCode.trim()) {
      toast.error("Please enter your partner's invite code");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/join-partner", { invite_code: partnerCode.trim() });
      toast.success(`Paired with ${response.data.partner_name}! 🎉`);
      await refreshCouple();
      navigate("/onboarding");
    } catch (error) {
      console.error("Join error:", error);
      toast.error(error.response?.data?.detail || "Invalid invite code");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myCode);
    toast.success("Invite code copied!");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl font-bold text-stone-900 tracking-tight mb-2">
              Pair with Your Partner
            </h1>
            <p className="text-stone-600">
              DuoHealth works best when you do it together. Share your code or enter theirs.
            </p>
          </div>

          {/* Your Invite Code */}
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6">
            <h2 className="font-heading text-lg font-semibold text-stone-900 mb-4">
              Your Invite Code
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-stone-50 rounded-xl px-6 py-4 font-mono text-2xl font-bold text-stone-900 text-center tracking-widest">
                {myCode || "Loading..."}
              </div>
              <Button
                onClick={copyToClipboard}
                data-testid="copy-code-btn"
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-6"
              >
                Copy
              </Button>
            </div>
            <p className="text-sm text-stone-500 mt-4 text-center">
              Share this code with your partner so they can join you.
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-stone-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Join Partner */}
          <div className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="font-heading text-lg font-semibold text-stone-900 mb-4">
              Enter Partner's Code
            </h2>
            <div className="space-y-4">
              <Input
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                data-testid="partner-code-input"
                className="h-14 rounded-xl text-center font-mono text-xl tracking-widest uppercase"
                maxLength={8}
              />
              <Button
                onClick={handleJoinPartner}
                disabled={loading || !partnerCode}
                data-testid="join-partner-btn"
                className="w-full bg-stone-900 text-white hover:bg-stone-800 rounded-full h-12 text-lg font-semibold"
              >
                {loading ? "Joining..." : "Join Partner"}
              </Button>
            </div>
          </div>

          {/* Skip for now */}
          <p className="text-center text-stone-500 mt-8">
            <button
              onClick={() => navigate("/onboarding")}
              data-testid="skip-pairing-btn"
              className="hover:text-primary transition-colors"
            >
              Continue without pairing (you can pair later)
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitePartner;
