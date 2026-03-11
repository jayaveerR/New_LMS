import { motion } from "framer-motion";
import { Linkedin, Twitter, Users } from "lucide-react";

const InstBg = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="inst-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eff6ff" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#fff7ed" />
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#inst-bg)" />
    {/* Left navy crystal pillar */}
    <polygon points="0,0 80,0 40,70" fill="#1e3a8a" opacity="0.14" />
    <polygon points="80,0 160,0 120,70" fill="#1e40af" opacity="0.12" />
    <polygon points="40,70 80,0 120,70" fill="#1d4ed8" opacity="0.11" />
    <polygon points="0,70 40,70 0,140" fill="#1e3a8a" opacity="0.13" />
    <polygon points="40,70 120,70 80,140" fill="#1e40af" opacity="0.11" />
    <polygon points="0,140 80,140 40,210" fill="#1d4ed8" opacity="0.12" />
    <polygon points="80,140 160,140 120,210" fill="#1e40af" opacity="0.11" />
    <polygon points="40,210 80,140 120,210" fill="#3b82f6" opacity="0.10" />
    <polygon points="0,210 40,210 0,280" fill="#1e3a8a" opacity="0.12" />
    <polygon points="40,210 120,210 80,280" fill="#1e40af" opacity="0.10" />
    <polygon points="0,280 80,280 40,350" fill="#1d4ed8" opacity="0.11" />
    <polygon points="40,350 80,280 120,350" fill="#3b82f6" opacity="0.09" />
    <polygon points="0,350 40,350 0,420" fill="#1e3a8a" opacity="0.11" />
    <polygon points="0,420 80,420 40,490" fill="#1d4ed8" opacity="0.10" />
    <polygon points="0,490 40,490 0,560" fill="#1e3a8a" opacity="0.09" />
    <polygon points="0,560 80,560 40,630" fill="#1d4ed8" opacity="0.08" />
    <polygon points="0,630 40,630 0,700" fill="#1e3a8a" opacity="0.09" />
    <polygon points="0,700 80,700 0,800" fill="#1d4ed8" opacity="0.08" />
    {/* Right navy crystal pillar */}
    <polygon points="1200,0 1120,0 1160,70" fill="#1e3a8a" opacity="0.14" />
    <polygon points="1120,0 1040,0 1080,70" fill="#1e40af" opacity="0.12" />
    <polygon points="1160,70 1120,0 1080,70" fill="#1d4ed8" opacity="0.11" />
    <polygon points="1200,70 1160,70 1200,140" fill="#1e3a8a" opacity="0.13" />
    <polygon points="1160,70 1080,70 1120,140" fill="#1e40af" opacity="0.11" />
    <polygon points="1200,140 1120,140 1160,210" fill="#1d4ed8" opacity="0.12" />
    <polygon points="1120,140 1040,140 1080,210" fill="#1e40af" opacity="0.11" />
    <polygon points="1160,210 1120,140 1080,210" fill="#3b82f6" opacity="0.10" />
    <polygon points="1200,210 1160,210 1200,280" fill="#1e3a8a" opacity="0.12" />
    <polygon points="1160,210 1080,210 1120,280" fill="#1e40af" opacity="0.10" />
    <polygon points="1200,280 1120,280 1160,350" fill="#1d4ed8" opacity="0.11" />
    <polygon points="1160,350 1120,280 1080,350" fill="#3b82f6" opacity="0.09" />
    <polygon points="1200,350 1160,350 1200,420" fill="#1e3a8a" opacity="0.11" />
    <polygon points="1200,420 1120,420 1200,490" fill="#1d4ed8" opacity="0.10" />
    <polygon points="1200,490 1160,490 1200,560" fill="#1e3a8a" opacity="0.09" />
    <polygon points="1200,560 1120,560 1200,630" fill="#1d4ed8" opacity="0.08" />
    <polygon points="1200,630 1160,630 1200,700" fill="#1e3a8a" opacity="0.09" />
    <polygon points="1200,700 1120,700 1200,800" fill="#1d4ed8" opacity="0.08" />
    {/* Golden crown center top */}
    <polygon points="500,0 600,0 550,90" fill="#f59e0b" opacity="0.10" />
    <polygon points="600,0 700,0 650,90" fill="#fbbf24" opacity="0.09" />
    <polygon points="550,90 600,0 650,90" fill="#fde68a" opacity="0.11" />
    <polygon points="450,0 500,0 475,90" fill="#f59e0b" opacity="0.08" />
    <polygon points="700,0 750,0 725,90" fill="#f59e0b" opacity="0.08" />
    {/* Bottom orange accent */}
    <polygon points="200,700 400,750 300,800" fill="#fed7aa" opacity="0.11" />
    <polygon points="600,700 800,750 700,800" fill="#fbbf24" opacity="0.10" />
    <polygon points="900,750 1000,700 900,800" fill="#fdba74" opacity="0.11" />
    {/* Nodes */}
    <circle cx="0"    cy="0"   r="3.5" fill="#1e40af" opacity="0.28" />
    <circle cx="40"   cy="70"  r="3"   fill="#1e40af" opacity="0.26" />
    <circle cx="80"   cy="140" r="3"   fill="#1e40af" opacity="0.24" />
    <circle cx="40"   cy="210" r="3"   fill="#3b82f6" opacity="0.22" />
    <circle cx="80"   cy="280" r="2.5" fill="#3b82f6" opacity="0.20" />
    <circle cx="1200" cy="0"   r="3.5" fill="#1e40af" opacity="0.28" />
    <circle cx="1160" cy="70"  r="3"   fill="#1e40af" opacity="0.26" />
    <circle cx="1120" cy="140" r="3"   fill="#1e40af" opacity="0.24" />
    <circle cx="1160" cy="210" r="3"   fill="#3b82f6" opacity="0.22" />
    <circle cx="1120" cy="280" r="2.5" fill="#3b82f6" opacity="0.20" />
    <circle cx="550"  cy="90"  r="4"   fill="#f59e0b" opacity="0.35" />
    <circle cx="650"  cy="90"  r="4"   fill="#f59e0b" opacity="0.35" />
    <circle cx="600"  cy="0"   r="5"   fill="#fbbf24" opacity="0.35" />
    {/* Edge lines */}
    <line x1="0"    y1="0" x2="0"    y2="800" stroke="#1e40af" strokeWidth="1.5" opacity="0.14" />
    <line x1="1200" y1="0" x2="1200" y2="800" stroke="#1e40af" strokeWidth="1.5" opacity="0.14" />
    <line x1="80"   y1="0" x2="80"   y2="500" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="5 6" opacity="0.10" />
    <line x1="1120" y1="0" x2="1120" y2="500" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="5 6" opacity="0.10" />
  </svg>
);

