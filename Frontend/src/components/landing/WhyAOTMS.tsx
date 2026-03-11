import { motion } from "framer-motion";
import {
  GraduationCap, Users, Briefcase,
  Trophy, Clock, HeadphonesIcon, Sparkles,
} from "lucide-react";

/**
 * WhyAOTMS — Neural Network Low-Poly
 * Dense triangular mesh with blue circle nodes + hairline connections
 */
const WhyBg = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="why-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e0f2fe" />
        <stop offset="50%" stopColor="#f0f9ff" />
        <stop offset="100%" stopColor="#fef9c3" />
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#why-bg)" />

    {/* === Dense Triangle Mesh — Row 1 === */}
    <polygon points="0,0 100,0 50,80" fill="#1e40af" opacity="0.13" />
    <polygon points="100,0 200,0 150,80" fill="#1d4ed8" opacity="0.11" />
    <polygon points="200,0 300,0 250,80" fill="#2563eb" opacity="0.12" />
    <polygon points="300,0 400,0 350,80" fill="#1e40af" opacity="0.10" />
    <polygon points="400,0 500,0 450,80" fill="#3b82f6" opacity="0.12" />
    <polygon points="500,0 600,0 550,80" fill="#2563eb" opacity="0.11" />
    <polygon points="600,0 700,0 650,80" fill="#1d4ed8" opacity="0.12" />
    <polygon points="700,0 800,0 750,80" fill="#1e40af" opacity="0.10" />
    <polygon points="800,0 900,0 850,80" fill="#3b82f6" opacity="0.13" />
    <polygon points="900,0 1000,0 950,80" fill="#2563eb" opacity="0.11" />
    <polygon points="1000,0 1100,0 1050,80" fill="#1d4ed8" opacity="0.12" />
    <polygon points="1100,0 1200,0 1150,80" fill="#1e40af" opacity="0.10" />

    {/* Inverse Row 1 */}
    <polygon points="50,80 100,0 150,80" fill="#93c5fd" opacity="0.10" />
    <polygon points="150,80 200,0 250,80" fill="#bfdbfe" opacity="0.11" />
    <polygon points="250,80 300,0 350,80" fill="#93c5fd" opacity="0.10" />
    <polygon points="350,80 400,0 450,80" fill="#bfdbfe" opacity="0.11" />
    <polygon points="450,80 500,0 550,80" fill="#93c5fd" opacity="0.10" />
    <polygon points="550,80 600,0 650,80" fill="#bfdbfe" opacity="0.11" />
    <polygon points="650,80 700,0 750,80" fill="#93c5fd" opacity="0.10" />
    <polygon points="750,80 800,0 850,80" fill="#bfdbfe" opacity="0.11" />
    <polygon points="850,80 900,0 950,80" fill="#93c5fd" opacity="0.10" />
    <polygon points="950,80 1000,0 1050,80" fill="#bfdbfe" opacity="0.11" />
    <polygon points="1050,80 1100,0 1150,80" fill="#93c5fd" opacity="0.10" />

    {/* Row 2 */}
    <polygon points="0,80 50,80 0,160" fill="#1e40af" opacity="0.11" />
    <polygon points="50,80 150,80 100,160" fill="#60a5fa" opacity="0.09" />
    <polygon points="150,80 250,80 200,160" fill="#93c5fd" opacity="0.10" />
    <polygon points="250,80 350,80 300,160" fill="#60a5fa" opacity="0.09" />
    <polygon points="350,80 450,80 400,160" fill="#93c5fd" opacity="0.10" />
    <polygon points="450,80 550,80 500,160" fill="#60a5fa" opacity="0.09" />
    <polygon points="550,80 650,80 600,160" fill="#93c5fd" opacity="0.10" />
    <polygon points="650,80 750,80 700,160" fill="#60a5fa" opacity="0.09" />
    <polygon points="750,80 850,80 800,160" fill="#93c5fd" opacity="0.10" />
    <polygon points="850,80 950,80 900,160" fill="#60a5fa" opacity="0.09" />
    <polygon points="950,80 1050,80 1000,160" fill="#93c5fd" opacity="0.10" />
    <polygon points="1050,80 1150,80 1100,160" fill="#60a5fa" opacity="0.09" />
    <polygon points="1150,80 1200,80 1200,160" fill="#1e40af" opacity="0.11" />

    {/* Inverse Row 2 */}
    <polygon points="100,160 50,80 150,80" fill="#dbeafe" opacity="0.09" />
    <polygon points="200,160 150,80 250,80" fill="#bfdbfe" opacity="0.10" />
    <polygon points="300,160 250,80 350,80" fill="#dbeafe" opacity="0.09" />
    <polygon points="400,160 350,80 450,80" fill="#bfdbfe" opacity="0.10" />
    <polygon points="500,160 450,80 550,80" fill="#dbeafe" opacity="0.09" />
    <polygon points="600,160 550,80 650,80" fill="#bfdbfe" opacity="0.10" />
    <polygon points="700,160 650,80 750,80" fill="#dbeafe" opacity="0.09" />
    <polygon points="800,160 750,80 850,80" fill="#bfdbfe" opacity="0.10" />
    <polygon points="900,160 850,80 950,80" fill="#dbeafe" opacity="0.09" />
    <polygon points="1000,160 950,80 1050,80" fill="#bfdbfe" opacity="0.10" />
    <polygon points="1100,160 1050,80 1150,80" fill="#dbeafe" opacity="0.09" />

    {/* Row 3 — warm transition */}
    <polygon points="0,160 100,160 50,240" fill="#e0f2fe" opacity="0.08" />
    <polygon points="100,160 200,160 150,240" fill="#bae6fd" opacity="0.09" />
    <polygon points="200,160 300,160 250,240" fill="#7dd3fc" opacity="0.08" />
    <polygon points="300,160 400,160 350,240" fill="#bae6fd" opacity="0.09" />
    <polygon points="400,160 500,160 450,240" fill="#7dd3fc" opacity="0.08" />
    <polygon points="500,160 600,160 550,240" fill="#bae6fd" opacity="0.09" />
    <polygon points="600,160 700,160 650,240" fill="#7dd3fc" opacity="0.08" />
    <polygon points="700,160 800,160 750,240" fill="#bae6fd" opacity="0.09" />
    <polygon points="800,160 900,160 850,240" fill="#7dd3fc" opacity="0.08" />
    <polygon points="900,160 1000,160 950,240" fill="#bae6fd" opacity="0.09" />
    <polygon points="1000,160 1100,160 1050,240" fill="#7dd3fc" opacity="0.08" />
    <polygon points="1100,160 1200,160 1150,240" fill="#bae6fd" opacity="0.09" />

    {/* Mid orange warm accent → bottom  */}
    <polygon points="0,700 200,650 100,800" fill="#fed7aa" opacity="0.11" />
    <polygon points="200,650 500,700 350,820" fill="#fdba74" opacity="0.10" />
    <polygon points="500,700 800,650 650,820" fill="#fbbf24" opacity="0.10" />
    <polygon points="800,650 1100,700 950,820" fill="#fdba74" opacity="0.11" />
    <polygon points="1100,700 1200,650 1200,820" fill="#fed7aa" opacity="0.10" />
    <polygon points="0,820 100,800 0,900" fill="#fb923c" opacity="0.09" />
    <polygon points="100,800 350,820 200,900" fill="#f97316" opacity="0.08" />
    <polygon points="350,820 650,820 500,900" fill="#fb923c" opacity="0.09" />
    <polygon points="650,820 950,820 800,900" fill="#f97316" opacity="0.08" />
    <polygon points="950,820 1200,820 1100,900" fill="#fb923c" opacity="0.09" />

    {/* === Node dots at major vertices === */}
    <circle cx="0"    cy="0"   r="3.5" fill="#1e40af" opacity="0.30" />
    <circle cx="100"  cy="0"   r="3"   fill="#2563eb" opacity="0.25" />
    <circle cx="200"  cy="0"   r="3.5" fill="#1e40af" opacity="0.30" />
    <circle cx="300"  cy="0"   r="3"   fill="#2563eb" opacity="0.25" />
    <circle cx="400"  cy="0"   r="3.5" fill="#1e40af" opacity="0.30" />
    <circle cx="500"  cy="0"   r="3"   fill="#2563eb" opacity="0.25" />
    <circle cx="600"  cy="0"   r="4"   fill="#f97316" opacity="0.30" />
    <circle cx="700"  cy="0"   r="3"   fill="#2563eb" opacity="0.25" />
    <circle cx="800"  cy="0"   r="3.5" fill="#1e40af" opacity="0.30" />
    <circle cx="900"  cy="0"   r="3"   fill="#2563eb" opacity="0.25" />
    <circle cx="1000" cy="0"   r="3.5" fill="#1e40af" opacity="0.30" />
    <circle cx="1100" cy="0"   r="3"   fill="#2563eb" opacity="0.25" />
    <circle cx="1200" cy="0"   r="3.5" fill="#1e40af" opacity="0.30" />
    <circle cx="50"   cy="80"  r="3"   fill="#60a5fa" opacity="0.28" />
    <circle cx="150"  cy="80"  r="2.5" fill="#93c5fd" opacity="0.25" />
    <circle cx="250"  cy="80"  r="3"   fill="#60a5fa" opacity="0.28" />
    <circle cx="350"  cy="80"  r="2.5" fill="#93c5fd" opacity="0.25" />
    <circle cx="450"  cy="80"  r="3"   fill="#60a5fa" opacity="0.28" />
    <circle cx="550"  cy="80"  r="2.5" fill="#93c5fd" opacity="0.25" />
    <circle cx="650"  cy="80"  r="3"   fill="#f97316" opacity="0.28" />
    <circle cx="750"  cy="80"  r="2.5" fill="#93c5fd" opacity="0.25" />
    <circle cx="850"  cy="80"  r="3"   fill="#60a5fa" opacity="0.28" />
    <circle cx="950"  cy="80"  r="2.5" fill="#93c5fd" opacity="0.25" />
    <circle cx="1050" cy="80"  r="3"   fill="#60a5fa" opacity="0.28" />
    <circle cx="1150" cy="80"  r="2.5" fill="#93c5fd" opacity="0.25" />
    <circle cx="100"  cy="160" r="3"   fill="#2563eb" opacity="0.22" />
    <circle cx="300"  cy="160" r="3"   fill="#2563eb" opacity="0.22" />
    <circle cx="500"  cy="160" r="3"   fill="#f97316" opacity="0.22" />
    <circle cx="700"  cy="160" r="3"   fill="#2563eb" opacity="0.22" />
    <circle cx="900"  cy="160" r="3"   fill="#2563eb" opacity="0.22" />
    <circle cx="1100" cy="160" r="3"   fill="#2563eb" opacity="0.22" />
    <circle cx="200"  cy="240" r="2.5" fill="#7dd3fc" opacity="0.22" />
    <circle cx="600"  cy="240" r="2.5" fill="#fbbf24" opacity="0.22" />
    <circle cx="1000" cy="240" r="2.5" fill="#7dd3fc" opacity="0.22" />
    {/* Bottom nodes */}
    <circle cx="200"  cy="650" r="3"   fill="#fb923c" opacity="0.22" />
    <circle cx="500"  cy="700" r="3"   fill="#f97316" opacity="0.22" />
    <circle cx="800"  cy="650" r="3"   fill="#fb923c" opacity="0.22" />
    <circle cx="1100" cy="700" r="3"   fill="#f97316" opacity="0.22" />

    {/* === Circuit Trace Lines === */}
    <line x1="0" y1="0" x2="1200" y2="0" stroke="#2563eb" strokeWidth="0.5" opacity="0.12" />
    <line x1="0" y1="80" x2="1200" y2="80" stroke="#60a5fa" strokeWidth="0.4" opacity="0.10" />
    <line x1="0" y1="160" x2="1200" y2="160" stroke="#93c5fd" strokeWidth="0.4" opacity="0.09" />
    <line x1="0" y1="240" x2="1200" y2="240" stroke="#bae6fd" strokeWidth="0.3" opacity="0.08" />
    <line x1="600" y1="0" x2="600" y2="900" stroke="#f97316" strokeWidth="0.4" strokeDasharray="8 6" opacity="0.08" />
    <line x1="0" y1="0" x2="600" y2="900" stroke="#2563eb" strokeWidth="0.3" strokeDasharray="6 8" opacity="0.06" />
    <line x1="1200" y1="0" x2="600" y2="900" stroke="#2563eb" strokeWidth="0.3" strokeDasharray="6 8" opacity="0.06" />
  </svg>
);

