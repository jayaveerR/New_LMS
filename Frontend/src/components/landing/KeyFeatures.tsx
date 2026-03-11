import { motion } from "framer-motion";
import { Video, Play, ShieldCheck, Trophy, FileSearch, BarChart3, Headphones, MonitorPlay, ClipboardList, Medal, FileText, LineChart, Zap } from "lucide-react";

/**
 * KeyFeatures — PCB / Circuit Board Low-Poly
 * Orange amber traces on warm honey base with L-shaped circuit pads
 */
const KeyFeatBg = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="kf-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="50%" stopColor="#fff7ed" />
        <stop offset="100%" stopColor="#eff6ff" />
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#kf-bg)" />

    {/* Top rows — dense orange chevrons */}
    <polygon points="0,0 100,0 50,75" fill="#ea580c" opacity="0.13" />
    <polygon points="100,0 200,0 150,75" fill="#f97316" opacity="0.11" />
    <polygon points="200,0 300,0 250,75" fill="#fb923c" opacity="0.12" />
    <polygon points="300,0 400,0 350,75" fill="#ea580c" opacity="0.11" />
    <polygon points="400,0 500,0 450,75" fill="#f97316" opacity="0.12" />
    <polygon points="500,0 600,0 550,75" fill="#fb923c" opacity="0.11" />
    <polygon points="600,0 700,0 650,75" fill="#ea580c" opacity="0.12" />
    <polygon points="700,0 800,0 750,75" fill="#f97316" opacity="0.11" />
    <polygon points="800,0 900,0 850,75" fill="#fb923c" opacity="0.12" />
    <polygon points="900,0 1000,0 950,75" fill="#ea580c" opacity="0.11" />
    <polygon points="1000,0 1100,0 1050,75" fill="#f97316" opacity="0.12" />
    <polygon points="1100,0 1200,0 1150,75" fill="#ea580c" opacity="0.13" />

    {/* Inverse row 1 */}
    <polygon points="50,75 100,0 150,75" fill="#fed7aa" opacity="0.11" />
    <polygon points="150,75 200,0 250,75" fill="#fde68a" opacity="0.10" />
    <polygon points="250,75 300,0 350,75" fill="#fed7aa" opacity="0.11" />
    <polygon points="350,75 400,0 450,75" fill="#fde68a" opacity="0.10" />
    <polygon points="450,75 500,0 550,75" fill="#fed7aa" opacity="0.11" />
    <polygon points="550,75 600,0 650,75" fill="#fde68a" opacity="0.10" />
    <polygon points="650,75 700,0 750,75" fill="#fed7aa" opacity="0.11" />
    <polygon points="750,75 800,0 850,75" fill="#fde68a" opacity="0.10" />
    <polygon points="850,75 900,0 950,75" fill="#fed7aa" opacity="0.11" />
    <polygon points="950,75 1000,0 1050,75" fill="#fde68a" opacity="0.10" />
    <polygon points="1050,75 1100,0 1150,75" fill="#fed7aa" opacity="0.11" />

    {/* Row 2 */}
    <polygon points="0,75 50,75 0,150" fill="#f97316" opacity="0.11" />
    <polygon points="50,75 150,75 100,150" fill="#fdba74" opacity="0.10" />
    <polygon points="150,75 250,75 200,150" fill="#fcd34d" opacity="0.09" />
    <polygon points="250,75 350,75 300,150" fill="#fdba74" opacity="0.10" />
    <polygon points="350,75 450,75 400,150" fill="#fcd34d" opacity="0.09" />
    <polygon points="450,75 550,75 500,150" fill="#fdba74" opacity="0.10" />
    <polygon points="550,75 650,75 600,150" fill="#fcd34d" opacity="0.09" />
    <polygon points="650,75 750,75 700,150" fill="#fdba74" opacity="0.10" />
    <polygon points="750,75 850,75 800,150" fill="#fcd34d" opacity="0.09" />
    <polygon points="850,75 950,75 900,150" fill="#fdba74" opacity="0.10" />
    <polygon points="950,75 1050,75 1000,150" fill="#fcd34d" opacity="0.09" />
    <polygon points="1050,75 1150,75 1100,150" fill="#fdba74" opacity="0.10" />
    <polygon points="1150,75 1200,75 1200,150" fill="#f97316" opacity="0.11" />

    {/* Row 3 */}
    <polygon points="100,150 50,75 150,75" fill="#fed7aa" opacity="0.09" />
    <polygon points="200,150 150,75 250,75" fill="#fde68a" opacity="0.08" />
    <polygon points="300,150 250,75 350,75" fill="#fed7aa" opacity="0.09" />
    <polygon points="400,150 350,75 450,75" fill="#fde68a" opacity="0.08" />
    <polygon points="500,150 450,75 550,75" fill="#fed7aa" opacity="0.09" />
    <polygon points="600,150 550,75 650,75" fill="#fde68a" opacity="0.08" />
    <polygon points="700,150 650,75 750,75" fill="#fed7aa" opacity="0.09" />
    <polygon points="800,150 750,75 850,75" fill="#fde68a" opacity="0.08" />
    <polygon points="900,150 850,75 950,75" fill="#fed7aa" opacity="0.09" />
    <polygon points="1000,150 950,75 1050,75" fill="#fde68a" opacity="0.08" />
    <polygon points="1100,150 1050,75 1150,75" fill="#fed7aa" opacity="0.09" />

    {/* Row 4 */}
    <polygon points="0,150 100,150 50,225" fill="#fb923c" opacity="0.10" />
    <polygon points="100,150 200,150 150,225" fill="#fed7aa" opacity="0.09" />
    <polygon points="200,150 300,150 250,225" fill="#fde68a" opacity="0.09" />
    <polygon points="300,150 400,150 350,225" fill="#fed7aa" opacity="0.09" />
    <polygon points="400,150 500,150 450,225" fill="#fde68a" opacity="0.09" />
    <polygon points="500,150 600,150 550,225" fill="#fed7aa" opacity="0.09" />
    <polygon points="600,150 700,150 650,225" fill="#fde68a" opacity="0.09" />
    <polygon points="700,150 800,150 750,225" fill="#fed7aa" opacity="0.09" />
    <polygon points="800,150 900,150 850,225" fill="#fde68a" opacity="0.09" />
    <polygon points="900,150 1000,150 950,225" fill="#fed7aa" opacity="0.09" />
    <polygon points="1000,150 1100,150 1050,225" fill="#fde68a" opacity="0.09" />
    <polygon points="1100,150 1200,150 1200,225" fill="#fb923c" opacity="0.10" />

    {/* Blue accent — bottom left */}
    <polygon points="0,650 150,600 0,800" fill="#bfdbfe" opacity="0.11" />
    <polygon points="150,600 350,650 200,800" fill="#93c5fd" opacity="0.10" />
    <polygon points="0,800 200,800 100,900" fill="#60a5fa" opacity="0.11" />
    {/* Blue accent — bottom right */}
    <polygon points="1200,650 1050,600 1200,800" fill="#bfdbfe" opacity="0.11" />
    <polygon points="1050,600 850,650 1000,800" fill="#93c5fd" opacity="0.10" />
    <polygon points="1200,800 1000,800 1100,900" fill="#60a5fa" opacity="0.11" />

    {/* === Node pads (circuit board solder joints) === */}
    {[0,100,200,300,400,500,600,700,800,900,1000,1100,1200].map((x, i) => (
      <rect key={`top-pad-${i}`} x={x-4} y={-4} width="8" height="8" rx="2" fill="#ea580c" opacity="0.28" />
    ))}
    {[50,150,250,350,450,550,650,750,850,950,1050,1150].map((x, i) => (
      <circle key={`mid-node-${i}`} cx={x} cy={75} r="3" fill="#f97316" opacity="0.26" />
    ))}
    {[100,200,300,400,500,600,700,800,900,1000,1100].map((x, i) => (
      <rect key={`row2-pad-${i}`} x={x-3} y={147} width="6" height="6" rx="1" fill="#fb923c" opacity="0.22" />
    ))}
    {[50,150,250,350,450,550,650,750,850,950,1050,1150].map((x, i) => (
      <circle key={`row3-node-${i}`} cx={x} cy={225} r="2.5" fill="#fbbf24" opacity="0.22" />
    ))}

    {/* Circuit trace lines */}
    <line x1="0" y1="0" x2="1200" y2="0" stroke="#ea580c" strokeWidth="1" opacity="0.14" />
    <line x1="0" y1="75" x2="1200" y2="75" stroke="#f97316" strokeWidth="0.7" opacity="0.12" />
    <line x1="0" y1="150" x2="1200" y2="150" stroke="#fb923c" strokeWidth="0.7" opacity="0.10" />
    <line x1="0" y1="225" x2="1200" y2="225" stroke="#fdba74" strokeWidth="0.5" opacity="0.09" />
    {/* Vertical circuit traces */}
    <line x1="600"  y1="0" x2="600"  y2="300" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="4 5" opacity="0.09" />
    <line x1="300"  y1="0" x2="300"  y2="225" stroke="#ea580c" strokeWidth="0.4" strokeDasharray="3 6" opacity="0.08" />
    <line x1="900"  y1="0" x2="900"  y2="225" stroke="#ea580c" strokeWidth="0.4" strokeDasharray="3 6" opacity="0.08" />
  </svg>
);

