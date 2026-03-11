import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BookOpen, Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Low-poly triangle mosaic background pattern (matching the blue-to-orange screenshot)
const LowPolyBackground = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 700"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a4f7a" />
        <stop offset="35%" stopColor="#4a7fa5" />
        <stop offset="55%" stopColor="#f5e6c0" />
        <stop offset="75%" stopColor="#e8a04a" />
        <stop offset="100%" stopColor="#b85c1a" />
      </linearGradient>
      <filter id="noise" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="multiply" result="blend" />
        <feComposite in="blend" in2="SourceGraphic" operator="in" />
      </filter>
    </defs>
    {/* Base gradient fill */}
    <rect width="1200" height="700" fill="url(#bg-grad)" />
    {/* Top row – blue tones */}
    <polygon points="0,0 120,80 0,160" fill="#1b507e" opacity="0.85" />
    <polygon points="0,0 200,0 120,80" fill="#2562a0" opacity="0.9" />
    <polygon points="200,0 320,90 120,80" fill="#1d5b8e" opacity="0.8" />
    <polygon points="200,0 400,0 320,90" fill="#2e6fa3" opacity="0.85" />
    <polygon points="400,0 480,75 320,90" fill="#3578ae" opacity="0.9" />
    <polygon points="400,0 600,0 480,75" fill="#205f95" opacity="0.8" />
    <polygon points="600,0 640,80 480,75" fill="#3070a8" opacity="0.75" />
    <polygon points="600,0 800,0 640,80" fill="#1e5a8a" opacity="0.85" />
    <polygon points="800,0 860,70 640,80" fill="#2d6aa0" opacity="0.8" />
    <polygon points="800,0 1000,0 860,70" fill="#235d94" opacity="0.9" />
    <polygon points="1000,0 1080,85 860,70" fill="#1a548c" opacity="0.85" />
    <polygon points="1000,0 1200,0 1080,85" fill="#2768a2" opacity="0.8" />
    <polygon points="1200,0 1200,150 1080,85" fill="#1c5286" opacity="0.9" />
    {/* Second row – transitioning to lighter blue/grey */}
    <polygon points="0,160 120,80 200,170" fill="#4a80a8" opacity="0.8" />
    <polygon points="0,160 200,170 0,280" fill="#5890b4" opacity="0.75" />
    <polygon points="120,80 320,90 200,170" fill="#3e789f" opacity="0.85" />
    <polygon points="200,170 320,90 440,180" fill="#6a9bbf" opacity="0.8" />
    <polygon points="320,90 480,75 440,180" fill="#578daa" opacity="0.75" />
    <polygon points="440,180 480,75 620,170" fill="#78a8c0" opacity="0.8" />
    <polygon points="480,75 640,80 620,170" fill="#6aa0ba" opacity="0.85" />
    <polygon points="620,170 640,80 800,160" fill="#80afc4" opacity="0.8" />
    <polygon points="640,80 860,70 800,160" fill="#72a5be" opacity="0.75" />
    <polygon points="800,160 860,70 1000,175" fill="#8ab3c8" opacity="0.8" />
    <polygon points="860,70 1080,85 1000,175" fill="#78aac2" opacity="0.85" />
    <polygon points="1000,175 1080,85 1200,150" fill="#6fa2bc" opacity="0.8" />
    <polygon points="1000,175 1200,150 1200,280" fill="#82afc6" opacity="0.75" />
    {/* Middle row – warm cream/light transition */}
    <polygon points="0,280 200,170 240,300" fill="#c8b48a" opacity="0.7" />
    <polygon points="0,280 240,300 0,420" fill="#d4c09a" opacity="0.75" />
    <polygon points="200,170 440,180 350,310" fill="#d0b88a" opacity="0.7" />
    <polygon points="200,170 350,310 240,300" fill="#eacf9a" opacity="0.75" />
    <polygon points="440,180 620,170 540,305" fill="#e8d0a0" opacity="0.8" />
    <polygon points="350,310 440,180 540,305" fill="#f0da9a" opacity="0.75" />
    <polygon points="540,305 620,170 760,300" fill="#f5e2a8" opacity="0.8" />
    <polygon points="620,170 800,160 760,300" fill="#e8d490" opacity="0.75" />
    <polygon points="760,300 800,160 980,295" fill="#f0da9a" opacity="0.8" />
    <polygon points="800,160 1000,175 980,295" fill="#e8d088" opacity="0.75" />
    <polygon points="980,295 1000,175 1200,280" fill="#f5e0a0" opacity="0.8" />
    <polygon points="980,295 1200,280 1200,400" fill="#e8d490" opacity="0.7" />
    {/* Lower middle – warm amber transition */}
    <polygon points="0,420 240,300 280,440" fill="#d4943a" opacity="0.8" />
    <polygon points="0,420 280,440 0,540" fill="#c88430" opacity="0.85" />
    <polygon points="240,300 540,305 420,435" fill="#e09a3a" opacity="0.8" />
    <polygon points="240,300 420,435 280,440" fill="#d09032" opacity="0.75" />
    <polygon points="420,435 540,305 680,430" fill="#e8a040" opacity="0.8" />
    <polygon points="540,305 760,300 680,430" fill="#d89838" opacity="0.75" />
    <polygon points="680,430 760,300 900,425" fill="#e0a035" opacity="0.8" />
    <polygon points="760,300 980,295 900,425" fill="#d89038" opacity="0.75" />
    <polygon points="900,425 980,295 1200,400" fill="#e89a38" opacity="0.8" />
    <polygon points="900,425 1200,400 1200,530" fill="#d08830" opacity="0.75" />
    {/* Bottom – deep orange/brown */}
    <polygon points="0,540 280,440 320,560" fill="#b06820" opacity="0.9" />
    <polygon points="0,540 320,560 0,700" fill="#a05c18" opacity="0.85" />
    <polygon points="280,440 420,435 400,570" fill="#c07028" opacity="0.85" />
    <polygon points="280,440 400,570 320,560" fill="#b06220" opacity="0.9" />
    <polygon points="400,570 420,435 600,555" fill="#c87028" opacity="0.85" />
    <polygon points="420,435 680,430 600,555" fill="#b86820" opacity="0.9" />
    <polygon points="600,555 680,430 840,550" fill="#c06820" opacity="0.85" />
    <polygon points="680,430 900,425 840,550" fill="#b86020" opacity="0.9" />
    <polygon points="840,550 900,425 1100,545" fill="#c07020" opacity="0.85" />
    <polygon points="900,425 1200,530 1100,545" fill="#b06018" opacity="0.9" />
    <polygon points="1100,545 1200,530 1200,700" fill="#a85c18" opacity="0.85" />
    <polygon points="0,700 320,560 400,700" fill="#985210" opacity="0.9" />
    <polygon points="320,560 600,555 500,700" fill="#a05818" opacity="0.85" />
    <polygon points="600,555 840,550 700,700" fill="#986015" opacity="0.9" />
    <polygon points="840,550 1100,545 900,700" fill="#a85c18" opacity="0.85" />
    <polygon points="1100,545 1200,700 1000,700" fill="#b06020" opacity="0.9" />
    <polygon points="400,700 500,700 0,700" fill="#904e10" opacity="0.85" />
    <polygon points="500,700 700,700 600,700" fill="#a05818" opacity="0.8" />
    <polygon points="700,700 900,700 800,700" fill="#985015" opacity="0.85" />
    <polygon points="900,700 1000,700 1200,700" fill="#a85c18" opacity="0.8" />
  </svg>
);

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Low-poly geometric background */}
      <LowPolyBackground />

      {/* Overlay for readability — kept light so patterns show through */}
      <div className="absolute inset-0 bg-slate-950/20" />

      <div className="container-width section-padding relative z-10 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-sm font-bold mb-8 tracking-wide uppercase shadow-lg">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Vijayawada's #1 Skill Engineering Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero text-5xl sm:text-6xl lg:text-8xl leading-[1.05] tracking-wide mb-6 text-center text-white drop-shadow-2xl"
          >
            SMART LEARNING
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
              MANAGEMENT SYSTEM
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
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
              size="xl"
              className="h-14 px-10 rounded-2xl bg-white text-slate-900 font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all group gap-2"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="xl"
              className="h-14 px-10 rounded-2xl bg-orange-500/90 hover:bg-orange-500 text-white font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all gap-2 backdrop-blur"
              onClick={() => navigate("/student-dashboard")}
            >
              <Play className="w-5 h-5 fill-current" />
              Explore Platform
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            {[
              { icon: BookOpen, text: "100+ Courses" },
              { icon: Users, text: "10K+ Students" },
              { icon: Trophy, text: "95% Placement" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white/90 text-xs font-bold tracking-wide"
              >
                <item.icon className="w-3.5 h-3.5 text-amber-300" />
                {item.text}
              </div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 pt-8 border-t border-white/20"
          >
            {[
              { value: "10K+", label: "Active Students" },
              { value: "50+", label: "Expert Instructors" },
              { value: "100+", label: "Courses" },
              { value: "95%", label: "Success Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-black text-white drop-shadow">
                  {stat.value}
                </p>
                <p className="text-sm text-white/60 mt-1 font-semibold tracking-wide">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
