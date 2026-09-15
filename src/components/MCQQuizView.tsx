import { useState, FormEvent } from "react";
import { MCQData, MCQQuestion } from "../types";
import { HelpCircle, Check, X, ArrowRight, RotateCcw, AlertCircle, Loader2, Sparkles, FileText, Award } from "lucide-react";
import { recordStudySession } from "../utils/analytics";

export default function MCQQuizView() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MCQData | null>(null);

  // Quiz execution states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() && !notes.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setIsSubmitted(false);
    setQuizFinished(false);

    try {
      const response = await fetch("/api/study/mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes, count, difficulty }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate MCQs.");
      }

      const resData = await response.json();
      setData(resData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return; // Prevent changing answer after submission
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleSubmitAnswer = () => {
    const selected = selectedAnswers[currentIndex];
    if (selected === undefined) return;

    setIsSubmitted(true);
    const correctIdx = data!.questions[currentIndex].correctAnswerIndex;
    if (selected === correctIdx) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < data!.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      const activeTopic = topic.trim() || "Notes Concept Quiz";
      recordStudySession("mcqs", activeTopic, { score: score, total: data!.questions.length, level: difficulty });
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const currentQuestion = data?.questions[currentIndex];
  const userSelection = selectedAnswers[currentIndex];

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6">
        <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
          Testing Suite
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-[#D44D2B]" />
          MCQ Quiz Generator
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
          EVALUATE YOUR GRASP OF TOPICS VIA ALIGNMENT EXAMS AND INTERACTIVE FEEDBACK LOOPS
        </p>
      </div>

      {!data && !loading && (
        <form onSubmit={handleGenerate} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Quiz Topic / Domain
              </label>
              <input
                type="text"
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] text-xs transition"
                placeholder="e.g., Organic Chemistry, Macroeconomics, TCP Handshake..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required={!notes.trim()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                  Difficulty
                </label>
                <select
                  className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                  Questions
                </label>
                <select
                  className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
              Generate directly from your Notes (Optional)
            </label>
            <textarea
              className="w-full h-40 p-4 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] transition resize-y font-body-serif text-sm leading-relaxed"
              placeholder="Paste specific textbook chapters or lecture notes here. If left blank, the quiz will test general knowledge about the Topic specified above..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="p-4 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold tracking-[0.15em] uppercase rounded-none transition flex items-center justify-center gap-2 text-xs cursor-pointer border-none w-full md:w-auto px-8"
          >
            <Sparkles className="w-4 h-4 text-[#D44D2B]" />
            Generate Smart Quiz
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
          <p className="text-[#1A1A1A] dark:text-white font-serif italic text-lg">Creating your personalized test suite...</p>
          <p className="text-gray-400 text-xs tracking-widest uppercase font-bold">Gemini AI is crafting comprehensive questions.</p>
        </div>
      )}

      {data && !quizFinished && currentQuestion && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-8 rounded-none space-y-6">
          {/* Header Progress Bar */}
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 dark:border-white/10 pb-4">
            <div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/5 px-2.5 py-1">
                {difficulty} Difficulty
              </span>
              <h3 className="text-lg font-serif text-[#1A1A1A] dark:text-white mt-3">
                Question {currentIndex + 1} of {data.questions.length}
              </h3>
            </div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
              Current Score: <span className="text-[#D44D2B] font-bold">{score}</span> / {currentIndex}
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-[#FCFAF7] dark:bg-[#121110] h-1.5 rounded-none overflow-hidden border border-[#1A1A1A]/10 dark:border-white/10">
            <div 
              className="bg-[#D44D2B] h-full transition-all duration-300" 
              style={{ width: `${((currentIndex) / data.questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="p-6 bg-[#FAF9F6] dark:bg-[#1E1C1A] rounded-none border border-[#1A1A1A]/5 dark:border-white/5">
            <p className="text-[#1A1A1A] dark:text-white font-serif italic leading-relaxed text-base md:text-lg">
              "{currentQuestion.question}"
            </p>
          </div>

          {/* Option Selection Buttons */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = userSelection === idx;
              const isCorrect = currentQuestion.correctAnswerIndex === idx;

              let buttonStyle = "border-[#1A1A1A]/10 dark:border-white/10 hover:bg-[#FAF9F6] dark:hover:bg-[#1E1C1A] bg-white dark:bg-[#1C1A19] text-[#1A1A1A] dark:text-[#E5E3DC]";
              let iconElement = null;

              if (isSubmitted) {
                if (isCorrect) {
                  // Highlight correct option in green
                  buttonStyle = "border-emerald-600 dark:border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-bold";
                  iconElement = <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />;
                } else if (isSelected) {
                  // Highlight user incorrect option in red
                  buttonStyle = "border-rose-600 dark:border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-900 dark:text-rose-300";
                  iconElement = <X className="w-4 h-4 text-rose-600 dark:text-rose-500 flex-shrink-0" />;
                } else {
                  buttonStyle = "border-[#1A1A1A]/5 dark:border-white/5 opacity-40 bg-white dark:bg-[#1C1A19] text-gray-400";
                }
              } else if (isSelected) {
                buttonStyle = "border-[#D44D2B] bg-[#D44D2B]/5 text-[#D44D2B] font-bold";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={isSubmitted}
                  className={`w-full p-4 border rounded-none flex items-center justify-between text-left text-xs tracking-wide transition focus:outline-none ${buttonStyle} cursor-pointer`}
                >
                  <div className="flex gap-4 items-center">
                    <span className={`w-5 h-5 rounded-none ${isSelected ? "bg-[#D44D2B] text-white" : "bg-[#1A1A1A]/5 dark:bg-white/5 text-[#1A1A1A] dark:text-white"} flex items-center justify-center font-bold text-[10px] flex-shrink-0`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {iconElement}
                </button>
              );
            })}
          </div>

          {/* Submit/Next Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setData(null);
              }}
              className="text-[10px] tracking-widest uppercase font-bold text-gray-500 hover:text-[#D44D2B] flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Abandon Quiz
            </button>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={userSelection === undefined}
                className="px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white font-bold rounded-none text-xs tracking-widest uppercase flex items-center gap-2 transition cursor-pointer border-none"
              >
                Submit Answer
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold rounded-none text-xs tracking-widest uppercase flex items-center gap-2 transition cursor-pointer border-none"
              >
                {currentIndex === data.questions.length - 1 ? "Finish Quiz" : "Next Question"}
                <ArrowRight className="w-4 h-4 text-[#D44D2B]" />
              </button>
            )}
          </div>

          {/* Explanation Callout */}
          {isSubmitted && (
            <div className="p-5 bg-[#FAF9F6] dark:bg-[#1E1C1A] border-l-2 border-[#D44D2B] rounded-none space-y-2">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-[#D44D2B] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#D44D2B]" />
                Explanation
              </h4>
              <p className="text-xs font-serif italic leading-relaxed text-[#1A1A1A]/85 dark:text-[#E5E3DC]/85">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quiz Finished Summary Report */}
      {quizFinished && data && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-10 rounded-none text-center space-y-6">
          <Award className="w-16 h-16 text-[#D44D2B] mx-auto bg-[#D44D2B]/5 p-3 rounded-none border border-[#D44D2B]/15" />
          
          <div>
            <h3 className="text-3xl font-serif text-[#1A1A1A] dark:text-white">Quiz Completed!</h3>
            <p className="text-gray-400 text-xs tracking-widest uppercase font-bold mt-2">Excellent effort in testing your comprehension.</p>
          </div>

          {/* Score Circle display */}
          <div className="py-4">
            <div className="inline-block p-8 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10">
              <div className="text-5xl font-serif text-[#1A1A1A] dark:text-white">
                {score} <span className="text-xl text-gray-400">/ {data.questions.length}</span>
              </div>
              <div className="text-[10px] tracking-widest uppercase text-gray-500 mt-2 font-bold">
                {Math.round((score / data.questions.length) * 100)}% Accuracy
              </div>
            </div>
          </div>

          {/* Feedback message */}
          <p className="text-sm font-serif italic text-gray-700 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
            {score === data.questions.length ? (
              "Perfect score! You have completely mastered this conceptual domain. Keep up the flawless work."
            ) : score >= data.questions.length * 0.7 ? (
              "Great job! You have a solid foundational grasp of this material. Review your few mistakes to reach perfection."
            ) : (
              "A good start! Review the explanation notes below and try again to reinforce your memory retention."
            )}
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <button
              onClick={restartQuiz}
              className="px-6 py-3.5 bg-[#FAF9F6] dark:bg-[#1E1C1A] hover:bg-gray-150 border border-[#1A1A1A]/15 dark:border-white/15 font-bold rounded-none text-xs tracking-widest uppercase transition cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-[#D44D2B]" />
              Retake Same Quiz
            </button>
            <button
              onClick={() => setData(null)}
              className="px-6 py-3.5 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold rounded-none text-xs tracking-widest uppercase transition cursor-pointer flex items-center gap-2 border-none"
            >
              <Sparkles className="w-4 h-4 text-[#D44D2B]" />
              Generate New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
