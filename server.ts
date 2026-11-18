import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

const ALLOWED_MODELS = new Set(['gemini-4-hydrogen', 'gemini-3.1-flash-lite']);

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      const isTransient = msg.includes('503') || msg.includes('500') || msg.includes('ECONNRESET') || msg.includes('ETIMEDOUT');
      if (!isTransient || attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes('API_KEY_INVALID') || raw.includes('400')) {
    return { status: 400, message: 'The configured GEMINI_API_KEY appears invalid. Please verify it in Settings > Secrets.' };
  }
  if (raw.includes('PERMISSION_DENIED') || raw.includes('403')) {
    return { status: 403, message: 'Permission denied by Gemini API. Check your API key in Settings > Secrets.' };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return { status: 429, message: 'Gemini API rate limit or quota reached. Please wait a moment and try again.' };
  }
  if (raw.includes('NOT_FOUND') || raw.includes('404')) {
    return { status: 404, message: 'Requested Gemini model was not found. Try switching to Gemini 4 Hydrogen.' };
  }
  return { status: 500, message: raw || 'Unexpected error communicating with Gemini API.' };
}

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2 to 3 concise, parallel option names being compared.',
    },
    prosCons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          pros: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                impact: { type: Type.STRING, description: 'Must be exactly High, Medium, or Low.' },
              },
              required: ['text', 'impact'],
            },
          },
          cons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                impact: { type: Type.STRING, description: 'Must be exactly High, Medium, or Low.' },
              },
              required: ['text', 'impact'],
            },
          },
        },
        required: ['option', 'pros', 'cons'],
      },
    },
    comparisonTable: {
      type: Type.OBJECT,
      properties: {
        headers: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'First column is "Criteria", followed by each option name.',
        },
        rows: {
          type: Type.ARRAY,
          items: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          description: '4 to 5 rows comparing key criteria across each option.',
        },
      },
      required: ['headers', 'rows'],
    },
    swot: {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['subject', 'strengths', 'weaknesses', 'opportunities', 'threats'],
    },
    priorityScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          option: { type: Type.STRING },
          costEfficiency: { type: Type.INTEGER, description: 'Score from 1 to 10 (10 = most cost efficient).' },
          timeFlexibility: { type: Type.INTEGER, description: 'Score from 1 to 10 (10 = fastest / most flexible).' },
          riskSafety: { type: Type.INTEGER, description: 'Score from 1 to 10 (10 = lowest risk / safest).' },
          upsideGrowth: { type: Type.INTEGER, description: 'Score from 1 to 10 (10 = highest long-term upside).' },
        },
        required: ['option', 'costEfficiency', 'timeFlexibility', 'riskSafety', 'upsideGrowth'],
      },
    },
    verdict: {
      type: Type.OBJECT,
      properties: {
        recommendation: { type: Type.STRING, description: 'Exact name of the recommended option.' },
        decisiveFactor: { type: Type.STRING, description: 'Short 4-8 word phrase naming what tips the scale.' },
        summary: { type: Type.STRING, description: 'Balanced 2-3 sentence tiebreaker rationale.' },
      },
      required: ['recommendation', 'decisiveFactor', 'summary'],
    },
  },
  required: ['options', 'prosCons', 'comparisonTable', 'swot', 'priorityScores', 'verdict'],
};

const devilsAdvocateSchema = {
  type: Type.OBJECT,
  properties: {
    challengedOption: { type: Type.STRING },
    counterThesis: { type: Type.STRING, description: '2-3 crisp sentences arguing the strongest case against the favored option.' },
    blindSpots: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 concrete blind spots or hidden risks.',
    },
    stressTestQuestion: { type: Type.STRING, description: '1 piercing question the user must answer before deciding.' },
  },
  required: ['challengedOption', 'counterThesis', 'blindSpots', 'stressTestQuestion'],
};

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/analyze', async (req, res) => {
  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured. Add your key in Settings > Secrets, or explore the starter presets in the sidebar.',
    });
    return;
  }

  const { decision, options, context, priorities, model } = req.body ?? {};
  if (typeof decision !== 'string' || !decision.trim()) {
    res.status(400).json({ error: 'Please describe the decision you want to analyze.' });
    return;
  }

  const selectedModel = typeof model === 'string' && ALLOWED_MODELS.has(model) ? model : 'gemini-4-hydrogen';

  const priorityNote = priorities
    ? `User priority weights (1-10): Cost Efficiency=${priorities.costEfficiency ?? 5}, Time & Flexibility=${priorities.timeFlexibility ?? 5}, Risk Safety=${priorities.riskSafety ?? 5}, Long-Term Upside=${priorities.upsideGrowth ?? 5}.`
    : '';

  const prompt = `Analyze this decision objectively and concisely:
Decision: "${decision.trim()}"
${typeof options === 'string' && options.trim() ? `Options to compare: ${options.trim()}` : 'Infer 2 clear, distinct options (e.g., Option A vs Option B, or Proceed vs Hold).'}
${typeof context === 'string' && context.trim() ? `Priorities & constraints: ${context.trim()}` : ''}
${priorityNote}

Requirements:
- Keep each bullet sharp, concrete, and non-repetitive (3 pros and 3 cons per option).
- Set each impact to strictly "High", "Medium", or "Low".
- Comparison table must have "Criteria" as headers[0] followed by the exact option names, and 4-5 concise rows.
- SWOT analysis should evaluate the primary active choice.
- Score every option honestly from 1 to 10 across costEfficiency, timeFlexibility, riskSafety, and upsideGrowth.
- Provide a decisive, nuanced verdict grounded in the user's constraints.`;

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction:
            'You are The Tiebreaker, an objective decision analyst. Deliver crisp, pragmatic trade-off analysis without fluff or filler.',
          responseMimeType: 'application/json',
          responseSchema: analysisResponseSchema,
          ...(selectedModel === 'gemini-4-hydrogen'
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM } }
            : {}),
        },
      }),
    );

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
      return;
    }

    const parsed = JSON.parse(rawText);
    res.json({ analysis: parsed, model: selectedModel });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.post('/api/devils-advocate', async (req, res) => {
  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured. Add your key in Settings > Secrets to run live Devil’s Advocate challenges.',
    });
    return;
  }

  const { decision, targetOption, currentVerdict, context, model } = req.body ?? {};
  if (typeof decision !== 'string' || !decision.trim() || typeof targetOption !== 'string' || !targetOption.trim()) {
    res.status(400).json({ error: 'Decision and target option are required for Devil’s Advocate.' });
    return;
  }

  const selectedModel = typeof model === 'string' && ALLOWED_MODELS.has(model) ? model : 'gemini-4-hydrogen';

  const prompt = `Stress-test this decision by arguing the strongest possible counter-case against "${targetOption.trim()}".
Decision: "${decision.trim()}"
Current Verdict Summary: ${typeof currentVerdict === 'string' ? currentVerdict : 'N/A'}
${typeof context === 'string' && context.trim() ? `User Context: ${context.trim()}` : ''}

Expose hidden assumptions, second-order risks, and ask one piercing question that forces clarity.`;

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a ruthless but constructive Devil’s Advocate. Steelman the opposite side and uncover blind spots.',
          responseMimeType: 'application/json',
          responseSchema: devilsAdvocateSchema,
          ...(selectedModel === 'gemini-4-hydrogen'
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
        },
      }),
    );

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      res.status(502).json({ error: 'Gemini returned an empty counter-analysis. Please try again.' });
      return;
    }

    const parsed = JSON.parse(rawText);
    res.json({ devilsAdvocate: parsed });
  } catch (error) {
    const formatted = formatGeminiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
