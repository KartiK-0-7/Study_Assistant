import { useState, FormEvent } from "react";
import { RevisionPlanData } from "../types";
import { Calendar, CheckSquare, Clock, Sparkles, Loader2, RotateCcw, Compass, ArrowRight, BarChart } from "lucide-react";
import { recordStudySession, updateLastSessionDetails } from "../utils/analytics";

export default function RevisionPlanView() {
  const [subject, setSubject] = useState("");
  const [daysLeft, setDaysLeft] = useState(7);
  const [dailyHours, setDailyHours] = useState(3);
  const [currentLevel, setCurrentLevel] = useState("Intermediate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RevisionPlanData | null>(null);

  // Studying / checklist states
  // Key format: "day-X-task-Y" -> boolean
  const [completedTasks, setCompletedTasks] = useState<{ [key: string]: boolean }>({});

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCompletedTasks({});

    try {
      const response = await fetch("/api/study/revision-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, daysLeft, dailyHours, currentLevel }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate revision plan.");
      }

      const resData = await response.json();
      setData(resData);
      
      let totalTasks = 0;
      resData.weeks.forEach((w: any) => w.days.forEach((d: any) => totalTasks += d.tasks.length));
      recordStudySession("revision", subject, { tasksCompleted: 0, tasksTotal: totalTasks });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (dayNum: number, taskIdx: number) => {
    const key = `day-${dayNum}-task-${taskIdx}`;
    setCompletedTasks(prev => {
      const updated = {
        ...prev,
        [key]: !prev[key]
      };
      
      let completedCount = 0;
      let totalTasksCount = 0;
      data?.weeks.forEach(week => {
        week.days.forEach(day => {
          day.tasks.forEach((_, idx) => {
            totalTasksCount++;
            const tKey = `day-${day.dayNumber}-task-${idx}`;
            if (updated[tKey]) {
              completedCount++;
            }
          });
        });
      });
      
      updateLastSessionDetails("revision", subject, { tasksCompleted: completedCount, tasksTotal: totalTasksCount });
      return updated;
    });
  };

  // Helper to count completed/total tasks
  const getProgressStats = () => {
    if (!data) return { total: 0, completed: 0, percentage: 0 };
    
    let total = 0;
    let completed = 0;

    data.weeks.forEach(week => {
      week.days.forEach(day => {
        day.tasks.forEach((_, idx) => {
          total++;
          const key = `day-${day.dayNumber}-task-${idx}`;
          if (completedTasks[key]) {
            completed++;
          }
        });
      });
    });

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const stats = getProgressStats();

  return (
    <div className="space-y-8">
      <div className="border-b border-[#1A1A1A]/10 dark:border-white/10 pb-6">
        <div className="inline-block bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[9px] px-2.5 py-1 mb-4 tracking-[0.2em] uppercase font-bold">
          Syllabus Pacing
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A] dark:text-white leading-tight flex items-center gap-3">
          <Calendar className="w-8 h-8 text-[#D44D2B]" />
          Revision Planner
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs tracking-wide uppercase mt-2">
          CONSTRUCT DAILY TASK MATRIX ROADMAPS TO OPTIMIZE STUDYING LEADING UP TO RIGOROUS TESTING TIMEFRMES
        </p>
      </div>

      {!data && !loading && (
        <form onSubmit={handleGenerate} className="space-y-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                Exam Subject / Domain
              </label>
              <input
                type="text"
                className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white placeholder:text-[#1A1A1A]/30 dark:placeholder:text-white/30 focus:outline-none focus:border-[#D44D2B] text-xs transition"
                placeholder="e.g., AP Calculus BC, MCAT Biology, Bar Examination..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                  Days Left
                </label>
                <input
                  type="number"
                  min={2}
                  max={90}
                  className="w-full p-3 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs transition"
                  value={daysLeft}
                  onChange={(e) => setDaysLeft(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2" title="Hours/Day">
                  Hours/Day
                </label>
                <select
                  className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                >
                  <option value={1}>1 hr/d</option>
                  <option value={2}>2 hrs/d</option>
                  <option value={3}>3 hrs/d</option>
                  <option value={4}>4 hrs/d</option>
                  <option value={6}>6 hrs/d</option>
                  <option value={8}>8 hrs/d</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-[#1A1A1A]/60 dark:text-white/60 mb-2">
                  Confidence
                </label>
                <select
                  className="w-full p-3.5 border border-[#1A1A1A]/15 dark:border-white/15 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] text-[#1A1A1A] dark:text-white focus:outline-none focus:border-[#D44D2B] text-xs tracking-wider uppercase font-bold transition"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="p-4 bg-[#1A1A1A] hover:bg-[#333] dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white font-bold tracking-[0.15em] uppercase rounded-none transition flex items-center justify-center gap-2 text-xs cursor-pointer border-none w-full md:w-auto px-8"
          >
            <Sparkles className="w-4 h-4 text-[#D44D2B]" />
            Create Revision Calendar
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
          <p className="text-[#1A1A1A] dark:text-white font-serif italic text-lg">Assembling your course curriculum...</p>
          <p className="text-gray-400 text-xs tracking-widest uppercase font-bold">Pacing subjects chronologically based on your daily bandwidth and exams left.</p>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Main Revision Calendar Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-8 rounded-none space-y-6">
              
              <div className="flex justify-between items-start border-b border-[#1A1A1A]/10 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-serif text-[#1A1A1A] dark:text-white">
                    {data.title}
                  </h3>
                  <p className="text-[10px] text-gray-500 tracking-wider uppercase font-bold mt-1">
                    Custom-paced syllabus roadmap
                  </p>
                </div>
                <button
                  onClick={() => setData(null)}
                  className="text-[10px] font-bold tracking-widest uppercase text-[#D44D2B] bg-[#D44D2B]/5 px-3.5 py-1.5 rounded-none border border-[#D44D2B]/25 hover:bg-[#D44D2B]/10 transition"
                >
                  Generate New Plan
                </button>
              </div>

              {/* Day-by-day blocks grouped by weeks */}
              <div className="space-y-6">
                {data.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="space-y-4">
                    <h4 className="text-[10px] tracking-widest uppercase font-bold text-[#D44D2B] bg-[#D44D2B]/5 px-3 py-1.5 border border-[#D44D2B]/15 inline-block rounded-none">
                      Week {week.weekNumber} Focus: {week.focus}
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      {week.days.map((day, dIdx) => (
                        <div 
                          key={dIdx} 
                          className="border border-[#1A1A1A]/10 dark:border-white/10 rounded-none bg-[#FAF9F6] dark:bg-[#1E1C1A] p-5 space-y-4"
                        >
                          <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 dark:border-white/10 pb-2">
                            <span className="font-bold text-[10px] tracking-wider text-[#1A1A1A] dark:text-white flex items-center gap-1.5 uppercase">
                              <Calendar className="w-3.5 h-3.5 text-[#D44D2B]" />
                              Day {day.dayNumber}
                            </span>
                            <span className="text-[10px] tracking-wider font-bold text-gray-500 flex items-center gap-1 uppercase">
                              <Clock className="w-3 h-3" />
                              {day.estimatedMinutes} mins
                            </span>
                          </div>

                          <div>
                            <h5 className="font-serif italic text-[#1A1A1A] dark:text-white text-base">
                              {day.topic}
                            </h5>
                          </div>

                          {/* Actionable checkbox checklist */}
                          <div className="space-y-2 pt-1">
                            {day.tasks.map((task, tIdx) => {
                              const isChecked = completedTasks[`day-${day.dayNumber}-task-${tIdx}`];
                              return (
                                <label 
                                  key={tIdx} 
                                  className={`flex items-start gap-3 p-3 rounded-none border text-xs tracking-wide cursor-pointer select-none transition ${isChecked ? 'bg-emerald-500/5 border-emerald-500/20 text-gray-400 line-through dark:text-gray-600' : 'bg-white dark:bg-[#1C1A19] border-[#1A1A1A]/5 dark:border-white/5 text-[#1A1A1A] dark:text-[#E5E3DC]'}`}
                                >
                                  <input 
                                    type="checkbox"
                                    className="rounded-none border-[#1A1A1A]/15 text-[#D44D2B] focus:ring-[#D44D2B] mt-0.5 h-3.5 w-3.5"
                                    checked={!!isChecked}
                                    onChange={() => toggleTask(day.dayNumber, tIdx)}
                                  />
                                  <span>{task}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Info & Progress */}
          <div className="space-y-6">
            
            {/* Real-time Revision Progress tracker */}
            <div className="bg-white dark:bg-[#1C1A19] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-4">
              <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white tracking-widest uppercase flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-[#D44D2B]" />
                Revision Velocity
              </h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed">
                CHECK OFF TASKS TO ADVANCE YOUR DAILY PROGRESS MASTERYSCORE
              </p>

              <div className="py-2 space-y-2">
                <div className="flex justify-between text-[10px] tracking-wider uppercase font-bold text-gray-500">
                  <span>Completed Tasks</span>
                  <span className="text-[#D44D2B] font-bold">{stats.completed} / {stats.total}</span>
                </div>
                {/* Progress bar line */}
                <div className="w-full bg-[#FAF9F6] dark:bg-[#1E1C1A] h-2 rounded-none overflow-hidden border border-[#1A1A1A]/10 dark:border-white/10">
                  <div 
                    className="bg-[#D44D2B] h-full transition-all duration-300" 
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <div className="text-[9px] tracking-widest uppercase text-right text-gray-400 font-bold">
                  {stats.percentage}% complete
                </div>
              </div>
            </div>

            {/* General Strategic Strategy box */}
            <div className="bg-[#FAF9F6] dark:bg-[#1E1C1A] border border-[#1A1A1A]/10 dark:border-white/10 p-6 rounded-none space-y-4">
              <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white tracking-widest uppercase flex items-center gap-1.5 border-b border-[#1A1A1A]/10 dark:border-white/10 pb-2">
                <Compass className="w-4 h-4 text-[#D44D2B]" />
                Preparation Guidelines
              </h4>
              <p className="text-[#1A1A1A]/85 dark:text-[#E5E3DC]/85 text-xs font-serif leading-relaxed italic">
                {data.overview}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
