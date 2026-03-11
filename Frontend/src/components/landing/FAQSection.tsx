import { motion } from "framer-motion";
import { useState } from "react";
import { HelpCircle, ChevronDown, GraduationCap, BookOpen, Briefcase, Award } from "lucide-react";

/**
 * FAQSection — Blueprint / Technical Grid Low-Poly
 * Cyan grid subdivided into triangles, like an engineering drawing with circuit nodes
 */
const FAQBg = () => {
  const cols = [0, 150, 300, 450, 600, 750, 900, 1050, 1200];
  const rows = [0, 125, 250, 375, 500, 625, 750, 875, 1000];
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="faq-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ecfeff" />
          <stop offset="50%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#fff7ed" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1000" fill="url(#faq-bg)" />

      {/* Grid lines — blueprint feel */}
      {cols.map((x) => (
        <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="1000" stroke="#0891b2" strokeWidth="0.4" opacity="0.10" />
      ))}
      {rows.map((y) => (
        <line key={`h-${y}`} x1="0" y1={y} x2="1200" y2={y} stroke="#0891b2" strokeWidth="0.4" opacity="0.10" />
      ))}

      {/* Diagonal triangles subdividing the grid — alternating cyan tones */}
      {[0, 2, 4, 6].map((ci) =>
        [0, 2, 4, 6].map((ri) => {
          const x1 = cols[ci], y1 = rows[ri];
          const x2 = cols[ci + 1] ?? x1, y2 = rows[ri + 1] ?? y1;
          return (
            <polygon key={`tri-${ci}-${ri}`}
              points={`${x1},${y1} ${x2},${y1} ${x1},${y2}`}
              fill="#06b6d4" opacity="0.06" />
          );
        })
      )}
      {[1, 3, 5, 7].map((ci) =>
        [1, 3, 5, 7].map((ri) => {
          const x1 = cols[ci] ?? 0, y1 = rows[ri] ?? 0;
          const x2 = cols[ci + 1] ?? x1, y2 = rows[ri + 1] ?? y1;
          return (
            <polygon key={`tri2-${ci}-${ri}`}
              points={`${x1},${y1} ${x2},${y2} ${x1},${y2}`}
              fill="#22d3ee" opacity="0.05" />
          );
        })
      )}

      {/* Top accent — dense cyan spikes */}
      <polygon points="0,0 150,0 75,80" fill="#0891b2" opacity="0.13" />
      <polygon points="150,0 300,0 225,80" fill="#0e7490" opacity="0.11" />
      <polygon points="300,0 450,0 375,80" fill="#06b6d4" opacity="0.12" />
      <polygon points="450,0 600,0 525,80" fill="#0891b2" opacity="0.11" />
      <polygon points="600,0 750,0 675,80" fill="#0e7490" opacity="0.12" />
      <polygon points="750,0 900,0 825,80" fill="#06b6d4" opacity="0.11" />
      <polygon points="900,0 1050,0 975,80" fill="#0891b2" opacity="0.12" />
      <polygon points="1050,0 1200,0 1125,80" fill="#0e7490" opacity="0.13" />
      <polygon points="75,80 150,0 225,80" fill="#a5f3fc" opacity="0.10" />
      <polygon points="225,80 300,0 375,80" fill="#cffafe" opacity="0.11" />
      <polygon points="375,80 450,0 525,80" fill="#a5f3fc" opacity="0.10" />
      <polygon points="525,80 600,0 675,80" fill="#cffafe" opacity="0.11" />
      <polygon points="675,80 750,0 825,80" fill="#a5f3fc" opacity="0.10" />
      <polygon points="825,80 900,0 975,80" fill="#cffafe" opacity="0.11" />
      <polygon points="975,80 1050,0 1125,80" fill="#a5f3fc" opacity="0.10" />

      {/* Bottom band — warm orange contrast */}
      <polygon points="0,850 150,900 75,1000" fill="#fed7aa" opacity="0.11" />
      <polygon points="150,900 300,850 225,1000" fill="#fdba74" opacity="0.10" />
      <polygon points="300,850 450,900 375,1000" fill="#fed7aa" opacity="0.11" />
      <polygon points="450,900 600,850 525,1000" fill="#fdba74" opacity="0.10" />
      <polygon points="600,850 750,900 675,1000" fill="#fed7aa" opacity="0.11" />
      <polygon points="750,900 900,850 825,1000" fill="#fdba74" opacity="0.10" />
      <polygon points="900,850 1050,900 975,1000" fill="#fed7aa" opacity="0.11" />
      <polygon points="1050,900 1200,850 1125,1000" fill="#fb923c" opacity="0.12" />

      {/* Grid intersection circuit nodes */}
      {cols.map((x) =>
        rows.slice(0, 4).map((y) => (
          <rect key={`pad-${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" rx="1.5"
            fill="#0891b2" opacity="0.20" />
        ))
      )}
      {/* Top spike nodes */}
      {[75, 225, 375, 525, 675, 825, 975, 1125].map((x) => (
        <circle key={`spike-${x}`} cx={x} cy={80} r="3" fill="#06b6d4" opacity="0.28" />
      ))}
      {/* Bottom orange nodes */}
      {[75, 225, 375, 525, 675, 825, 975, 1125].map((x) => (
        <circle key={`bot-${x}`} cx={x} cy={920} r="3" fill="#f97316" opacity="0.26" />
      ))}
    </svg>
  );
};

const faqGroups = [
  {
    category: "Admissions", icon: GraduationCap, color: "bg-blue-600",
    questions: [
      { q: "What is the eligibility to join AOTMS?", a: "We welcome students from all backgrounds. Basic computer knowledge is helpful but not mandatory — we start from zero." },
      { q: "Do I need a technical background?", a: "No! Our curriculum is designed for complete beginners. We start from fundamentals and build up progressively." },
      { q: "How do I register for a course?", a: "Register online via our website or visit our Vijayawada campus. Counselors will guide you." },
      { q: "Can I join with a career gap?", a: "Absolutely! We focus on skills and dedication, not your history." },
    ],
  },
  {
    category: "Training", icon: BookOpen, color: "bg-orange-500",
    questions: [
      { q: "Are classes online or offline?", a: "We offer both. Online for flexibility or offline at our campus — same quality either way." },
      { q: "Do you provide hands-on projects?", a: "Yes! Every course includes 3–5 real-world portfolio projects you can show to employers." },
      { q: "What if I miss a class?", a: "Recorded sessions are always available. You can also attend the same topic in a different batch." },
      { q: "Do you have weekend batches?", a: "Yes, dedicated weekend batches are available for working professionals." },
    ],
  },
  {
    category: "Placements", icon: Briefcase, color: "bg-blue-600",
    questions: [
      { q: "Do you offer placement assistance?", a: "Yes — 100% placement support including job referrals, interview scheduling, and career counseling." },
      { q: "Which companies hire from AOTMS?", a: "TCS, Infosys, Wipro, Accenture, Amazon and many high-growth startups actively hire our graduates." },
      { q: "Do you conduct mock interviews?", a: "Yes! Regular HR and technical mock interviews with industry experts are part of preparation." },
      { q: "Will you help with resume building?", a: "Yes. Our team creates ATS-friendly resumes and optimizes your LinkedIn for maximum visibility." },
    ],
  },
  {
    category: "Fees & Certification", icon: Award, color: "bg-orange-500",
    questions: [
      { q: "Do you offer EMI or installments?", a: "Yes, flexible EMI plans with 3–6 installments at zero extra charge." },
      { q: "Will I receive a certificate?", a: "Yes — industry-recognized course completion + project certificates are issued upon finishing." },
      { q: "Are there any scholarships?", a: "Merit-based scholarships up to 30% and regular early-bird discounts are offered." },
      { q: "What is included in the course fee?", a: "Training, materials, project guidance, placement support, and lifetime resource access." },
    ],
  },
];

const FAQSection = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section id="faq" className="relative py-16 md:py-24 overflow-hidden">
      <FAQBg />
      <div className="absolute inset-0 bg-white/60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-5">
            <HelpCircle className="w-3.5 h-3.5" /> Support Center
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
            Frequently Asked <span className="text-blue-600">Questions</span>
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know about AOTMS programs, placements, and our training process.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {faqGroups.map((group, gi) => (
            <motion.div key={group.category} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: gi * 0.08 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className={`flex items-center gap-3 px-6 py-4 ${group.color}`}>
                <group.icon className="w-5 h-5 text-white" />
                <h3 className="font-bold text-white text-base tracking-wide">{group.category}</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {group.questions.map((item, qi) => {
                  const id = `${gi}-${qi}`;
                  const isOpen = openId === id;
                  return (
                    <div key={qi}>
                      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors">
                        <span className="font-semibold text-slate-800 text-sm md:text-base leading-snug">{item.q}</span>
                        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.25 }} className="px-6 pb-5">
                          <p className="text-slate-500 text-sm md:text-base leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
