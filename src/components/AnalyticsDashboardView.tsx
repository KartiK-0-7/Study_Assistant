import { useState, useEffect } from "react";
import { 
  getStudySessions, 
  calculateAnalyticsStats, 
  resetStudySessionsToEmpty, 
  restoreMockSessions,
  AnalyticsStats 
} from "../utils/analytics";
import { 
  Activity, 
  Award, 
  Flame, 
  TrendingUp, 
  Calendar, 
  RotateCcw, 
  Trash2, 
  HelpCircle, 
  Copy, 
  Mic, 
  Presentation, 
  FileText, 
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { StudyMode } from "../types";

export default function AnalyticsDashboardView() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "ledger" | "badges">("overview");

  // Reload statistics from localStorage
  const loadStats = () => {
    const computed = calculateAnalyticsStats();
    setStats(computed);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleReset = () => {
    if (confirm("Are you sure you want to clear your study analytics history? This will delete all tracked sessions.")) {
      resetStudySessionsToEmpty();
      loadStats();
    }
  };

  const handleRestoreMock = () => {
    restoreMockSessions();
    loadStats();
  };

  if (!stats) return null;

  const modeMetadata: Record<StudyMode, { label: string; icon: any; color: string; bg: string }> = {
    dashboard: { label: "Dashboard", icon: Activity, color: "text-[#D44D2B]", bg: "bg-[#D44D2B]/5" },
    summarize: { label: "Summarize", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/5" },
    explain: { label: "Explain", icon: HelpCircle, color: "text-purple-500", bg: "bg-purple-500/5" },
    mcqs: { label: "MCQs", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/5" },
    flashcards: { label: "Flashcards", icon: Copy, color: "text-amber-500", bg: "bg-amber-500/5" },
    viva: { label: "Oral Viva", icon: Mic, color: "text-rose-500", bg: "bg-rose-500/5" },
    revision: { label: "Revision", icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/5" },
    presentation: { label: "Slide Deck", icon: Presentation, color: "text-cyan-500", bg: "bg-cyan-500/5" },
  };

  // Badges criteria definition
  const achievements = [
    {
      id: "streak_3",
      title: "Consistent Scholar",
      desc: "Maintain a study streak of 2 or more consecutive days.",
      unlocked: stats.streakDays >= 2,
      requirement: `Current streak: ${stats.streakDays} days`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/5"
    },
    {
      id: "accuracy_80",
      title: "High Precision",
      desc: "Achieve an average MCQ test accuracy of 80% or greater.",
      unlocked: stats.mcqAccuracy >= 80 && stats.totalSessions > 0,
      requirement: `Current accuracy: ${stats.mcqAccuracy}%`,
      icon: Award,
      color: "text-emerald-500",
      bg: "bg-emerald-500/5"
    },
    {
      id: "recall_specialist",
      title: "Retention Expert",
      desc: "Achieve a Flashcard Mastery Rate of 80% or higher.",
      unlocked: stats.flashcardsMasteredRatio >= 80 && stats.totalSessions > 0,
      requirement: `Mastery rate: ${stats.flashcardsMasteredRatio}%`,
      icon: Copy,
      color: "text-amber-500",
      bg: "bg-amber-500/5"
    },
    {
      id: "oral_champion",
      title: "Socratic Speaker",
      desc: "Execute a Mock Oral Viva to test technical concept articulation.",
      unlocked: stats.modeCounts.viva > 0,
      requirement: stats.modeCounts.viva > 0 ? "Completed Oral exam" : "Not yet attempted",
      icon: Mic,
      color: "text-rose-500",
      bg: "bg-rose-500/5"
    },
    {
      id: "syllabus_master",
      title: "Pacing Guru",
      desc: "Generate and follow a chronological study revision plan.",
      unlocked: stats.modeCounts.revision > 0,
      requirement: stats.modeCounts.revision > 0 ? "Revision plan mapped" : "Not yet attempted",
      icon: Calendar,
      color: "text-indigo-500",
      bg: "bg-indigo-500/5"
    },
    {
      id: "polymath",
      title: "Syllabus Polymath",
      desc: "Complete sessions in at least 4 distinct StudyCopilot modes.",
      unlocked: (Object.values(stats.modeCounts) as number[]).filter(count => count > 0).length >= 4,
      requirement: `${(Object.values(stats.modeCounts) as number[]).filter(count => count > 0).length} of 4 modes used`,
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-500/5"
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // Max weekly activity count for SVG graph scaling
  const maxWeeklyCount = Math.max(...stats.weeklyActivity.map(a => a.count), 1);

  return (
    <div className="space-y-8">
      {/* Title Header Section */}
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
            Cognitive Diagnostics
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#D44D2B]" />
            Mastery Analytics
          </h2>
          <p className="text-gray-550 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
            INTELLIGENT PERFORMANCE FEEDBACK, SYLLABUS MAPPING & INTELLECTUAL MILESTONES
          </p>
        </div>

        {/* Local Storage management buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleRestoreMock}
            title="Reset to pre-populated mock stats to review visual design"
            className="text-[9px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/5 px-3 py-1.5 border border-[#D44D2B]/15 hover:bg-[#D44D2B]/10 transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Show Mock Data
          </button>
          <button
            onClick={handleReset}
            title="Wipe progress and start completely fresh"
            className="text-[9px] font-bold tracking-widest uppercase text-gray-500 bg-gray-500/5 px-3 py-1.5 border border-gray-500/15 hover:bg-gray-500/10 dark:text-gray-400 transition flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Clear Analytics
          </button>
        </div>
      </div>

      {/* Ticker Row of Mini Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-5 rounded-none flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-none">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Current Streak</div>
            <div className="text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white mt-0.5">
              {stats.streakDays} {stats.streakDays === 1 ? "day" : "days"}
            </div>
          </div>
        </div>

        <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-5 rounded-none flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-none">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Study Sessions</div>
            <div className="text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white mt-0.5">
              {stats.totalSessions} sessions
            </div>
          </div>
        </div>

        <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-5 rounded-none flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-none">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Unique Topics</div>
            <div className="text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white mt-0.5">
              {stats.totalTopics} subjects
            </div>
          </div>
        </div>

        <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-5 rounded-none flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-none">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Badges Unlocked</div>
            <div className="text-2xl font-serif font-bold text-[#1A1A1A] dark:text-white mt-0.5">
              {unlockedCount} / {achievements.length}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary view tabs navigation */}
      <div className="flex border-b border-[#1A1A1A]/10 dark:border-white/10 pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-3 text-[10px] font-bold tracking-widest uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "overview"
              ? "border-[#D44D2B] text-[#D44D2B]"
              : "border-transparent text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white"
          }`}
        >
          Performance Overview
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-5 py-3 text-[10px] font-bold tracking-widest uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "ledger"
              ? "border-[#D44D2B] text-[#D44D2B]"
              : "border-transparent text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white"
          }`}
        >
          Topic Mastery Journal ({stats.topicCompletion.length})
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`px-5 py-3 text-[10px] font-bold tracking-widest uppercase border-b-2 transition-all cursor-pointer ${
            activeTab === "badges"
              ? "border-[#D44D2B] text-[#D44D2B]"
              : "border-transparent text-gray-400 hover:text-[#1A1A1A] dark:hover:text-white"
          }`}
        >
          Achievement Milestones
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Main Visual Graphs row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Chart Column 1: Weekly density */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-4">
              <div>
                <h3 className="text-lg font-serif text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#D44D2B]" />
                  Weekly Syllabus Coverage Graph
                </h3>
                <p className="text-[10px] text-gray-550 uppercase tracking-wider mt-1">
                  Chronological distribution of study milestones and active recall checkups
                </p>
              </div>

              {/* Beautiful Custom SVG Chart */}
              <div className="relative pt-6 pb-2">
                <svg viewBox="0 0 500 220" className="w-full h-auto overflow-visible select-none">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeDasharray="3,3" />
                  <line x1="40" y1="65" x2="480" y2="65" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeDasharray="3,3" />
                  <line x1="40" y1="110" x2="480" y2="110" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeDasharray="3,3" />
                  <line x1="40" y1="155" x2="480" y2="155" stroke="currentColor" className="text-gray-100 dark:text-white/5" strokeDasharray="3,3" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="currentColor" className="text-gray-200 dark:text-white/10" strokeWidth="1" />

                  {/* Left Axis Labels */}
                  <text x="30" y="24" textAnchor="end" className="fill-gray-400 text-[9px] font-mono">Max</text>
                  <text x="30" y="105" textAnchor="end" className="fill-gray-400 text-[9px] font-mono">Mid</text>
                  <text x="30" y="184" textAnchor="end" className="fill-gray-400 text-[9px] font-mono">0</text>

                  {/* Drawing Bars */}
                  {stats.weeklyActivity.map((day, idx) => {
                    const barWidth = 32;
                    const spacing = 60;
                    const x = 50 + idx * spacing;
                    // Scale height so max count fits in 150px
                    const height = (day.count / maxWeeklyCount) * 150;
                    const y = 180 - height;
                    const isToday = new Date().getDay() - 1 === idx || (idx === 6 && new Date().getDay() === 0);

                    return (
                      <g key={day.dayName} className="group cursor-pointer">
                        {/* Interactive Tooltip background */}
                        <rect 
                          x={x - 6} 
                          y="10" 
                          width={barWidth + 12} 
                          height="180" 
                          fill="transparent" 
                          className="hover:fill-black/[0.02] dark:hover:fill-white/[0.02] transition-colors"
                        />
                        
                        {/* Column bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(height, 2)}
                          fill={isToday ? "#D44D2B" : "currentColor"}
                          className={`transition-all duration-500 ${isToday ? "" : "text-[#1A1A1A]/30 dark:text-white/20 group-hover:text-[#1A1A1A] dark:group-hover:text-white"}`}
                        />

                        {/* Top Accent Dot */}
                        {day.count > 0 && (
                          <circle
                            cx={x + barWidth / 2}
                            cy={y}
                            r="3"
                            fill="#D44D2B"
                          />
                        )}

                        {/* Text Value inside/above bar */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          textAnchor="middle"
                          className="fill-gray-600 dark:fill-gray-300 text-[9px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {day.count} {day.count === 1 ? "item" : "items"}
                        </text>

                        {/* Day labels at bottom */}
                        <text
                          x={x + barWidth / 2}
                          y="200"
                          textAnchor="middle"
                          className={`text-[10px] font-bold font-mono tracking-wider uppercase ${isToday ? "fill-[#D44D2B]" : "fill-gray-400"}`}
                        >
                          {day.dayName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Chart Column 2: Cognitive study mode distribution */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-serif text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#D44D2B]" />
                  Balanced Study Pacing
                </h3>
                <p className="text-[10px] text-gray-550 uppercase tracking-wider mt-1">
                  Distribution across conceptual input vs active testing modes
                </p>
              </div>

              {/* Cognitive spectrum graphic */}
              <div className="space-y-4 my-6">
                {/* Mode distribution percentages */}
                {Object.entries(stats.modeCounts)
                  .filter(([mode, count]) => mode !== "dashboard" && (count as number) > 0)
                  .map(([mode, count]) => {
                    const meta = modeMetadata[mode as StudyMode];
                    const countNum = count as number;
                    const percent = Math.round((countNum / stats.totalSessions) * 100);
                    return (
                      <div key={mode} className="space-y-1">
                        <div className="flex justify-between text-[10px] tracking-wider uppercase font-bold text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <meta.icon className={`w-3.5 h-3.5 ${meta.color}`} />
                            {meta.label}
                          </span>
                          <span>{countNum} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-[#FAF9F6] dark:bg-[#1C1A19] h-2 border border-[#1A1A1A]/10 dark:border-white/10">
                          <div 
                            className="bg-current h-full transition-all duration-500" 
                            style={{ width: `${percent}%`, color: meta.color.includes("emerald") ? "#10b981" : meta.color.includes("blue") ? "#3b82f6" : meta.color.includes("purple") ? "#a855f7" : meta.color.includes("amber") ? "#f59e0b" : meta.color.includes("rose") ? "#f43f5e" : meta.color.includes("indigo") ? "#6366f1" : meta.color.includes("cyan") ? "#06b6d4" : "#D44D2B" }}
                          />
                        </div>
                      </div>
                    );
                  })}

                {/* Empty state helper if no real active modes logged */}
                {(Object.values(stats.modeCounts) as number[]).every(c => c === 0) && (
                  <div className="text-center py-6 text-xs text-gray-400 font-serif italic">
                    Start study sessions to view cognitive distribution graph
                  </div>
                )}
              </div>

              <div className="border-t border-[#1A1A1A]/10 dark:border-white/10 pt-4">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#D44D2B] bg-[#D44D2B]/5 px-2 py-0.5 rounded-none border border-[#D44D2B]/10">
                  Senior Study Tip
                </span>
                <p className="text-[10px] leading-relaxed text-gray-500 mt-2 font-serif italic">
                  Aim for an even distribution between Summarize/Explain (Conceptual Input) and Quiz/Flashcards/Oral (Active Output Retrieval).
                </p>
              </div>
            </div>
          </div>

          {/* Metric grids of cognitive performance coefficients */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Meter Card 1: MCQ Testing */}
            <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-[10px] tracking-wider font-bold uppercase text-gray-400">Testing Accuracy</div>
                <div className="text-2xl font-serif text-[#1A1A1A] dark:text-white">
                  {stats.mcqAccuracy}% Correct
                </div>
              </div>
              <div className="w-full bg-white dark:bg-[#1E1C1A] h-1.5 border border-[#1A1A1A]/5 dark:border-white/5">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${stats.mcqAccuracy}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-body-serif italic">
                Averaged metrics compiled from MCQ Quiz grading events.
              </p>
            </div>

            {/* Meter Card 2: Flashcards Active Recall */}
            <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-[10px] tracking-wider font-bold uppercase text-gray-400">Active Recall Mastery</div>
                <div className="text-2xl font-serif text-[#1A1A1A] dark:text-white">
                  {stats.flashcardsMasteredRatio}% Memorized
                </div>
              </div>
              <div className="w-full bg-white dark:bg-[#1E1C1A] h-1.5 border border-[#1A1A1A]/5 dark:border-white/5">
                <div className="bg-amber-500 h-full transition-all" style={{ width: `${stats.flashcardsMasteredRatio}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-body-serif italic">
                Recall coefficient computed based on flagged active double-sided flashcards.
              </p>
            </div>

            {/* Meter Card 3: Oral Viva Technical Terminology */}
            <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-[10px] tracking-wider font-bold uppercase text-gray-400">Oral Viva Keyword Hits</div>
                <div className="text-2xl font-serif text-[#1A1A1A] dark:text-white">
                  {stats.vivaKeywordHitRatio}% Articulated
                </div>
              </div>
              <div className="w-full bg-white dark:bg-[#1E1C1A] h-1.5 border border-[#1A1A1A]/5 dark:border-white/5">
                <div className="bg-rose-500 h-full transition-all" style={{ width: `${stats.vivaKeywordHitRatio}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-body-serif italic">
                Scoring rate on technical keywords required during oral presentation rehearsals.
              </p>
            </div>

            {/* Meter Card 4: Revision Planning Milestones */}
            <div className="bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-[10px] tracking-wider font-bold uppercase text-gray-400">Revision Task Progress</div>
                <div className="text-2xl font-serif text-[#1A1A1A] dark:text-white">
                  {stats.revisionTaskProgress}% Completed
                </div>
              </div>
              <div className="w-full bg-white dark:bg-[#1E1C1A] h-1.5 border border-[#1A1A1A]/5 dark:border-white/5">
                <div className="bg-indigo-500 h-full transition-all" style={{ width: `${stats.revisionTaskProgress}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed font-body-serif italic">
                Cumulative pacing milestones completed within Syllabus Revision planners.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEDGER (Topic Mastery Journal) */}
      {activeTab === "ledger" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-serif text-[#1A1A1A] dark:text-white">
              Syllabus Coverage Ledger
            </h3>
            <p className="text-[10px] text-gray-550 uppercase tracking-wider mt-1">
              Active ledger of academic topics studied and cognitive tools activated
            </p>
          </div>

          {stats.topicCompletion.length > 0 ? (
            <div className="border border-[#1A1A1A]/10 dark:border-white/10 rounded-none overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F6] dark:bg-[#1C1A19] border-b border-[#1A1A1A]/10 dark:border-white/10">
                    <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-gray-500">Subject / Concept Topic</th>
                    <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-gray-500">Latest Active Tools</th>
                    <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-gray-500">Revision count</th>
                    <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-gray-500">Status</th>
                    <th className="p-4 text-[10px] uppercase font-bold tracking-wider text-gray-500 text-right">Last studied</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/5 dark:divide-white/5">
                  {stats.topicCompletion.map((topic, tIdx) => {
                    return (
                      <tr key={tIdx} className="hover:bg-[#FAF9F6]/40 dark:hover:bg-[#1E1C1A]/20 transition-colors">
                        <td className="p-4">
                          <div className="font-serif italic font-medium text-base text-[#1A1A1A] dark:text-white">
                            {topic.name}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {topic.modesUsed.map(m => {
                              const meta = modeMetadata[m];
                              if (!meta) return null;
                              return (
                                <span 
                                  key={m} 
                                  title={meta.label}
                                  className={`inline-flex items-center gap-1 text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 border border-black/5 dark:border-white/5 ${meta.color} ${meta.bg}`}
                                >
                                  <meta.icon className="w-3 h-3" />
                                  {meta.label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-xs tracking-wide text-gray-500 font-mono">
                          {topic.sessionsCount} {topic.sessionsCount === 1 ? "session" : "sessions"}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-[9px] tracking-wider uppercase font-extrabold px-2 py-0.5 rounded-none ${
                            topic.status === "Mastered"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15"
                              : topic.status === "Reviewed"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15"
                              : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/15"
                          }`}>
                            {topic.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-[10px] font-mono text-gray-400">
                          {new Date(topic.lastStudied).toLocaleDateString(undefined, { 
                            month: "short", 
                            day: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-8 space-y-3">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-[#1A1A1A] dark:text-white font-serif italic text-lg">No logged study topics found</p>
              <p className="text-gray-400 text-xs tracking-wider uppercase">
                Input and study your notes or concepts to automatically register deep telemetry here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BADGES (Academic Achievements) */}
      {activeTab === "badges" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="text-xl font-serif text-[#1A1A1A] dark:text-white">
              Milestone Achievements
            </h3>
            <p className="text-[10px] text-gray-550 uppercase tracking-wider mt-1">
              Unlock prestigious badges by satisfying strict cognitive goals and testing counts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.id} 
                  className={`border p-6 rounded-none space-y-4 transition-all ${
                    item.unlocked 
                      ? "bg-white dark:bg-[#1E1C1A] border-[#D44D2B]/35 shadow-sm" 
                      : "bg-[#FAF9F6]/40 dark:bg-[#1C1A19]/25 border-[#1A1A1A]/5 dark:border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-none ${item.unlocked ? item.bg + " " + item.color : "bg-gray-150 text-gray-450 dark:bg-gray-800"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[8px] tracking-widest font-extrabold uppercase px-2 py-0.5 ${
                      item.unlocked 
                        ? "bg-[#D44D2B]/10 text-[#D44D2B]" 
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800"
                    }`}>
                      {item.unlocked ? "UNLOCKED" : "LOCKED"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-serif text-[#1A1A1A] dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] leading-relaxed text-gray-500 font-serif italic">
                      {item.desc}
                    </p>
                  </div>

                  <div className="border-t border-[#1A1A1A]/5 dark:border-white/5 pt-3">
                    <span className="text-[9px] font-mono text-gray-450 tracking-wider block uppercase">
                      {item.requirement}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