const features = [
  { icon: GraduationCap, title: "Industry-Ready Curriculum", description: "Updated quarterly with latest tech stacks and real employer requirements.", color: "bg-blue-600" },
  { icon: Users, title: "Expert Industry Trainers", description: "Learn from working professionals with 8–15 years of real-world experience.", color: "bg-orange-500" },
  { icon: Briefcase, title: "100% Placement Support", description: "Career cell with 2000+ successful placements across top tech companies.", color: "bg-blue-600" },
  { icon: Trophy, title: "Hands-On Projects", description: "Build 3–5 portfolio projects per course that instantly impress recruiters.", color: "bg-orange-500" },
  { icon: Clock, title: "Flexible Timings", description: "Morning, afternoon, evening & weekend batches for every lifestyle.", color: "bg-blue-600" },
  { icon: HeadphonesIcon, title: "Lifetime Support", description: "Post-course mentorship, community access, and career guidance — forever.", color: "bg-orange-500" },
];

const WhyAOTMS = () => (
  <section id="about" className="relative py-16 md:py-24 overflow-hidden">
    <WhyBg />
    <div className="absolute inset-0 bg-white/60" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12 md:mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-5">
          <Sparkles className="w-3.5 h-3.5" /> Why AOTMS
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
          Why Students Choose <span className="text-blue-600">AOTMS</span>
        </h2>
        <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          We don't just teach code — we build careers. Join thousands of graduates shaping the future of tech.
        </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-16">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}>
            <div className="h-full bg-white/85 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 group flex flex-col">
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 leading-snug">{f.title}</h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed flex-1">{f.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/85 backdrop-blur-sm rounded-2xl p-6 md:p-10 border border-slate-100 shadow-sm">
        {[
          { value: "2000+", label: "Students Placed", color: "text-blue-600" },
          { value: "85%",   label: "Placement Rate",  color: "text-orange-500" },
          { value: "100+",  label: "Hiring Partners", color: "text-blue-600" },
          { value: "4.9★",  label: "Student Rating",  color: "text-orange-500" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className={`text-3xl md:text-4xl lg:text-5xl font-black ${s.color} tracking-tighter`}>{s.value}</div>
            <div className="text-xs md:text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default WhyAOTMS;