const instructors = [
  { name: "Dr. Rajesh Kumar",  expertise: "Full Stack Dev",   exp: "15+ Yrs", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" },
  { name: "Priya Menon",       expertise: "Data Science & AI", exp: "12+ Yrs", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face" },
  { name: "Amit Sharma",       expertise: "Cloud & DevOps",   exp: "10+ Yrs", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" },
  { name: "Sneha Reddy",       expertise: "UI/UX Design",     exp: "8+ Yrs",  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face" },
];

const Instructors = () => (
  <section id="instructors" className="relative py-16 md:py-24 overflow-hidden">
    <InstBg />
    <div className="absolute inset-0 bg-white/60" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12 md:mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-5">
          <Users className="w-3.5 h-3.5" /> Expert Mentors
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          Learn From The <span className="text-blue-600">Best in Tech</span>
        </h2>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Our mentors don't just teach — they've built systems at scale.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {instructors.map((inst, i) => (
          <motion.div key={inst.name} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }} className="group">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300">
              <div className="relative h-56 sm:h-60 overflow-hidden">
                <img src={inst.image} alt={inst.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-3">
                  <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-blue-50 transition-colors shadow-md"><Linkedin className="w-4 h-4 text-blue-600" /></a>
                  <a href="#" className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-blue-50 transition-colors shadow-md"><Twitter className="w-4 h-4 text-blue-600" /></a>
                </div>
              </div>
              <div className="p-5 text-center">
                <h3 className="font-bold text-slate-900 text-base mb-1">{inst.name}</h3>
                <p className="text-sm font-semibold text-orange-500 mb-1">{inst.expertise}</p>
                <p className="text-xs text-slate-400 font-medium">{inst.exp} Experience</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Instructors;
