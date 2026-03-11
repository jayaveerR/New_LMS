import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTABackground = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="cta-blue-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#1e40af" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="cta-orange-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ea580c" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    {/* Geometric shards */}
    <path d="M0,0 L600,0 L300,300 Z" fill="url(#cta-blue-grad)" opacity="0.8" />
    <path d="M600,0 L1200,0 L900,300 Z" fill="url(#cta-orange-grad)" opacity="0.8" />
    <path d="M0,600 L600,600 L300,300 Z" fill="url(#cta-orange-grad)" opacity="0.8" />
    <path d="M600,600 L1200,600 L900,300 Z" fill="url(#cta-blue-grad)" opacity="0.8" />
    <path d="M300,300 L600,0 L900,300 L600,600 Z" fill="white" opacity="0.05" />
  </svg>
);

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl min-h-[400px] flex items-center justify-center shadow-2xl"
          style={{ background: "#1e40af" }}
        >
          <CTABackground />

          <div className="relative z-10 px-6 sm:px-10 md:px-16 py-12 md:py-16 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest mb-7 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Start Your Journey
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
              Ready to Build Your<br className="hidden sm:block" />{" "}
              <span className="text-amber-300">Tech Career?</span>
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-9 leading-relaxed">
              Join thousands of students in Vijayawada who are mastering industry-relevant skills and landing their dream tech jobs with AOTMS LMS.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-700 font-black text-base hover:bg-amber-50 hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Register Now <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 border border-white/25 text-white font-bold text-base hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <BookOpen className="w-5 h-5" /> Explore Courses
              </button>
            </div>

            {/* Quick contact strip */}
            <div className="mt-10 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-5 text-white/70 text-sm">
              <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" /> (+91) 98765-43210
              </a>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/30" />
              <a href="mailto:hello@aotms.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> hello@aotms.com
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default CTASection;
