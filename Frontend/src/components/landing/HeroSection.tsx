import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-white">
      <div className="container-width section-padding relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Skill-based Learning Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero text-6xl sm:text-7xl lg:text-8xl leading-[1.05] tracking-wide mb-6 text-center text-slate-900"
          >
            SMART LEARNING MANAGEMENT SYSTEM
            <br className="hidden md:block" />
            FOR REAL-WORLD CAREERS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto mb-10"
          >
            AOTMS is Vijayawada's premier learning management system offering
            online courses, live classes, secure exams, mock tests, and
            ATS-based skill evaluation. Join thousands of students building
            real-world careers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              variant="hero"
              size="xl"
              className="gap-2 group transition-all"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="accent"
              size="xl"
              className="gap-2 transition-all"
              onClick={() => navigate("/student-dashboard")}
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-slate-100"
          >
            {[
              {
                value: "10K+",
                label: "Active Students",
              },
              {
                value: "50+",
                label: "Expert Instructors",
              },
              {
                value: "100+",
                label: "Courses",
              },
              {
                value: "95%",
                label: "Success Rate",
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-heading text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