const features = [
  { icon: Video,       secondaryIcon: Headphones,     title: "Live Classes",      description: "Interactive expert sessions via Zoom & Google Meet", gradient: "from-blue-600 to-blue-400" },
  { icon: MonitorPlay, secondaryIcon: Play,            title: "Recorded Videos",   description: "HD course content accessible anytime, on any device", gradient: "from-orange-500 to-amber-400" },
  { icon: ShieldCheck, secondaryIcon: ClipboardList,   title: "Secure Exams",      description: "AI-proctored assessments with full anti-cheating systems", gradient: "from-blue-600 to-blue-400" },
  { icon: Trophy,      secondaryIcon: Medal,           title: "Leaderboard",       description: "Real-time peer ranking to motivate daily growth", gradient: "from-orange-500 to-amber-400" },
  { icon: FileSearch,  secondaryIcon: FileText,        title: "ATS Resume Score",  description: "AI analysis to optimize your resume for recruiters", gradient: "from-blue-600 to-blue-400" },
  { icon: BarChart3,   secondaryIcon: LineChart,       title: "Progress Tracking", description: "Detailed analytics to monitor performance over time", gradient: "from-orange-500 to-amber-400" },
];

const KeyFeatures = () => (
  <section id="features" className="relative py-16 md:py-24 overflow-hidden">
    <KeyFeatBg />
    <div className="absolute inset-0 bg-white/60" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12 md:mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-5">
          <Zap className="w-3.5 h-3.5" /> Platform Features
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          Everything You Need to <span className="text-orange-500">Succeed</span>
        </h2>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Live classes, secure exams, AI resume scoring, and more — all inside one powerful platform.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}>
            <div className="h-full bg-white/85 backdrop-blur-sm border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-white border border-slate-100 shadow flex items-center justify-center">
                    <f.secondaryIcon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">{f.title}</h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed flex-1">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default KeyFeatures;
