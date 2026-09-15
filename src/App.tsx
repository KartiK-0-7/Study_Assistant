import { useState } from "react";
import { StudyMode } from "./types";
import AnalyticsDashboardView from "./components/AnalyticsDashboardView";
import SummarizeView from "./components/SummarizeView";
import ExplainView from "./components/ExplainView";
import MCQQuizView from "./components/MCQQuizView";
import FlashcardsView from "./components/FlashcardsView";
import VivaPracticeView from "./components/VivaPracticeView";
import RevisionPlanView from "./components/RevisionPlanView";
import PresentationView from "./components/PresentationView";
import { 
  FileText, 
  HelpCircle, 
  BookOpen, 
  Copy, 
  Mic, 
  Calendar, 
  Presentation, 
  GraduationCap, 
  Sparkles,
  Github,
  LayoutDashboard
} from "lucide-react";

export default function App() {
  const [activeMode, setActiveMode] = useState<StudyMode>("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Mastery Analytics", icon: LayoutDashboard, desc: "Syllabus metrics & active recall charts" },
    { id: "summarize", label: "Summarize Notes", icon: FileText, desc: "Condense guides and textbook logs" },
    { id: "explain", label: "Explain Concepts", icon: HelpCircle, desc: "Analogy-driven simplified explanations" },
    { id: "mcqs", label: "Generate MCQs", icon: BookOpen, desc: "Interactive custom quiz grader" },
    { id: "flashcards", label: "Create Flashcards", icon: Copy, desc: "Double-sided active recall decks" },
    { id: "viva", label: "Mock Oral Viva", icon: Mic, desc: "Oral exams & keyword checklists" },
    { id: "revision", label: "Revision Planner", icon: Calendar, desc: "Day-by-day exam schedules" },
    { id: "presentation", label: "Build Slide Deck", icon: Presentation, desc: "Structured themed presentation slides" },
  ];

  const renderActiveView = () => {
    switch (activeMode) {
      case "dashboard":
        return <AnalyticsDashboardView />;
      case "summarize":
        return <SummarizeView />;
      case "explain":
        return <ExplainView />;
      case "mcqs":
        return <MCQQuizView />;
      case "flashcards":
        return <FlashcardsView />;
      case "viva":
        return <VivaPracticeView />;
      case "revision":
        return <RevisionPlanView />;
      case "presentation":
        return <PresentationView />;
      default:
        return <AnalyticsDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] dark:bg-[#121110] font-sans flex flex-col antialiased text-[#1A1A1A] dark:text-[#E5E3DC]">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FCFAF7]/95 dark:bg-[#121110]/95 backdrop-blur-md border-b border-[#1A1A1A]/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-extrabold tracking-[0.25em] uppercase text-[#1A1A1A] dark:text-white">StudyCopilot</span>
              <div className="w-2 h-2 rounded-full bg-[#D44D2B]"></div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/10 dark:bg-[#D44D2B]/20 px-2 py-0.5 rounded-none">AI v1.4</span>
            </div>
            <span className="hidden md:inline text-[11px] text-[#1A1A1A]/50 dark:text-white/50 tracking-widest uppercase font-semibold">| Helping students learn faster</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/70 dark:text-white/70 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D44D2B] animate-pulse" />
              Powered by Gemini 3.5
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Side Sidebar: Feature List */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          
          {/* Mobile responsive swipe-view / scroll list of tabs */}
          <div className="flex md:hidden overflow-x-auto pb-2 gap-2 scrollbar-none snap-x">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMode(item.id as StudyMode)}
                  className={`snap-center flex items-center gap-2 px-4 py-2.5 rounded-none border text-[11px] font-bold tracking-widest uppercase transition cursor-pointer ${
                    isActive
                      ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                      : "bg-[#FAF9F6] dark:bg-[#1C1A19] border-[#1A1A1A]/10 dark:border-white/10 text-[#1A1A1A]/70 dark:text-white/70 hover:bg-[#F2EFE9]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop static Sidebar menu */}
          <div className="hidden md:flex flex-col bg-[#FCFAF7] dark:bg-[#121110] border border-[#1A1A1A]/10 dark:border-white/10 p-6 space-y-4 rounded-none">
            <span className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 dark:text-white/50 tracking-[0.15em] mb-2 block">
              Core Study Tools
            </span>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMode === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMode(item.id as StudyMode)}
                    className={`w-full flex items-center py-3 text-left transition cursor-pointer border-b border-[#1A1A1A]/5 dark:border-white/5 group ${
                      isActive
                        ? "text-[#D44D2B] font-bold"
                        : "text-[#1A1A1A]/70 dark:text-[#E5E3DC]/70 hover:text-[#1A1A1A] dark:hover:text-white"
                    }`}
                  >
                    <span className={`w-3 h-[1px] mr-3 transition-all ${
                      isActive ? "bg-[#D44D2B] w-5" : "bg-transparent group-hover:bg-[#1A1A1A]/30 w-3"
                    }`} />
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase block">
                        {item.label}
                      </span>
                      <span className="text-[9px] text-[#1A1A1A]/50 dark:text-white/40 block mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick study advisory card */}
          <div className="hidden md:block bg-[#FAF9F6] dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-3">
            <h5 className="text-[10px] font-bold text-[#1A1A1A] dark:text-white tracking-widest uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D44D2B]" />
              Cognitive Booster
            </h5>
            <p className="text-[11px] text-[#1A1A1A]/70 dark:text-[#E5E3DC]/70 leading-relaxed font-serif italic">
              "Combine 'Active Recall Flashcards' with 'Generate MCQs' to create the absolute highest memory retention multiplier for your upcoming exam boards."
            </p>
          </div>
        </aside>

        {/* Right Side Main Work area */}
        <main className="flex-1 bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-8 md:p-12 rounded-none min-h-[500px] shadow-none">
          {renderActiveView()}
        </main>
      </div>

      {/* Simple Footer */}
      <footer className="border-t border-[#1A1A1A]/10 dark:border-white/10 py-8 mt-auto bg-[#FCFAF7] dark:bg-[#121110]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] tracking-widest uppercase text-[#1A1A1A]/50 dark:text-white/40">
          © {new Date().getFullYear()} StudyCopilot AI. Crafted for deep, uninterrupted academic focus.
        </div>
      </footer>
    </div>
  );
}
