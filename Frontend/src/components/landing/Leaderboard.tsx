import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Arun Kumar",    score: 9850, avatar: "AK", badge: "bg-amber-500" },
  { rank: 2, name: "Priya Sharma",  score: 9720, avatar: "PS", badge: "bg-slate-400" },
  { rank: 3, name: "Rahul Verma",   score: 9580, avatar: "RV", badge: "bg-orange-700" },
  { rank: 4, name: "Sneha Patel",   score: 9420, avatar: "SP", badge: "bg-blue-500" },
  { rank: 5, name: "Vikram Singh",  score: 9350, avatar: "VS", badge: "bg-blue-500" },
];

const rankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-orange-700" />;
  return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
};

const Leaderboard = () => {
  return (
    <section id="leaderboard" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Real-Time Rankings
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight tracking-tight">
              Compete, Improve{" "}
              <span className="text-orange-500">&amp; Lead</span>
            </h2>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8">
              Our live ranking system motivates you to sharpen skills daily. Compare with peers and earn your spot among Vijayawada's top tech talent.
            </p>
            <div className="grid grid-cols-2 gap-5">
              {[
                { value: "500+",  label: "Weekly Competitors", color: "text-blue-600" },
                { value: "25+",   label: "Active Leaderboards", color: "text-orange-500" },
                { value: "2.5K",  label: "Skill Challenges",   color: "text-blue-600" },
                { value: "40%",   label: "Avg. Skill Growth",  color: "text-orange-500" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className={`text-2xl md:text-3xl font-black ${s.color} tracking-tight`}>{s.value}</div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Leaderboard card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Top Performers</h3>
                  <p className="text-xs text-slate-400 font-medium">Live this week</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50">
                {leaderboardData.map((user, idx) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.07 }}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${user.rank === 1 ? "bg-amber-50/60" : "hover:bg-slate-50"}`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex justify-center flex-shrink-0">
                      {rankIcon(user.rank)}
                    </div>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full ${user.badge} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>
                      {user.avatar}
                    </div>
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-slate-400">Level {30 + user.rank * 3}</p>
                    </div>
                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <span className="font-black text-slate-900 text-base">{user.score.toLocaleString()}</span>
                      <p className="text-[10px] text-green-500 font-bold">+{(user.rank * 1.5).toFixed(1)}%</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                <button className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">
                  View Full Leaderboard
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Leaderboard;
