import { useState, FormEvent } from "react";
import { FlashcardData, Flashcard } from "../types";
import { Copy, RefreshCw, Eye, EyeOff, CheckCircle, ArrowLeft, ArrowRight, RotateCcw, Loader2, Sparkles } from "lucide-react";
import { recordStudySession, updateLastSessionDetails } from "../utils/analytics";

export default function FlashcardsView() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FlashcardData | null>(null);

  // Studying states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [masteredCards, setMasteredCards] = useState<{ [key: string]: boolean }>({});

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !notes.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setMasteredCards({});

    try {
      const response = await fetch("/api/study/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes, count }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate flashcards.");
      }

      const resData = await response.json();
      setData(resData);
      
      const activeTopic = topic.trim() || "Notes Flashcards";
      recordStudySession("flashcards", activeTopic, { mastered: 0, total: resData.flashcards.length });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
    setShowHint(false); // Reset hint on flip
  };

  const handleNext = () => {
    if (!data) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % data.flashcards.length);
  };

  const handlePrev = () => {
    if (!data) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(prev => (prev - 1 + data.flashcards.length) % data.flashcards.length);
  };

  const toggleMastered = (id: string) => {
    setMasteredCards(prev => {
      const updated = {
        ...prev,
        [id]: !prev[id]
      };
      const activeTopic = topic.trim() || "Notes Flashcards";
      const masteredCount = Object.values(updated).filter(Boolean).length;
      updateLastSessionDetails("flashcards", activeTopic, { mastered: masteredCount, total: totalCards });
      return updated;
    });
  };

  const currentCard = data?.flashcards[currentIndex];
  const totalCards = data?.flashcards.length || 0;
  const masteredCount = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6">
        <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
          Active Recall
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
          <Copy className="w-8 h-8 text-[#D44D2B]" />
          Recall Flashcards
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
          ENGAGE ACTIVE RECALL DECKS TO DEPOSIT FACTS DIRECTLY INTO LONG TERM MEMORY
        </p>
      </div>

      {!data && !loading && (
        <form onSubmit={handleGenerate} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Card Deck Topic
              </label>
              <input
                type="text"
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] text-xs transition"
                placeholder="e.g., Medical Terminology, JavaScript Closures, Spanish Vocab..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required={!notes.trim()}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Card Count
              </label>
              <select
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                <option value={5}>5 Flashcards</option>
                <option value={8}>8 Flashcards</option>
                <option value={12}>12 Flashcards</option>
                <option value={16}>16 Flashcards</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
              Generate from specific Notes (Optional)
            </label>
            <textarea
              className="w-full h-40 p-4 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] transition resize-y font-body-serif text-sm leading-relaxed"
              placeholder="Paste lecture logs, cheat sheets, or articles. Leave blank to generate general questions on the Topic specified above..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="p-4 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold tracking-[0.15em] uppercase rounded-none transition flex items-center justify-center gap-2 text-xs cursor-pointer border-none w-full md:w-auto px-8"
          >
            <Sparkles className="w-4 h-4 text-[#D44D2B]" />
            Generate Flashcard Deck
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
          <p className="text-[#1A1A1A] dark:text-white font-serif italic text-lg">Writing double-sided cards...</p>
          <p className="text-gray-400 text-xs tracking-widest uppercase font-bold">Formulating conceptual definitions, formulas, and mnemonic hints.</p>
        </div>
      )}

      {data && currentCard && (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Deck statistics */}
          <div className="flex items-center justify-between px-2 text-[10px] tracking-widest uppercase text-gray-500 font-bold">
            <span>
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#D44D2B]" />
              Progress: <span className="text-[#D44D2B] font-bold">{masteredCount}</span> / {totalCards} Mastered
            </span>
          </div>

          {/* Flashcard Box with Flip animation */}
          <div 
            onClick={handleFlip}
            className={`w-full h-80 relative cursor-pointer group [perspective:1000px] select-none`}
          >
            <div className={`w-full h-full rounded-none border border-[#1A1A1A]/15 dark:border-white/15 p-8 flex flex-col justify-between items-center text-center bg-[#FAF9F6] dark:bg-[#1E1C1A] transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>
              
              {/* Front side content */}
              <div className={`absolute inset-0 p-8 flex flex-col justify-between items-center text-center bg-[#FAF9F6] dark:bg-[#1E1C1A] rounded-none [backface-visibility:hidden] ${isFlipped ? "pointer-events-none opacity-0" : "opacity-100"}`}>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D44D2B]">
                  Concept / Question
                </div>
                
                <div className="text-xl md:text-2xl font-serif italic text-[#1A1A1A] dark:text-white px-4 leading-relaxed my-auto">
                  "{currentCard.front}"
                </div>

                <div className="text-[10px] text-gray-400 tracking-widest uppercase flex items-center gap-1.5 hover:text-gray-500 font-bold">
                  <RefreshCw className="w-3 h-3 animate-spin text-[#D44D2B]" style={{ animationDuration: '3s' }} />
                  Click to Flip Card
                </div>
              </div>

              {/* Back side content */}
              <div className={`absolute inset-0 p-8 flex flex-col justify-between items-center text-center bg-[#FAF9F6] dark:bg-[#1E1C1A] rounded-none [backface-visibility:hidden] [transform:rotateY(180deg)] ${!isFlipped ? "pointer-events-none opacity-0" : "opacity-100"}`}>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-emerald-600">
                  Explanation / Answer
                </div>

                <div className="text-sm md:text-base font-body-serif text-[#1A1A1A]/90 dark:text-[#E5E3DC]/90 px-4 leading-relaxed my-auto">
                  {currentCard.back}
                </div>

                <div className="text-[10px] text-gray-400 tracking-widest uppercase flex items-center gap-1.5 hover:text-gray-500 font-bold">
                  <RefreshCw className="w-3 h-3 text-[#D44D2B]" />
                  Click to Flip Back
                </div>
              </div>
            </div>
          </div>

          {/* Hint disclosure block */}
          {currentCard.hint && !isFlipped && (
            <div className="text-center">
              {showHint ? (
                <div className="p-4 bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 text-xs font-serif italic text-[#1A1A1A]/80 dark:text-[#E5E3DC]/80 max-w-sm mx-auto">
                  <span className="font-bold uppercase tracking-wider text-[#D44D2B] block text-[9px] mb-1">Mnemonic hint</span> {currentCard.hint}
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHint(true);
                  }}
                  className="text-[10px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/5 px-3.5 py-1.5 rounded-none border border-[#D44D2B]/25 hover:bg-[#D44D2B]/10 transition"
                >
                  Need a Hint?
                </button>
              )}
            </div>
          )}

          {/* Navigation and state buttons */}
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="p-3 rounded-none border border-[#1A1A1A]/10 dark:border-white/10 bg-white dark:bg-[#1C1A19] text-[#1A1A1A] dark:text-[#E5E3DC] hover:bg-[#FAF9F6] transition cursor-pointer"
                title="Previous Card"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-none border border-[#1A1A1A]/10 dark:border-white/10 bg-white dark:bg-[#1C1A19] text-[#1A1A1A] dark:text-[#E5E3DC] hover:bg-[#FAF9F6] transition cursor-pointer"
                title="Next Card"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleMastered(currentCard.id)}
                className={`px-5 py-3 rounded-none text-[10px] font-bold tracking-widest uppercase border transition cursor-pointer ${masteredCards[currentCard.id] ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-750" : "bg-white dark:bg-[#1C1A19] border-[#1A1A1A]/10 dark:border-white/10 text-[#1A1A1A] dark:text-white hover:bg-[#FAF9F6]"}`}
              >
                {masteredCards[currentCard.id] ? "✓ Mastered" : "Mark as Mastered"}
              </button>
              <button
                onClick={() => {
                  setData(null);
                }}
                className="px-5 py-3 rounded-none text-[10px] font-bold tracking-widest uppercase border border-[#1A1A1A]/15 dark:border-white/15 bg-white dark:bg-[#1C1A19] text-[#1A1A1A]/60 dark:text-[#E5E3DC]/60 hover:text-[#1A1A1A] hover:bg-[#FAF9F6] transition cursor-pointer"
              >
                New Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
