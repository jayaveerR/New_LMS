import { motion } from "framer-motion";
import { UserPlus, BookMarked, Video, ClipboardCheck, Trophy } from "lucide-react";
import roadImage from "@/assets/road.png";

/**
 * HowItWorks — Data Pipeline Flow Low-Poly
 * Left-to-right flowing triangles like data streams, teal/green palette
 */
const HowBg = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="how-bg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f0fdf4" />
        <stop offset="50%" stopColor="#ecfdf5" />
        <stop offset="100%" stopColor="#fff7ed" />
      </linearGradient>
    </defs>
    <rect width="1200" height="1000" fill="url(#how-bg)" />

    {/* Left input funnel — dense teal triangles */}
    <polygon points="0,0 120,0 0,100" fill="#0d9488" opacity="0.13" />
    <polygon points="0,100 120,0 120,200" fill="#14b8a6" opacity="0.11" />
    <polygon points="0,200 120,200 0,300" fill="#0f766e" opacity="0.12" />
    <polygon points="0,300 120,200 120,400" fill="#2dd4bf" opacity="0.10" />
    <polygon points="0,400 120,400 0,500" fill="#0d9488" opacity="0.11" />
    <polygon points="0,500 120,400 120,600" fill="#14b8a6" opacity="0.10" />
    <polygon points="0,600 120,600 0,700" fill="#0f766e" opacity="0.11" />
    <polygon points="0,700 120,600 120,800" fill="#2dd4bf" opacity="0.09" />
    <polygon points="0,800 120,800 0,900" fill="#0d9488" opacity="0.10" />
    <polygon points="0,900 120,800 120,1000" fill="#14b8a6" opacity="0.09" />
    <polygon points="0,1000 120,1000 0,900" fill="#0f766e" opacity="0.10" />

    {/* Right output funnel — orange triangles */}
    <polygon points="1200,0 1080,0 1200,100" fill="#ea580c" opacity="0.13" />
    <polygon points="1200,100 1080,0 1080,200" fill="#f97316" opacity="0.11" />
    <polygon points="1200,200 1080,200 1200,300" fill="#c2410c" opacity="0.12" />
    <polygon points="1200,300 1080,200 1080,400" fill="#fb923c" opacity="0.10" />
    <polygon points="1200,400 1080,400 1200,500" fill="#ea580c" opacity="0.11" />
    <polygon points="1200,500 1080,400 1080,600" fill="#f97316" opacity="0.10" />
    <polygon points="1200,600 1080,600 1200,700" fill="#c2410c" opacity="0.11" />
    <polygon points="1200,700 1080,600 1080,800" fill="#fb923c" opacity="0.09" />
    <polygon points="1200,800 1080,800 1200,900" fill="#ea580c" opacity="0.10" />
    <polygon points="1200,900 1080,800 1080,1000" fill="#f97316" opacity="0.09" />

    {/* Top horizontal flow band */}
    <polygon points="120,0 360,0 240,80" fill="#6ee7b7" opacity="0.10" />
    <polygon points="360,0 600,0 480,80" fill="#34d399" opacity="0.09" />
    <polygon points="600,0 840,0 720,80" fill="#6ee7b7" opacity="0.10" />
    <polygon points="840,0 1080,0 960,80" fill="#34d399" opacity="0.09" />
    <polygon points="240,80 360,0 480,80" fill="#a7f3d0" opacity="0.09" />
    <polygon points="480,80 600,0 720,80" fill="#d1fae5" opacity="0.10" />
    <polygon points="720,80 840,0 960,80" fill="#a7f3d0" opacity="0.09" />

    {/* Bottom horizontal flow band */}
    <polygon points="120,900 360,900 240,1000" fill="#fed7aa" opacity="0.10" />
    <polygon points="360,900 600,900 480,1000" fill="#fdba74" opacity="0.09" />
    <polygon points="600,900 840,900 720,1000" fill="#fed7aa" opacity="0.10" />
    <polygon points="840,900 1080,900 960,1000" fill="#fdba74" opacity="0.09" />
    <polygon points="240,1000 360,900 480,1000" fill="#fde68a" opacity="0.09" />
    <polygon points="480,1000 600,900 720,1000" fill="#fef3c7" opacity="0.10" />
    <polygon points="720,1000 840,900 960,1000" fill="#fde68a" opacity="0.09" />

    {/* === Flow nodes — circular at column endpoints === */}
    {[0,100,200,300,400,500,600,700,800,900,1000].map((y,i) => (
      <circle key={`left-node-${i}`} cx="120" cy={y} r="3.5" fill="#0d9488" opacity="0.30" />
    ))}
    {[0,100,200,300,400,500,600,700,800,900,1000].map((y,i) => (
      <circle key={`right-node-${i}`} cx="1080" cy={y} r="3.5" fill="#ea580c" opacity="0.30" />
    ))}
    {[240,480,720,960].map((x,i) => (
      <circle key={`top-node-${i}`} cx={x} cy="80" r="3" fill="#14b8a6" opacity="0.26" />
    ))}
    {[240,480,720,960].map((x,i) => (
      <circle key={`bot-node-${i}`} cx={x} cy="920" r="3" fill="#f97316" opacity="0.26" />
    ))}

    {/* Flow trace lines */}
    <line x1="120" y1="0" x2="120" y2="1000" stroke="#0d9488" strokeWidth="1.2" opacity="0.14" />
    <line x1="1080" y1="0" x2="1080" y2="1000" stroke="#ea580c" strokeWidth="1.2" opacity="0.14" />
    <line x1="120" y1="80" x2="1080" y2="80" stroke="#6ee7b7" strokeWidth="0.5" strokeDasharray="6 5" opacity="0.10" />
    <line x1="120" y1="920" x2="1080" y2="920" stroke="#fdba74" strokeWidth="0.5" strokeDasharray="6 5" opacity="0.10" />
    {/* Diagonal flow arrows (triangle pointers) */}
    <polygon points="280,38 310,80 250,80" fill="#0d9488" opacity="0.14" />
    <polygon points="520,38 550,80 490,80" fill="#14b8a6" opacity="0.12" />
    <polygon points="760,38 790,80 730,80" fill="#0d9488" opacity="0.14" />
    <polygon points="1000,38 1030,80 970,80" fill="#14b8a6" opacity="0.12" />
  </svg>
);

