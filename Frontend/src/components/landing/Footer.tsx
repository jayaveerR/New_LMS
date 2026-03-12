import logo from "@/assets/logo.png";
import { Linkedin, Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  const links = {
    Platform: ["Live Classes", "Recorded Videos", "Secure Exams", "Leaderboard", "ATS Resume Score"],
    Company:  ["About Us", "Our Trainers", "Blog", "Careers", "Press"],
    Support:  ["Help Center", "Documentation", "Contact Us", "Privacy Policy", "Terms of Service"],
  };

  const socials = [
    { icon: Linkedin,  href: "#", label: "LinkedIn",  bg: "hover:bg-blue-600" },
    { icon: Instagram, href: "#", label: "Instagram", bg: "hover:bg-pink-600" },
    { icon: Facebook,  href: "#", label: "Facebook",  bg: "hover:bg-blue-700" },
  ];

  return (
    <footer id="contact" className="relative bg-[#0075CF] text-[#FDFEFE] overflow-hidden">
      {/* Background shards/abstract shapes for depth */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0 L400,0 L0,400 Z" fill="white" />
          <path d="M1200,800 L800,800 L1200,400 Z" fill="white" />
          <path d="M0,800 L300,500 L0,200 Z" fill="#FD5A1A" />
        </svg>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <img src={logo} alt="AOTMS Logo" className="h-12 mb-5 brightness-0 invert" />
            <p className="text-[#FDFEFE]/85 text-sm md:text-base leading-relaxed mb-6 max-w-sm font-medium">
              Vijayawada's premier LMS platform for skill-based learning, secure exams, and 100% placement support.
            </p>
            {/* Contact info */}
            <div className="flex flex-col gap-3">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-[#FDFEFE]/90 hover:text-white font-semibold text-sm transition-colors">
                <Phone className="w-4 h-4 text-[#FD5A1A] flex-shrink-0" /> (+91) 98765-43210
              </a>
              <a href="mailto:hello@aotms.com" className="flex items-center gap-2 text-[#FDFEFE]/90 hover:text-white font-semibold text-sm transition-colors">
                <Mail className="w-4 h-4 text-[#FD5A1A] flex-shrink-0" /> hello@aotms.com
              </a>
              <div className="flex items-start gap-2 text-[#FDFEFE]/85 font-medium text-sm">
                <MapPin className="w-4 h-4 text-[#FD5A1A] flex-shrink-0 mt-0.5" />
                <span>Auram Creative Center, Vijayawada, AP — 520001</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-bold text-[#FDFEFE] text-sm uppercase tracking-widest mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#FDFEFE]/85 hover:text-white font-medium text-sm transition-colors leading-relaxed">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* Newsletter Banner */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="font-black text-[#FDFEFE] text-lg mb-1">Stay updated with AOTMS</p>
              <p className="text-[#FDFEFE]/90 text-sm font-medium">Get course updates, placement news & tech tips weekly.</p>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-[#FDFEFE] placeholder-[#FDFEFE]/40 text-sm focus:outline-none focus:border-[#FD5A1A] transition-colors"
              />
              <button className="px-5 py-2.5 rounded-xl bg-[#FD5A1A] hover:bg-[#E34D14] text-[#FDFEFE] font-bold text-sm transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#FDFEFE]/75 text-sm font-medium">© {year} AOTMS. All rights reserved.</p>
          <div className="flex gap-2">
            {socials.map((s, i) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#FDFEFE]/70 hover:text-[#FDFEFE] transition-all group relative overflow-hidden"
              >
                <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${i % 2 === 0 ? "bg-[#FD5A1A]" : "bg-[#FD5A1A]/80"}`} />
                <s.icon className="w-4 h-4 relative z-10" />
              </a>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
