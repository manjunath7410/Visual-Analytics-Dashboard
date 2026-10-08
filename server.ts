import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { 
  GEMINI_SYSTEM_INSTRUCTION,
  buildExecutiveSummaryPrompt,
  buildKeyFindingsPrompt,
  buildTrendExplanationPrompt,
  buildAnomalyExplanationPrompt,
  buildRecommendationsPrompt,
  buildAskDataPrompt
} from './src/services/gemini/prompts';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Model configuration with sensible defaults
const AI_MODEL = process.env.AI_MODEL || 'gemini-3.8-flash';
const apiKey = process.env.GEMINI_API_KEY;

// Server-side Google GenAI instance
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Status endpoint - never exposes the actual key
app.get('/api/gemini/status', (req, res) => {
  res.json({
    configured: Boolean(apiKey),
    model: AI_MODEL,
    source: 'Server Environment'
  });
});

// Server-side response cache
const serverCache = new Map<string, { timestamp: number; data: any }>();
const SERVER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Helper for generating JSON with Gemini with fallback support
async function callGeminiJSON(prompt: string, schema?: any) {
  if (!ai) {
    throw new Error('Gemini API is not configured. GEMINI_API_KEY environment variable is missing.');
  }

  // Check server cache first
  const cacheKey = `${prompt.substring(0, 100)}_${prompt.length}_${prompt.slice(-50)}`;
  const cached = serverCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SERVER_CACHE_TTL) {
    return cached.data;
  }

  // Model fallback chain: primary -> flash-lite -> latest
  const modelsToTry = [AI_MODEL, 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
          temperature: 0.2, // Low temperature for high analytical precision
          responseMimeType: 'application/json',
          ...(schema ? { responseSchema: schema } : {})
        },
      });

      const rawText = response.text || '{}';
      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch (err) {
        // Fallback: strip markdown code blocks if present
        const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      // Store in server cache
      serverCache.set(cacheKey, { timestamp: Date.now(), data: parsed });
      return parsed;
    } catch (err: any) {
      lastError = err;
      const msg = err.message || '';
      // If quota exceeded or 429 or 503 or unavailable, try next model in chain
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota') || msg.includes('503') || msg.includes('UNAVAILABLE')) {
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('All model attempts failed');
}

// 2. Executive Summary endpoint
app.post('/api/gemini/executive-summary', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }
    const prompt = buildExecutiveSummaryPrompt(context);
    const data = await callGeminiJSON(prompt);
    res.json({ success: true, data });
  } catch (err: any) {
    res.json({ 
      success: false, 
      fallback: true,
      error: err.message || 'Failed to generate executive summary' 
    });
  }
});

// 3. Key Findings endpoint
app.post('/api/gemini/key-findings', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }
    const prompt = buildKeyFindingsPrompt(context);
    const data = await callGeminiJSON(prompt);
    res.json({ success: true, data: data.findings || data });
  } catch (err: any) {
    res.json({ 
      success: false, 
      fallback: true,
      error: err.message || 'Failed to generate key findings' 
    });
  }
});

// 4. Trend Explanation endpoint
app.post('/api/gemini/trend-explanation', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }
    const prompt = buildTrendExplanationPrompt(context);
    const data = await callGeminiJSON(prompt);
    res.json({ success: true, data });
  } catch (err: any) {
    res.json({ 
      success: false, 
      fallback: true,
      error: err.message || 'Failed to explain trends' 
    });
  }
});

// 5. Anomaly Explanation endpoint
app.post('/api/gemini/anomaly-explanation', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }
    const prompt = buildAnomalyExplanationPrompt(context);
    const data = await callGeminiJSON(prompt);
    res.json({ success: true, data });
  } catch (err: any) {
    res.json({ 
      success: false, 
      fallback: true,
      error: err.message || 'Failed to explain anomalies' 
    });
  }
});

// 6. Business Recommendations endpoint
app.post('/api/gemini/recommendations', async (req, res) => {
  try {
    const { context } = req.body;
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }
    const prompt = buildRecommendationsPrompt(context);
    const data = await callGeminiJSON(prompt);
    res.json({ success: true, data: data.recommendations || data });
  } catch (err: any) {
    res.json({ 
      success: false, 
      fallback: true,
      error: err.message || 'Failed to generate recommendations' 
    });
  }
});

// 7. Ask the Data endpoint
app.post('/api/gemini/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || !context) {
      return res.status(400).json({ error: 'Question and context are required' });
    }
    const prompt = buildAskDataPrompt(question, context);
    const data = await callGeminiJSON(prompt);
    res.json({ success: true, data });
  } catch (err: any) {
    res.json({ 
      success: false, 
      fallback: true,
      error: err.message || 'Failed to answer question' 
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AI Studio Applet running on http://0.0.0.0:${port} with Gemini server proxy`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
