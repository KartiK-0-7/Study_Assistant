import { StudyMode } from "../types";

export interface StudySession {
  id: string;
  timestamp: number; // millisecond timestamp
  mode: StudyMode;
  topic: string;
  details?: {
    score?: number;      // e.g. MCQ score or Viva keywords
    total?: number;      // e.g. Total MCQ count or Total keywords
    mastered?: number;   // e.g. Flashcards mastered
    level?: string;      // e.g. MCQ difficulty or Revision Level
    tasksCompleted?: number;
    tasksTotal?: number;
  };
}

// Key for local storage
const LOCAL_STORAGE_KEY = "study_copilot_analytics_sessions_v1";

// Beautiful, highly realistic initial mock data so the senior UI/UX dashboard shines immediately
const INITIAL_MOCK_SESSIONS: StudySession[] = [
  {
    id: "mock-1",
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    mode: "summarize",
    topic: "Origins of WWI & European Alliances",
    details: { level: "Standard Study Guide" }
  },
  {
    id: "mock-2",
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    mode: "mcqs",
    topic: "Organic Chemistry: Nucleophilic Substitution",
    details: { score: 4, total: 5, level: "Medium" }
  },
  {
    id: "mock-3",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    mode: "flashcards",
    topic: "ATP Synthase & Mitochondrial Transport",
    details: { mastered: 7, total: 8 }
  },
  {
    id: "mock-4",
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    mode: "viva",
    topic: "Cellular Mitosis & Checkpoint Kinases",
    details: { score: 4, total: 5 }
  },
  {
    id: "mock-5",
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    mode: "revision",
    topic: "AP Calculus BC Integration",
    details: { tasksCompleted: 14, tasksTotal: 18 }
  },
  {
    id: "mock-6",
    timestamp: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
    mode: "presentation",
    topic: "CRISPR-Cas9 Gene Editing Therapeutics",
    details: { total: 6 } // 6 slides
  }
];

/**
 * Safely fetches sessions from local storage.
 * If empty, initializes with mock data so the UI displays premium populated stats.
 */
export function getStudySessions(): StudySession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      // Set initial mock data so they see the dashboard instantly
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SESSIONS));
      return INITIAL_MOCK_SESSIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse study sessions:", err);
    return INITIAL_MOCK_SESSIONS;
  }
}

/**
 * Saves a list of study sessions to local storage
 */
export function saveStudySessions(sessions: StudySession[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error("Failed to save study sessions:", err);
  }
}

/**
 * Records a single study session event.
 * Avoids duplicate events within 5 seconds for the same topic & mode to prevent double logging.
 */
export function recordStudySession(mode: StudyMode, topic: string, details?: StudySession["details"]): void {
  if (!topic || topic.trim() === "") return;
  const sessions = getStudySessions();

  // Deduplicate triggers that might fire in quick succession
  const fiveSecondsAgo = Date.now() - 5000;
  const isDuplicate = sessions.some(s => 
    s.mode === mode && 
    s.topic.toLowerCase() === topic.trim().toLowerCase() && 
    s.timestamp > fiveSecondsAgo
  );

  if (isDuplicate) return;

  const newSession: StudySession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    mode,
    topic: topic.trim(),
    details
  };

  saveStudySessions([newSession, ...sessions]);
}

/**
 * Updates an existing study session if needed (e.g. updating task completion or flashcard mastering score)
 */
export function updateLastSessionDetails(mode: StudyMode, topic: string, details: StudySession["details"]): void {
  const sessions = getStudySessions();
  // Find most recent matching session within 30 minutes
  const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
  const idx = sessions.findIndex(s => 
    s.mode === mode && 
    s.topic.toLowerCase() === topic.toLowerCase() && 
    s.timestamp > thirtyMinsAgo
  );

  if (idx !== -1) {
    sessions[idx].details = {
      ...sessions[idx].details,
      ...details
    };
    saveStudySessions(sessions);
  } else {
    // If none exists, log a new one
    recordStudySession(mode, topic, details);
  }
}

