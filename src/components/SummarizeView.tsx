import { useState, FormEvent } from "react";
import { SummaryData } from "../types";
import MarkdownRenderer from "./MarkdownRenderer";
import { BookOpen, FileText, CheckCircle2, Search, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { recordStudySession } from "../utils/analytics";

export default function SummarizeView() {
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState("Standard Study Guide");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SummaryData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const summaryStyles = [
    "Standard Study Guide",
    "Detailed Deep Dive",
    "Quick Bulleted Summary",
    "Executive Overview",
    "Conceptual Map Outline"
  ];

  const handleSummarize = async (e: FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/study/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, style }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate summary.");
      }

      const resData = await response.json();
      setData(resData);
      
      const topicTitle = resData.glossary && resData.glossary.length > 0 
        ? `${resData.glossary[0].term} Summary` 
        : (notes.trim().split("\n")[0].slice(0, 35) + "...");
      recordStudySession("summarize", topicTitle, { level: style });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const filteredGlossary = data?.glossary.filter(item => 
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6">
        <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
          Core Module
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
          <FileText className="w-8 h-8 text-[#D44D2B]" />
          Notes Summarizer
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
          CONCENTRATE LECTURE SLIDES AND TEXTBOOK LOGS INTO DENSE, ACADEMIC ABSTRACTS
        </p>
      </div>

      {!data ? (
        <form onSubmit={handleSummarize} className="space-y-6 max-w-4xl">
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
              Your Lecture Notes / Study Content
            </label>
            <textarea
              className="w-full h-64 p-5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] transition font-body-serif text-sm leading-relaxed"
              placeholder="Paste your study material here (minimum 50 words recommended)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Summary Output Format
              </label>
              <select
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {summaryStyles.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !notes.trim()}
              className="w-full p-4 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold tracking-[0.15em] uppercase rounded-none transition flex items-center justify-center gap-2 text-xs cursor-pointer border-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D44D2B]" />
                  Synthesizing abstracts...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D44D2B]" />
                  Generate Summary
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-none text-xs tracking-wider uppercase font-bold">
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
          {/* Main Summary Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-8 md:p-10 rounded-none space-y-6">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-white/10 pb-4">
              <h3 className="text-xl font-serif text-[#1A1A1A] dark:text-white italic flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D44D2B]" />
                {style} Abstract
              </h3>
              <button
                onClick={() => setData(null)}
                className="text-[10px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/5 px-3 py-1.5 rounded-none border border-[#D44D2B]/25 hover:bg-[#D44D2B]/10 transition"
              >
                Summarize New Notes
              </button>
            </div>

            <div className="prose dark:prose-invert max-w-none text-[#1A1A1A]/90 dark:text-[#E5E3DC]/90 font-body-serif text-sm md:text-base leading-relaxed">
              <MarkdownRenderer content={data.summary} />
            </div>
          </div>

          {/* Right Sidebar: Takeaways & Glossary */}
          <div className="space-y-6">
            {/* Key Takeaways */}
            <div className="bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-[#1A1A1A] dark:text-white mb-4 flex items-center gap-2 border-b border-[#1A1A1A]/5 pb-2">
                <CheckCircle2 className="w-4 h-4 text-[#D44D2B]" />
                Key Takeaways
              </h4>
              <ul className="space-y-4">
                {data.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs font-serif leading-relaxed text-[#1A1A1A]/80 dark:text-[#E5E3DC]/85">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D44D2B] mt-1.5 flex-shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Glossary definitions */}
            <div className="bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-4">
              <div>
                <h4 className="text-[11px] font-bold tracking-widest uppercase text-[#1A1A1A] dark:text-white">Active Glossary</h4>
                <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 tracking-wider mt-1">
                  Key terms and technical jargon extracted
                </p>
              </div>

              {data.glossary.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search glossary..."
                    className="w-full p-2.5 pl-9 border border-[#1A1A1A]/10 dark:border-white/10 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder-gray-450 focus:outline-none focus:border-[#D44D2B] text-xs transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredGlossary.length > 0 ? (
                  filteredGlossary.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#FAF9F6] dark:bg-[#1E1C1A] rounded-none border border-[#1A1A1A]/5 dark:border-white/5">
                      <h5 className="font-bold text-[#1A1A1A] dark:text-white text-xs leading-tight tracking-wide uppercase">
                        {item.term}
                      </h5>
                      <p className="text-[#1A1A1A]/70 dark:text-[#E5E3DC]/70 font-serif italic text-xs mt-2 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] uppercase text-gray-400 text-center py-4 tracking-wider">
                    {data.glossary.length === 0 ? "No specific terms defined." : "No terms match search criteria."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
