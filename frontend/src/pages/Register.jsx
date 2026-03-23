import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../App";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      toast.success("Account created! Let's pair you with your partner.");
      navigate("/invite");
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Image (hidden on mobile) */}
      <div className="hidden lg:block flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-100/30" />
        <img
          src="https://images.unsplash.com/photo-1738523686534-7055df5858d6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxjb3VwbGUlMjB3b3Jrb3V0JTIwdG9nZXRoZXJ8ZW58MHx8fHwxNzc0Mjk1MTc1fDA&ixlib=rb-4.1.0&q=85"
          alt="Couple at gym"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="font-heading text-2xl font-bold text-stone-900 mb-8 block">
            Rubaru
          </Link>
          
          <h1 className="font-heading text-3xl font-bold text-stone-900 tracking-tight mb-2">
            Start your journey
          </h1>
          <p className="text-stone-600 mb-8">
            Create your account to begin building healthy habits together.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex"
                data-testid="register-name-input"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                data-testid="register-email-input"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                data-testid="register-password-input"
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="register-submit-btn"
              className="w-full bg-primary text-white hover:bg-primary/90 rounded-full h-12 text-lg font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-stone-600 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              data-testid="login-link"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
