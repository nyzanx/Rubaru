import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../App";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Together, Always",
      description: "One shared plan for both partners. When you both show up, the streak counts.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "AI-Powered Plans",
      description: "Personalized workouts and meals adjusted for each person's goals and needs.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "60-Second Logging",
      description: "Log your workout, meals, and mood in under a minute. No friction, just habits.",
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Celebrate Together",
      description: "Milestones feel better when you hit them as a team. We make sure you notice.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-orange-100/20 to-transparent" />
        
        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-24 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-heading text-2xl font-bold text-stone-900"
          >
            Rubaru
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              data-testid="login-btn"
              className="text-stone-700 hover:text-stone-900"
            >
              Log in
            </Button>
            <Button
              onClick={() => navigate("/register")}
              data-testid="get-started-btn"
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-6"
            >
              Get Started
            </Button>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 md:px-12 lg:px-24 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500 mb-4 block">
                For couples who show up together
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-none mb-6">
                Your health journey,{" "}
                <span className="text-primary">together</span>
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-lg">
                People stay consistent when they have a partner doing it with them. 
                Rubaru creates shared plans, tracks your shared streak, and celebrates 
                your wins as a couple.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate("/register")}
                  data-testid="hero-cta-btn"
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
                  data-testid="learn-more-btn"
                  className="rounded-full px-6 py-6 border-stone-200 text-stone-700 hover:bg-stone-50"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1720804274286-eb479df0388a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHw0fHxjb3VwbGUlMjB3b3Jrb3V0JTIwdG9nZXRoZXJ8ZW58MHx8fHwxNzc0Mjk1MTc1fDA&ixlib=rb-4.1.0&q=85"
                  alt="Couple running together"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                {/* Overlay card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">A</div>
                      <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-semibold">J</div>
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-stone-900">14-day streak!</p>
                      <p className="text-sm text-stone-500">Alex & Jordan are crushing it</p>
                    </div>
                    <div className="ml-auto text-3xl">🔥</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="px-6 md:px-12 lg:px-24 py-20 bg-stone-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="uppercase tracking-[0.2em] text-xs font-semibold text-stone-500 mb-4 block">
            How it works
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            Built for busy couples
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl p-8 border border-stone-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                {feature.icon}
              </div>
              <h3 className="font-heading text-xl font-semibold text-stone-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 md:px-12 lg:px-24 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-stone-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-orange-500/10" />
          <div className="relative z-10">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to start together?
            </h2>
            <p className="text-stone-300 text-lg mb-8 max-w-lg mx-auto">
              Join couples who are building healthy habits as a team. Your partner is waiting.
            </p>
            <Button
              onClick={() => navigate("/register")}
              data-testid="final-cta-btn"
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
            >
              Create Your Account
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 lg:px-24 py-8 border-t border-stone-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-heading text-xl font-bold text-stone-900">Rubaru</div>
          <p className="text-stone-500 text-sm">© 2024 Rubaru. Built with love for couples.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
