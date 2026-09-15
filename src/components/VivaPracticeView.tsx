import { useState, FormEvent } from "react";
import { VivaData, VivaQuestion } from "../types";
import { Mic, CheckCircle2, AlertCircle, Sparkles, Loader2, Play, Eye, RotateCcw, ThumbsUp, Key } from "lucide-react";
import { recordStudySession } from "../utils/analytics";

export default function VivaPracticeView() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VivaData | null>(null);

  // Practice execution states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !notes.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCurrentIndex(0);
    setUserAnswer("");
    setIsEvaluated(false);
    setSessionScore(0);

    try {
      const response = await fetch("/api/study/viva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes, count }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate viva questions.");
      }

      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = () => {
    if (!userAnswer.trim() || !currentQuestion) return;
    setIsEvaluated(true);
    
    const matchedCount = evaluateKeywords(userAnswer, currentQuestion.keywordsRequired).matched.length;
    const nextScore = sessionScore + matchedCount;
    setSessionScore(nextScore);

    // If it's the last question, we've finished the exam session! Log it to analytics.
    if (currentIndex === totalQuestions - 1) {
      const activeTopic = topic.trim() || "Notes Oral Exam";
      const totalKeywords = data!.questions.reduce((sum, q) => sum + q.keywordsRequired.length, 0);
      recordStudySession("viva", activeTopic, { score: nextScore, total: totalKeywords });
    }
  };

  const handleNext = () => {
    if (!data) return;
    setCurrentIndex(prev => prev + 1);
    setUserAnswer("");
    setIsEvaluated(false);
  };

  const currentQuestion = data?.questions[currentIndex];
  const totalQuestions = data?.questions.length || 0;

  // Simple keyword matching evaluation
  const evaluateKeywords = (answer: string, keywords: string[]) => {
    const matched: string[] = [];
    const missed: string[] = [];
    
    const normalizedAnswer = answer.toLowerCase();
    keywords.forEach(kw => {
      if (normalizedAnswer.includes(kw.toLowerCase())) {
        matched.push(kw);
      } else {
        missed.push(kw);
      }
    });

    return { matched, missed };
  };

  const keywordResults = currentQuestion 
    ? evaluateKeywords(userAnswer, currentQuestion.keywordsRequired)
    : { matched: [], missed: [] };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6">
        <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
          Oral Exams
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
          <Mic className="w-8 h-8 text-[#D44D2B]" />
          Viva Voce Practice
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
          PREPARE FOR RIGOROUS ORAL EXAMINATIONS, BOARD REVIEWS, AND TECHNICAL STANDING COMMITTEES
        </p>
      </div>

      {!data && !loading && (
        <form onSubmit={handleGenerate} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Oral Exam Topic / Target Subject
              </label>
              <input
                type="text"
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] text-xs transition"
                placeholder="e.g., Immunology, Operating Systems Kernel, Civil Procedure..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required={!notes.trim()}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Question Count
              </label>
              <select
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
              Oral Focus Materials / Lecture Notes (Optional)
            </label>
            <textarea
              className="w-full h-40 p-4 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] transition resize-y font-body-serif text-sm leading-relaxed"
              placeholder="Paste specific transcripts, guides, or textbook chapters. Leaving blank generates general technical examiner queries..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="p-4 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold tracking-[0.15em] uppercase rounded-none transition flex items-center justify-center gap-2 text-xs cursor-pointer border-none w-full md:w-auto px-8"
          >
            <Sparkles className="w-4 h-4 text-[#D44D2B]" />
            Enter Viva Exam Room
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
          <p className="text-[#1A1A1A] dark:text-white font-serif italic text-lg">Examiner is formulating questions...</p>
          <p className="text-gray-400 text-xs tracking-widest uppercase font-bold">Generating deep questions, ideal model answers, and technical terminology triggers.</p>
        </div>
      )}

      {data && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* Active Question & Input Terminal */}
          <div className="lg:col-span-3 bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-8 rounded-none space-y-6">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-white/10 pb-4">
              <div>
                <span className={`text-[9px] font-bold px-2.5 py-1 rounded-none uppercase tracking-widest ${currentQuestion.difficulty === 'Easy' ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : currentQuestion.difficulty === 'Hard' ? 'bg-rose-500/5 text-rose-600 dark:text-rose-400 border border-rose-500/20' : 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border border-amber-500/20'}`}>
                  {currentQuestion.difficulty} Question
                </span>
                <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-3">
                  Examiner Prompt {currentIndex + 1} of {totalQuestions}
                </h3>
              </div>
              <button
                onClick={() => setData(null)}
                className="text-[10px] tracking-widest uppercase font-bold text-gray-500 hover:text-[#D44D2B] flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Exit Exam Room
              </button>
            </div>

            {/* Examiner Question Speech block */}
            <div className="p-6 bg-[#FAF9F6] dark:bg-[#1E1C1A] border-l-2 border-[#D44D2B] rounded-none">
              <p className="text-[#1A1A1A] dark:text-white font-serif text-base md:text-lg leading-relaxed italic">
                "{currentQuestion.question}"
              </p>
            </div>

            {/* User Speech Rehearsal terminal */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-[#1A1A1A]/60 dark:text-white/60 tracking-wider">
                Speak / Rehearse Your Answer Below
              </label>
              <textarea
                className="w-full h-44 p-4 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder-[#1A1A1A]/30 dark:placeholder-white/30 focus:outline-none focus:border-[#D44D2B] transition resize-y font-body-serif text-sm leading-relaxed"
                placeholder="Type your spoken answer outline here... Note key theories or facts you would say out loud to the examiner."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isEvaluated}
              />
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-3 pt-1 border-t border-[#1A1A1A]/10 dark:border-white/10 pt-4">
              {!isEvaluated ? (
                <button
                  onClick={handleEvaluate}
                  disabled={!userAnswer.trim()}
                  className="px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold rounded-none text-xs tracking-widest uppercase flex items-center gap-2 transition cursor-pointer border-none"
                >
                  <Play className="w-4 h-4 fill-white text-[#D44D2B]" />
                  Evaluate Oral Answer
                </button>
              ) : (
                currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold rounded-none text-xs tracking-widest uppercase flex items-center gap-2 transition cursor-pointer border-none"
                  >
                    Next Question
                  </button>
                ) : (
                  <div className="text-[10px] tracking-widest uppercase font-bold text-emerald-600 bg-emerald-500/5 border border-emerald-500/25 px-4 py-3 rounded-none">
                    ✓ Oral Examination Completed!
                  </div>
                )
              )}
            </div>
          </div>

          {/* Side Evaluation & Model Answer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Keyword grading Analysis */}
            <div className="bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white tracking-widest uppercase flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#D44D2B]" />
                  Keyword Checklist
                </h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                  EXAMINERS LOOK FOR THESE SPECIFIC TERMINOLOGY TRIGGERS ON TOPIC MARKING CRITERIAS
                </p>
              </div>

              <div className="space-y-2">
                {currentQuestion.keywordsRequired.map((kw, idx) => {
                  const isMatched = isEvaluated && keywordResults.matched.includes(kw);
                  
                  let itemStyle = "bg-[#FAF9F6] dark:bg-[#1E1C1A] border-[#1A1A1A]/5 text-gray-400 dark:text-gray-500";
                  if (isEvaluated) {
                    itemStyle = isMatched 
                      ? "bg-emerald-500/5 border-emerald-600/30 text-emerald-800 dark:text-emerald-400 font-bold"
                      : "bg-rose-500/5 border-rose-600/30 text-rose-800 dark:text-rose-400";
                  }

                  return (
                    <div 
                      key={idx} 
                      className={`p-3 border rounded-none flex items-center justify-between text-xs tracking-wide transition ${itemStyle}`}
                    >
                      <span>{kw}</span>
                      {isEvaluated && (
                        isMatched 
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          : <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {isEvaluated && (
                <div className="pt-3 border-t border-[#1A1A1A]/10 dark:border-white/10">
                  <div className="text-[10px] tracking-widest uppercase text-gray-500 font-bold">
                    Keyword Hit Rate:
                  </div>
                  <div className="text-2xl font-serif text-[#1A1A1A] dark:text-white mt-1 flex items-baseline gap-1">
                    {keywordResults.matched.length} <span className="text-xs text-gray-400">/ {currentQuestion.keywordsRequired.length} match</span>
                  </div>
                </div>
              )}
            </div>

            {/* Model Answer disclosure panel */}
            {isEvaluated && (
              <div className="bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-3">
                <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white tracking-widest uppercase flex items-center gap-1.5 border-b border-[#1A1A1A]/10 dark:border-white/10 pb-2">
                  <ThumbsUp className="w-4 h-4 text-[#D44D2B]" />
                  Ideal Model Answer Verbalization
                </h4>
                <p className="text-xs text-[#1A1A1A]/85 dark:text-[#E5E3DC]/85 leading-relaxed font-body-serif italic">
                  "{currentQuestion.modelAnswer}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
