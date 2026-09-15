import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini client safely with API key
let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Help endpoint / Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 1. Summarize Notes Endpoint
app.post("/api/study/summarize", async (req, res) => {
  try {
    const { notes, style } = req.body;
    if (!notes) {
      return res.status(400).json({ error: "No notes provided to summarize." });
    }

    const client = getGeminiClient();
    const prompt = `You are an elite study helper. Please summarize the following student notes.
Format specified: ${style || "Standard Study Guide"}.
In the summary, include a deep markdown summary of concepts, bulleted key takeaways, and a glossary of terms.

Notes to summarize:
${notes}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Detailed summary of the notes in elegant markdown" },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 5 high-impact bulleted key takeaways"
            },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "Important technical word or concept" },
                  definition: { type: Type.STRING, description: "Plain-English accessible explanation of the term" }
                },
                required: ["term", "definition"]
              },
              description: "Definitions of crucial technical terms from the notes"
            }
          },
          required: ["summary", "keyTakeaways", "glossary"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Summarize error:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary." });
  }
});

// 2. Explain Concept Simply Endpoint
app.post("/api/study/explain", async (req, res) => {
  try {
    const { concept, style } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "No concept provided to explain." });
    }

    const client = getGeminiClient();
    const prompt = `Explain the concept of "${concept}" clearly.
Target style: ${style || "Like I am 5 (ELI5)"}.
Focus on building direct intuition, providing an elegant analogy, explaining core components, and addressing a major common misconception.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING, description: "The name of the concept" },
            simpleExplanation: { type: Type.STRING, description: "The complete clear explanation styled according to user request (can use markdown)" },
            keyAnalogy: { type: Type.STRING, description: "A highly vivid analogy explaining the concept" },
            corePrinciples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Title of the component/principle" },
                  explanation: { type: Type.STRING, description: "Brief explanation of this component/principle" }
                },
                required: ["title", "explanation"]
              },
              description: "3 to 4 core pillars or rules that govern this concept"
            },
            commonMisconception: { type: Type.STRING, description: "A popular mistake people make about this topic, and why it is wrong" }
          },
          required: ["concept", "simpleExplanation", "keyAnalogy", "corePrinciples", "commonMisconception"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Explain error:", error);
    res.status(500).json({ error: error.message || "Failed to generate explanation." });
  }
});

// 3. Generate MCQs Endpoint
app.post("/api/study/mcqs", async (req, res) => {
  try {
    const { topic, notes, count, difficulty } = req.body;
    const client = getGeminiClient();
    
    let sourceContent = "";
    if (notes) {
      sourceContent = `Based on the following notes:\n${notes}`;
    } else if (topic) {
      sourceContent = `On the general topic: "${topic}"`;
    } else {
      return res.status(400).json({ error: "Please provide a topic or notes to generate MCQs." });
    }

    const qCount = count || 5;
    const diff = difficulty || "Medium";

    const prompt = `Generate exactly ${qCount} Multiple Choice Questions (MCQs) ${sourceContent}.
Difficulty level: ${diff}.
Each MCQ must have exactly 4 options, a single correct answer (0-indexed), and a comprehensive, clear explanation.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Question ID, e.g. q1" },
                  question: { type: Type.STRING, description: "The full question text" },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly 4 options to choose from" },
                  correctAnswerIndex: { type: Type.INTEGER, description: "Correct answer index (0 to 3)" },
                  explanation: { type: Type.STRING, description: "Detailed feedback/explanation for the answer" }
                },
                required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("MCQs error:", error);
    res.status(500).json({ error: error.message || "Failed to generate MCQs." });
  }
});

// 4. Create Flashcards Endpoint
app.post("/api/study/flashcards", async (req, res) => {
  try {
    const { topic, notes, count } = req.body;
    const client = getGeminiClient();

    let sourceContent = "";
    if (notes) {
      sourceContent = `from these notes:\n${notes}`;
    } else if (topic) {
      sourceContent = `on the topic: "${topic}"`;
    } else {
      return res.status(400).json({ error: "Please provide a topic or notes to generate flashcards." });
    }

    const qCount = count || 8;

    const prompt = `Create exactly ${qCount} highly effective double-sided study flashcards ${sourceContent}.
Provide key terms, questions, or formulas on the 'front', and matching concise definitions, answers, or derivations on the 'back', along with a subtle, helpful 'hint'.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Flashcard ID, e.g. fc1" },
                  front: { type: Type.STRING, description: "Term, concept, or question (keep it punchy)" },
                  back: { type: Type.STRING, description: "Explanation, definition, or answer" },
                  hint: { type: Type.STRING, description: "A helpful memory aid or hint" }
                },
                required: ["id", "front", "back", "hint"]
              }
            }
          },
          required: ["flashcards"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Flashcards error:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards." });
  }
});

