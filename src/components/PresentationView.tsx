import { useState, useEffect, FormEvent } from "react";
import { PresentationData, Slide } from "../types";
import { Presentation, Sparkles, Loader2, Play, ChevronLeft, ChevronRight, Maximize2, Minimize2, Lightbulb, FileText, Layout } from "lucide-react";
import { recordStudySession } from "../utils/analytics";

export default function PresentationView() {
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(6);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PresentationData | null>(null);

  // Studying / presenter states
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Map themeColor string to specific Editorial theme styling
  const getThemeClasses = (color: string) => {
    const defaultTheme = {
      bg: "bg-[#FAF9F6] dark:bg-[#1E1C1A]",
      border: "border-[#1A1A1A]/10 dark:border-white/10",
      accent: "text-[#D44D2B]",
      bullet: "bg-[#D44D2B]",
      ring: "focus:ring-[#D44D2B]"
    };

    if (!color) return defaultTheme;

    const lowerColor = color.toLowerCase();
    if (lowerColor.includes("emerald") || lowerColor.includes("green")) {
      return {
        bg: "bg-[#F5F8F6] dark:bg-[#191F1C]",
        border: "border-emerald-600/20 dark:border-emerald-500/10",
        accent: "text-emerald-700 dark:text-emerald-400",
        bullet: "bg-emerald-600",
        ring: "focus:ring-emerald-600"
      };
    } else if (lowerColor.includes("amber") || lowerColor.includes("yellow") || lowerColor.includes("orange")) {
      return {
        bg: "bg-[#FDF9F3] dark:bg-[#201D1A]",
        border: "border-amber-600/20 dark:border-amber-500/10",
        accent: "text-amber-700 dark:text-amber-400",
        bullet: "bg-amber-600",
        ring: "focus:ring-amber-600"
      };
    } else if (lowerColor.includes("rose") || lowerColor.includes("red") || lowerColor.includes("pink")) {
      return {
        bg: "bg-[#FAF4F4] dark:bg-[#221A1A]",
        border: "border-rose-600/20 dark:border-rose-500/10",
        accent: "text-rose-700 dark:text-rose-400",
        bullet: "bg-rose-600",
        ring: "focus:ring-rose-600"
      };
    } else if (lowerColor.includes("violet") || lowerColor.includes("purple") || lowerColor.includes("fuchsia")) {
      return {
        bg: "bg-[#F7F5F9] dark:bg-[#1E1B22]",
        border: "border-violet-600/20 dark:border-violet-500/10",
        accent: "text-violet-700 dark:text-violet-400",
        bullet: "bg-violet-600",
        ring: "focus:ring-violet-600"
      };
    } else if (lowerColor.includes("cyan") || lowerColor.includes("teal") || lowerColor.includes("sky")) {
      return {
        bg: "bg-[#F3F8F9] dark:bg-[#192022]",
        border: "border-cyan-600/20 dark:border-cyan-500/10",
        accent: "text-cyan-700 dark:text-cyan-400",
        bullet: "bg-cyan-600",
        ring: "focus:ring-cyan-600"
      };
    }

    return defaultTheme;
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCurrentSlideIndex(0);

    try {
      const response = await fetch("/api/study/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slideCount, notes }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate presentation.");
      }

      const resData = await response.json();
      setData(resData);
      recordStudySession("presentation", resData.title || topic, { total: resData.slides.length });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation for rehearsal slide viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data) return;
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(prev + 1, data.slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [data, isFullscreen]);

  const currentSlide = data?.slides[currentSlideIndex];
  const theme = getThemeClasses(data?.themeColor || "indigo");

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6">
        <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
          Presenter Outline
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
          <Presentation className="w-8 h-8 text-[#D44D2B]" />
          Slide Deck Builder
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
          GENERATE FULLY THEMED LECTURE SHEETS WITH CHRONOLOGICAL ACCENTS, VISUAL SUGGESTIONS AND DELIVERY NOTES
        </p>
      </div>

      {!data && !loading && (
        <form onSubmit={handleGenerate} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Presentation Topic
              </label>
              <input
                type="text"
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] text-xs transition"
                placeholder="e.g., Deep Learning in Healthcare, Origins of WWI, Photosynthesis Process..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Slide Count
              </label>
              <select
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                value={slideCount}
                onChange={(e) => setSlideCount(Number(e.target.value))}
              >
                <option value={4}>4 Slides</option>
                <option value={6}>6 Slides</option>
                <option value={8}>8 Slides</option>
                <option value={10}>10 Slides</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
              Compile slides from specific study Notes (Optional)
            </label>
            <textarea
              className="w-full h-40 p-4 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] transition resize-y font-body-serif text-sm leading-relaxed"
              placeholder="Paste specific textbook summaries, logs, or transcripts. Leave blank to let the AI draft general topic slides..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="p-4 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold tracking-[0.15em] uppercase rounded-none transition flex items-center justify-center gap-2 text-xs cursor-pointer border-none w-full md:w-auto px-8"
          >
            <Sparkles className="w-4 h-4 text-[#D44D2B]" />
            Compile Slide Outline
          </button>

          {error && (
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-none text-xs tracking-wider uppercase font-bold">
              {error}
            </div>
          )}
        </form>
      )}

      {loading && (
        <div className="max-w-xl mx-auto text-center py-16 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#D44D2B] mx-auto" />
          <p className="text-[#1A1A1A] dark:text-white font-serif italic text-lg">Compiling deck outline and designing themes...</p>
          <p className="text-gray-400 text-xs tracking-widest uppercase font-bold">Pacing outlines, visual diagrams, and student presenter speaker cues.</p>
        </div>
      )}

      {data && currentSlide && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          
          {/* Slide Deck presentation viewport */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* The actual styled slide frame */}
            <div className={`w-full aspect-video border rounded-none ${theme.bg} ${theme.border} p-8 md:p-12 flex flex-col justify-between relative overflow-hidden transition-all duration-300`}>
              
              {/* Slide numbering badge */}
              <div className="absolute top-4 right-6 text-[10px] font-bold tracking-widest text-[#1A1A1A]/40 dark:text-white/40 uppercase">
                {currentSlideIndex + 1} of {data.slides.length}
              </div>

              {/* Title / Intro Slide special layout */}
              {currentSlideIndex === 0 ? (
                <div className="my-auto space-y-4">
                  <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 ${theme.accent}`}>
                    Presentation deck
                  </span>
                  <h1 className="text-3xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight">
                    {data.title}
                  </h1>
                  <p className="text-sm font-body-serif italic text-gray-500">
                    {data.subtitle}
                  </p>
                </div>
              ) : (
                // Standard Content Slide layout
                <>
                  <div className="space-y-4">
                    <h3 className="text-xl md:text-2xl font-serif text-[#1A1A1A] dark:text-white tracking-tight border-b border-[#1A1A1A]/10 dark:border-white/10 pb-3">
                      {currentSlide.title}
                    </h3>
                    <ul className="space-y-3 pt-1">
                      {currentSlide.points.map((pt, idx) => (
                        <li key={idx} className="flex gap-3 items-start text-xs md:text-sm text-[#1A1A1A]/90 dark:text-[#E5E3DC]/90 leading-relaxed tracking-wide">
                          <span className={`w-1.5 h-1.5 mt-2 flex-shrink-0 rounded-none ${theme.bullet}`} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Footer label */}
              <div className="text-[9px] text-gray-400 tracking-widest uppercase font-bold pt-4 border-t border-[#1A1A1A]/10 dark:border-white/10">
                {data.title}
              </div>
            </div>

            {/* Deck control bar */}
            <div className="flex items-center justify-between p-2.5 bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 rounded-none text-xs">
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
                  disabled={currentSlideIndex === 0}
                  className="p-2 rounded-none border border-[#1A1A1A]/15 dark:border-white/15 bg-white dark:bg-[#1C1A19] text-[#1A1A1A] dark:text-white hover:bg-gray-100 disabled:opacity-35 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, data.slides.length - 1))}
                  disabled={currentSlideIndex === data.slides.length - 1}
                  className="p-2 rounded-none border border-[#1A1A1A]/15 dark:border-white/15 bg-white dark:bg-[#1C1A19] text-[#1A1A1A] dark:text-white hover:bg-gray-100 disabled:opacity-35 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[10px] tracking-widest uppercase font-bold text-gray-500">
                Slide {currentSlideIndex + 1} of {data.slides.length}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="px-4 py-2 rounded-none border border-[#1A1A1A]/15 dark:border-white/15 bg-white dark:bg-[#1C1A19] text-[#1A1A1A] dark:text-white hover:bg-[#FAF9F6] text-[10px] tracking-widest uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#D44D2B]" />
                  Full Screen
                </button>
                <button
                  onClick={() => setData(null)}
                  className="px-4 py-2 rounded-none border border-[#1A1A1A]/15 dark:border-white/15 bg-white dark:bg-[#1C1A19] text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#1A1A1A] hover:bg-[#FAF9F6] text-[10px] tracking-widest uppercase font-bold cursor-pointer"
                >
                  New Deck
                </button>
              </div>
            </div>
          </div>

          {/* Slide design coordinates and study guidelines */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual alignment suggestions */}
            <div className="bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-4">
              <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white tracking-widest uppercase flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-[#D44D2B]" />
                Visual Layout Strategy
              </h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                RECOMMENDED SCHEMATICS, DIAGRAMS, VECTOR CONCEPT LABELS, OR COMPOSITION MATRIXES FOR THIS SHEET
              </p>

              <div className="p-4 bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/5 dark:border-white/5 rounded-none text-xs text-[#1A1A1A]/85 dark:text-[#E5E3DC]/85 font-serif italic leading-relaxed">
                "{currentSlideIndex === 0 
                  ? "Title slide presentation. Aim for massive display typography, spacious margins, and a centered minimalist layout to command attention from the outset."
                  : currentSlide.visualSuggestion}"
              </div>
            </div>

            {/* Slide presentation guide */}
            <div className="bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-4">
              <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white tracking-widest uppercase flex items-center gap-1.5 border-b border-[#1A1A1A]/10 dark:border-white/10 pb-2">
                <Lightbulb className="w-4 h-4 text-[#D44D2B]" />
                Speaker Delivery Guide
              </h4>
              <p className="text-xs text-[#1A1A1A]/85 dark:text-[#E5E3DC]/85 leading-relaxed font-body-serif italic">
                {currentSlideIndex === 0 
                  ? "Welcome your audience, state the presentation's core purpose clearly, and introduce the underlying study themes that this slide deck resolves."
                  : "Expand on the visual bullet points in plain-English. Address the 'so what?' behind each fact. Do not read raw text from the slide directly; connect concepts sequentially to maintain listener focus."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN IMMERSIVE REHEARSAL OVERLAY */}
      {isFullscreen && data && currentSlide && (
        <div className="fixed inset-0 bg-[#121110] z-[9999] flex flex-col justify-between p-8 md:p-16 select-none text-white font-sans">
          
          {/* Top header stats */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">
              Immersive Rehearsal Mode (ESC to exit)
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 rounded-none bg-white/5 hover:bg-white/10 text-white border border-white/15 font-bold tracking-widest uppercase flex items-center gap-1.5 cursor-pointer transition text-[10px]"
            >
              <Minimize2 className="w-4 h-4 text-[#D44D2B]" />
              Exit Mode
            </button>
          </div>

          {/* Centered slide frame */}
          <div className={`max-w-5xl w-full mx-auto my-auto aspect-video rounded-none border border-white/10 ${theme.bg} p-12 md:p-16 flex flex-col justify-between shadow-2xl relative`}>
            
            <div className="absolute top-6 right-8 text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/40 dark:text-white/40">
              {currentSlideIndex + 1} of {data.slides.length}
            </div>

            {currentSlideIndex === 0 ? (
              <div className="my-auto space-y-4">
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1 bg-[#1A1A1A] dark:bg-white text-white dark:text-black">
                  Main Title
                </span>
                <h1 className="text-4xl md:text-6xl font-serif text-[#1A1A1A] dark:text-white leading-tight">
                  {data.title}
                </h1>
                <p className="text-base md:text-lg font-serif italic text-gray-500">
                  {data.subtitle}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl md:text-4xl font-serif text-[#1A1A1A] dark:text-white tracking-tight border-b border-[#1A1A1A]/10 dark:border-white/10 pb-3">
                  {currentSlide.title}
                </h3>
                <ul className="space-y-4 pt-2">
                  {currentSlide.points.map((pt, idx) => (
                    <li key={idx} className="flex gap-4 items-start text-sm md:text-lg text-[#1A1A1A]/90 dark:text-[#E5E3DC]/90 leading-relaxed tracking-wide">
                      <span className={`w-2 h-2 mt-3 flex-shrink-0 rounded-none ${theme.bullet}`} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-[9px] text-gray-500 tracking-widest uppercase font-bold pt-4 border-t border-[#1A1A1A]/10 dark:border-white/10">
              {data.title}
            </div>
          </div>

          {/* Overlay controls */}
          <div className="flex justify-between items-center max-w-lg w-full mx-auto bg-white/5 border border-white/10 p-2.5 rounded-none">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="p-2.5 rounded-none bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="text-[10px] tracking-widest uppercase font-bold text-gray-400">
              Slide {currentSlideIndex + 1} of {data.slides.length} (Arrows/Space navigate)
            </div>

            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(prev + 1, data.slides.length - 1))}
              disabled={currentSlideIndex === data.slides.length - 1}
              className="p-2.5 rounded-none bg-white/5 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