const steps = [
  { icon: UserPlus,       step: "01", title: "Sign Up & Profile",   description: "Create your account and set up your learning profile", color: "bg-blue-600",   label: "text-blue-600" },
  { icon: BookMarked,     step: "02", title: "Choose Your Course",   description: "Browse and enroll in courses that match your goals",    color: "bg-orange-500", label: "text-orange-600" },
  { icon: Video,          step: "03", title: "Attend Classes",       description: "Join live sessions or watch recorded lectures",          color: "bg-blue-600",   label: "text-blue-600" },
  { icon: ClipboardCheck, step: "04", title: "Practice Mock Tests",  description: "Sharpen your skills with hands-on test assessments",    color: "bg-orange-500", label: "text-orange-600" },
  { icon: Trophy,         step: "05", title: "Track Your Rank",      description: "Complete exams and climb the competitive leaderboard",   color: "bg-blue-600",   label: "text-blue-600" },
];

const HowItWorks = () => (
  <section id="how-it-works" className="relative py-16 md:py-24 overflow-hidden">
    <HowBg />
    <div className="absolute inset-0 bg-white/60" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12 md:mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-5">Your Roadmap</span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          Your Learning <span className="text-orange-500">Journey</span>
        </h2>
        <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">From enrollment to employment in 5 structured steps.</p>
      </motion.div>

      <div className="hidden md:block relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
        <img src={roadImage} alt="Learning journey road" className="w-full h-auto object-cover" style={{ minHeight: "520px" }} />
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="absolute top-[6%] right-[12%] lg:right-[16%] w-36 lg:w-44 flex flex-col items-center text-center">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-2"><UserPlus className="w-6 h-6 lg:w-7 lg:h-7 text-white" /></div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step 01</span>
          <h3 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight">{steps[0].title}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="absolute top-[20%] left-[10%] lg:left-[14%] w-36 lg:w-44 flex flex-col items-center text-center">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg mb-2"><BookMarked className="w-6 h-6 lg:w-7 lg:h-7 text-white" /></div>
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Step 02</span>
          <h3 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight">{steps[1].title}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="absolute top-[40%] right-[14%] lg:right-[20%] w-36 lg:w-44 flex flex-col items-center text-center">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-2"><Video className="w-6 h-6 lg:w-7 lg:h-7 text-white" /></div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step 03</span>
          <h3 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight">{steps[2].title}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="absolute top-[58%] left-[12%] lg:left-[18%] w-36 lg:w-44 flex flex-col items-center text-center">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg mb-2"><ClipboardCheck className="w-6 h-6 lg:w-7 lg:h-7 text-white" /></div>
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Step 04</span>
          <h3 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight">{steps[3].title}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="absolute top-[76%] right-[24%] lg:right-[30%] w-36 lg:w-44 flex flex-col items-center text-center">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-2"><Trophy className="w-6 h-6 lg:w-7 lg:h-7 text-white" /></div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step 05</span>
          <h3 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight">{steps[4].title}</h3>
        </motion.div>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {steps.map((step, i) => (
          <motion.div key={step.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-start gap-4 bg-white/85 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center shadow-md flex-shrink-0`}><step.icon className="w-6 h-6 text-white" /></div>
            <div>
              <span className={`text-[10px] font-black ${step.label} uppercase tracking-widest`}>Step {step.step}</span>
              <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