/**
 * Reset local storage to remove mock data and start with an empty state
 */
export function resetStudySessionsToEmpty(): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  } catch (err) {
    console.error("Failed to clear sessions:", err);
  }
}

/**
 * Restore original preset mock data for showcase purposes
 */
export function restoreMockSessions(): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SESSIONS));
  } catch (err) {
    console.error("Failed to restore mock sessions:", err);
  }
}

export interface AnalyticsStats {
  totalSessions: number;
  totalTopics: number;
  streakDays: number;
  mcqAccuracy: number; // percentage
  flashcardsMasteredRatio: number; // percentage
  vivaKeywordHitRatio: number; // percentage
  revisionTaskProgress: number; // percentage
  modeCounts: Record<StudyMode, number>;
  topicCompletion: {
    name: string;
    lastStudied: number;
    modesUsed: StudyMode[];
    status: "Mastered" | "In Progress" | "Reviewed";
    sessionsCount: number;
  }[];
  weeklyActivity: { dayName: string; count: number }[]; // 7 days of activity starting from Monday
}

/**
 * Computes deep analytic indicators from session records
 */
export function calculateAnalyticsStats(): AnalyticsStats {
  const sessions = getStudySessions();
  
  // 1. Basic counts
  const totalSessions = sessions.length;
  
  const uniqueTopicsSet = new Set(sessions.map(s => s.topic.toLowerCase()));
  const totalTopics = uniqueTopicsSet.size;

  // 2. Mode Distribution counts
  const modeCounts: Record<StudyMode, number> = {
    dashboard: 0,
    summarize: 0,
    explain: 0,
    mcqs: 0,
    flashcards: 0,
    viva: 0,
    revision: 0,
    presentation: 0
  };
  
  sessions.forEach(s => {
    if (s.mode in modeCounts) {
      modeCounts[s.mode]++;
    }
  });

  // 3. Streak Calculation
  // Extract all unique dates (YYYY-MM-DD local time) of studies
  const studyDates = Array.from(new Set(
    sessions.map(s => {
      const d = new Date(s.timestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  )).sort((a, b) => b.localeCompare(a)); // sorted descending (newest first)

  let streakDays = 0;
  if (studyDates.length > 0) {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    // Streak is active if user studied today or yesterday
    if (studyDates[0] === todayStr || studyDates[0] === yesterdayStr) {
      streakDays = 1;
      let lastDate = new Date(studyDates[0]);
      
      for (let i = 1; i < studyDates.length; i++) {
        const currentDate = new Date(studyDates[i]);
        const diffTime = Math.abs(lastDate.getTime() - currentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streakDays++;
          lastDate = currentDate;
        } else if (diffDays > 1) {
          break; // streak broken
        }
      }
    }
  }

  // 4. MCQ Accuracy Rate
  let mcqCorrect = 0;
  let mcqTotal = 0;
  sessions.filter(s => s.mode === "mcqs" && s.details).forEach(s => {
    if (s.details?.score !== undefined && s.details?.total !== undefined) {
      mcqCorrect += s.details.score;
      mcqTotal += s.details.total;
    }
  });
  const mcqAccuracy = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 80; // default to a healthy 80 if no mcqs taken

  // 5. Flashcard Mastery Rate
  let fcMastered = 0;
  let fcTotal = 0;
  sessions.filter(s => s.mode === "flashcards" && s.details).forEach(s => {
    if (s.details?.mastered !== undefined && s.details?.total !== undefined) {
      fcMastered += s.details.mastered;
      fcTotal += s.details.total;
    }
  });
  const flashcardsMasteredRatio = fcTotal > 0 ? Math.round((fcMastered / fcTotal) * 100) : 85; // default to 85%

  // 6. Viva Keywords hit rate
  let vivaScore = 0;
  let vivaTotal = 0;
  sessions.filter(s => s.mode === "viva" && s.details).forEach(s => {
    if (s.details?.score !== undefined && s.details?.total !== undefined) {
      vivaScore += s.details.score;
      vivaTotal += s.details.total;
    }
  });
  const vivaKeywordHitRatio = vivaTotal > 0 ? Math.round((vivaScore / vivaTotal) * 100) : 75; // default to 75%

  // 7. Revision planner progress
  let revCompleted = 0;
  let revTotal = 0;
  sessions.filter(s => s.mode === "revision" && s.details).forEach(s => {
    if (s.details?.tasksCompleted !== undefined && s.details?.tasksTotal !== undefined) {
      revCompleted += s.details.tasksCompleted;
      revTotal += s.details.tasksTotal;
    }
  });
  const revisionTaskProgress = revTotal > 0 ? Math.round((revCompleted / revTotal) * 100) : 78; // default to 78%

  // 8. Weekly Study Density (7 days - Monday to Sunday count)
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyCounts = [0, 0, 0, 0, 0, 0, 0];
  
  sessions.forEach(s => {
    const d = new Date(s.timestamp);
    let dayIdx = d.getDay() - 1; // getDay() returns 0 for Sunday, 1 for Monday
    if (dayIdx === -1) dayIdx = 6; // map Sunday to index 6
    if (dayIdx >= 0 && dayIdx < 7) {
      weeklyCounts[dayIdx]++;
    }
  });

  const weeklyActivity = dayNames.map((name, index) => ({
    dayName: name,
    count: weeklyCounts[index]
  }));

  // 9. Topic completion cards
  const topicMap: Record<string, { lastStudied: number; modes: Set<StudyMode>; count: number; scoreSum: number; scoreCount: number }> = {};
  
  sessions.forEach(s => {
    const normalized = s.topic.trim();
    if (!normalized) return;
    
    if (!topicMap[normalized]) {
      topicMap[normalized] = {
        lastStudied: s.timestamp,
        modes: new Set<StudyMode>([s.mode]),
        count: 1,
        scoreSum: s.details?.score || s.details?.mastered || s.details?.tasksCompleted || 0,
        scoreCount: (s.details?.score !== undefined || s.details?.mastered !== undefined || s.details?.tasksCompleted !== undefined) ? 1 : 0
      };
    } else {
      topicMap[normalized].lastStudied = Math.max(topicMap[normalized].lastStudied, s.timestamp);
      topicMap[normalized].modes.add(s.mode);
      topicMap[normalized].count++;
      if (s.details?.score !== undefined) {
        topicMap[normalized].scoreSum += s.details.score;
        topicMap[normalized].scoreCount++;
      } else if (s.details?.mastered !== undefined) {
        topicMap[normalized].scoreSum += s.details.mastered;
        topicMap[normalized].scoreCount++;
      } else if (s.details?.tasksCompleted !== undefined) {
        topicMap[normalized].scoreSum += s.details.tasksCompleted;
        topicMap[normalized].scoreCount++;
      }
    }
  });

  const topicCompletion = Object.entries(topicMap).map(([name, data]) => {
    const modesUsed = Array.from(data.modes);
    
    // Status logic:
    // If they used multiple modes or achieved high scoring -> Mastered
    // If they studied it multiple times -> Reviewed
    // Else -> In Progress
    let status: "Mastered" | "In Progress" | "Reviewed" = "In Progress";
    if (modesUsed.length >= 3 || (data.scoreCount > 0 && (data.scoreSum / data.scoreCount) >= 4)) {
      status = "Mastered";
    } else if (data.count >= 2 || modesUsed.length >= 2) {
      status = "Reviewed";
    }

    return {
      name,
      lastStudied: data.lastStudied,
      modesUsed,
      status,
      sessionsCount: data.count
    };
  }).sort((a, b) => b.lastStudied - a.lastStudied); // newest studied topic first

  return {
    totalSessions,
    totalTopics,
    streakDays,
    mcqAccuracy,
    flashcardsMasteredRatio,
    vivaKeywordHitRatio,
    revisionTaskProgress,
    modeCounts,
    topicCompletion,
    weeklyActivity
  };
}