// 5. Generate Viva Questions Endpoint
app.post("/api/study/viva", async (req, res) => {
  try {
    const { topic, notes, count } = req.body;
    const client = getGeminiClient();

    let sourceContent = "";
    if (notes) {
      sourceContent = `based on the notes below:\n${notes}`;
    } else if (topic) {
      sourceContent = `on the topic: "${topic}"`;
    } else {
      return res.status(400).json({ error: "Please provide a topic or notes to generate viva questions." });
    }

    const qCount = count || 5;

    const prompt = `You are a strict but fair academic examiner conducting an oral examination (viva voce).
Generate exactly ${qCount} viva questions ${sourceContent}.
Include:
1. The question itself.
2. A detailed academic model answer.
3. An array of required keyword triggers (specific technical or conceptual terms that the examiner expects the student to say out loud to earn top marks).
4. Difficulty label (Easy, Medium, Hard).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Viva ID, e.g. v1" },
                  question: { type: Type.STRING, description: "The viva question" },
                  modelAnswer: { type: Type.STRING, description: "Standard exemplary oral answer" },
                  keywordsRequired: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 6 key words/phrases crucial to include in the response"
                  },
                  difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" }
                },
                required: ["id", "question", "modelAnswer", "keywordsRequired", "difficulty"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Viva error:", error);
    res.status(500).json({ error: error.message || "Failed to generate viva questions." });
  }
});

// 6. Create Revision Plans Endpoint
app.post("/api/study/revision-plan", async (req, res) => {
  try {
    const { subject, daysLeft, dailyHours, currentLevel } = req.body;
    if (!subject) {
      return res.status(400).json({ error: "Subject is required to build a revision plan." });
    }

    const client = getGeminiClient();
    const prompt = `Create a custom daily revision plan for: "${subject}".
Time frame remaining: ${daysLeft || 7} days.
Daily self-study capacity: ${dailyHours || 3} hours per day.
Current understanding/confidence: ${currentLevel || "Medium"}.

Plan should be highly actionable with exact daily checkable subtasks. Ensure the entire timeline fits within the specified days left.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A motivating plan title" },
            overview: { type: Type.STRING, description: "Overall strategy recommendation based on user constraints" },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER, description: "Week number, e.g., 1" },
                  focus: { type: Type.STRING, description: "Theme/Focus of this study block" },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dayNumber: { type: Type.INTEGER, description: "The consecutive day of revision (1 to N)" },
                        topic: { type: Type.STRING, description: "Today's revision focus" },
                        tasks: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "3 to 4 daily checkable micro-tasks (e.g. solve 3 problems, write flashcard summaries)"
                        },
                        estimatedMinutes: { type: Type.INTEGER, description: "Total minutes recommended" }
                      },
                      required: ["dayNumber", "topic", "tasks", "estimatedMinutes"]
                    }
                  }
                },
                required: ["weekNumber", "focus", "days"]
              },
              description: "A chronological list of study blocks split into days"
            }
          },
          required: ["title", "overview", "weeks"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Revision plan error:", error);
    res.status(500).json({ error: error.message || "Failed to generate revision plan." });
  }
});

// 7. Create Presentations Endpoint
app.post("/api/study/presentation", async (req, res) => {
  try {
    const { topic, slideCount, notes } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required to create a presentation." });
    }

    const client = getGeminiClient();
    const count = slideCount || 6;

    let contextText = "";
    if (notes) {
      contextText = `Reference these notes for detailed content: \n${notes}`;
    }

    const prompt = `Create a presentation outline for the topic: "${topic}".
Number of slides requested: ${count}.
${contextText}

Each slide must have a clear title, 3 to 4 brief, high-impact bulleted points, and a specific 'visualSuggestion' describing what visual layout, chart, or icon would represent it best. Include a general themeColor (e.g. "emerald", "indigo", "amber", "rose", "cyan", "violet").`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Main slide deck title" },
            subtitle: { type: Type.STRING, description: "Subtitle or author line" },
            themeColor: { type: Type.STRING, description: "Tailwind color class name (e.g., 'indigo', 'emerald', 'amber', 'rose', 'cyan', 'violet')" },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: "Slide Title" },
                  points: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 to 4 punchy bullet points representing content on this slide"
                  },
                  visualSuggestion: { type: Type.STRING, description: "Specific ideas for design elements, charts, or images on this slide" }
                },
                required: ["slideNumber", "title", "points", "visualSuggestion"]
              }
            }
          },
          required: ["title", "subtitle", "themeColor", "slides"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Presentation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate presentation." });
  }
});

// Configure Vite middleware or Static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyCopilot AI server listening on http://localhost:${PORT}`);
  });
}

startServer();
