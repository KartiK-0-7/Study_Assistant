import { useState, FormEvent } from "react";
import { ExplanationData } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { HelpCircle, Lightbulb, Zap, HelpCircle as DangerIcon, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { recordStudySession } from "../utils/analytics";

export default function ExplainView() {
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("Like I'm 5 (ELI5)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExplanationData | null>(null);

  const explainStyles = [
    "Like I'm 5 (ELI5)",
    "An intuitive, story-focused analogy",
    "Academic standard from first principles",
    "Visual step-by-step breakdown with code/math"
  ];

  const handleExplain = async (e: FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/study/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, style }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate explanation.");
      }

      const resData = await response.json();
      setData(resData);
      recordStudySession("explain", concept, { level: style });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6">
        <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
          Explanation Lab
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-[#D44D2B]" />
          Concept Explainer
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
          DECONSTRUCT COMPLEX THEORIES AND TERMINOLOGY INTO PLAIN ENGLISH ANALOGIES
        </p>
      </div>

      {!data ? (
        <form onSubmit={handleExplain} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                What concept would you like explained?
              </label>
              <input
                type="text"
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] text-xs transition"
                placeholder="e.g., Quantum Entanglement, Black-Scholes Model, Mitochondria..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Explanation Perspective
              </label>
              <select
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {explainStyles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !concept.trim()}
            className="p-4 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold tracking-[0.15em] uppercase rounded-none transition flex items-center justify-center gap-2 text-xs cursor-pointer border-none w-full md:w-auto px-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D44D2B]" />
                Unpacking conceptual files...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D44D2B]" />
                Deconstruct Concept
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-none text-xs tracking-wider uppercase font-bold">
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
          {/* Main Explanation Block */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-8 md:p-10 rounded-none space-y-6">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-white/10 pb-4">
              <div>
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/5 border border-[#D44D2B]/25 px-2.5 py-1">
                  {style}
                </span>
                <h3 className="text-3xl font-serif text-[#1A1A1A] dark:text-white mt-3">
                  {data.concept}
                </h3>
              </div>
              <button
                onClick={() => setData(null)}
                className="text-[10px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/5 px-3 py-1.5 rounded-none border border-[#D44D2B]/25 hover:bg-[#D44D2B]/10 transition"
              >
                Deconstruct New
              </button>
            </div>

            <div className="prose dark:prose-invert max-w-none text-[#1A1A1A]/90 dark:text-[#E5E3DC]/90 font-body-serif text-sm md:text-base leading-relaxed">
              <MarkdownRenderer content={data.simpleExplanation} />
            </div>
          </div>

          {/* Analogy, Core Principles, and Misconception block */}
          <div className="space-y-6">
            {/* Vivid Analogy Callout */}
            <div className="bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2 border-b border-[#1A1A1A]/5 pb-2">
                <Lightbulb className="w-4 h-4 text-[#D44D2B]" />
                The Intuitive Analogy
              </h4>
              <p className="text-[#1A1A1A]/85 dark:text-[#E5E3DC]/85 font-serif italic text-sm leading-relaxed">
                "{data.keyAnalogy}"
              </p>
            </div>

            {/* Core Principles Cards */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-[#1A1A1A] dark:text-white flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-[#D44D2B]" />
                Core Principles
              </h4>
              {data.corePrinciples.map((principle, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 rounded-none flex gap-4">
                  <div className="w-5 h-5 rounded-none bg-[#1A1A1A] dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#1A1A1A] dark:text-white text-xs leading-tight tracking-wider uppercase">
                      {principle.title}
                    </h5>
                    <p className="text-[#1A1A1A]/70 dark:text-[#E5E3DC]/70 font-serif italic text-xs mt-2 leading-relaxed">
                      {principle.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Common Misconception warning */}
            <div className="bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#D44D2B]/30 dark:border-[#D44D2B]/30 p-6 rounded-none">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-[#D44D2B] mb-3 flex items-center gap-2 border-b border-[#D44D2B]/10 pb-2">
                <AlertTriangle className="w-4 h-4 text-[#D44D2B]" />
                Misconception Buster
              </h4>
              <p className="text-[#1A1A1A]/85 dark:text-[#E5E3DC]/85 font-serif italic text-xs leading-relaxed">
                {data.commonMisconception}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
