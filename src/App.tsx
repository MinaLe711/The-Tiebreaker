import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Menu, Plus } from 'lucide-react';
import { AnalysisViews } from './components/AnalysisViews';
import { Sidebar } from './components/Sidebar';
import { VerdictPanel } from './components/VerdictPanel';
import { DECISION_PRESETS } from './data/presets';
import type {
  AnalysisTab,
  DecisionAnalysis,
  DecisionPreset,
  GeminiModelOption,
  PriorityWeights,
  SavedDecisionRecord,
} from './types';

const STORAGE_KEY = 'tiebreaker_decision_log_v1';

const DEFAULT_PRIORITIES: PriorityWeights = {
  costEfficiency: 6,
  timeFlexibility: 6,
  riskSafety: 5,
  upsideGrowth: 7,
};

function loadHistory(): SavedDecisionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const initialPreset = DECISION_PRESETS[0];

  const [decision, setDecision] = useState(initialPreset.decision);
  const [optionsInput, setOptionsInput] = useState(initialPreset.optionsInput);
  const [context, setContext] = useState(initialPreset.context);
  const [model, setModel] = useState<GeminiModelOption>('gemini-4-hydrogen');
  const [priorities, setPriorities] = useState<PriorityWeights>(DEFAULT_PRIORITIES);

  const [analysis, setAnalysis] = useState<DecisionAnalysis | null>(initialPreset.analysis);
  const [analysisSource, setAnalysisSource] = useState<'ai' | 'preset'>('preset');
  const [activeTab, setActiveTab] = useState<AnalysisTab>('proscons');

  const [activePresetId, setActivePresetId] = useState<string | null>(initialPreset.id);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const [history, setHistory] = useState<SavedDecisionRecord[]>(() => loadHistory());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [isDevilLoading, setIsDevilLoading] = useState(false);
  const [devilError, setDevilError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const handleSelectPreset = (preset: DecisionPreset) => {
    setDecision(preset.decision);
    setOptionsInput(preset.optionsInput);
    setContext(preset.context);
    setAnalysis(preset.analysis);
    setAnalysisSource('preset');
    setActivePresetId(preset.id);
    setActiveRecordId(null);
    setAnalyzeError(null);
    setDevilError(null);
  };

  const handleSelectHistory = (record: SavedDecisionRecord) => {
    setDecision(record.decision);
    setOptionsInput(record.optionsInput);
    setContext(record.context);
    setPriorities(record.priorities);
    setAnalysis(record.analysis);
    setAnalysisSource(record.source);
    setActiveRecordId(record.id);
    setActivePresetId(null);
    setAnalyzeError(null);
    setDevilError(null);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeRecordId === id) {
      setActiveRecordId(null);
    }
  };

  const handleNewDecision = () => {
    setDecision('');
    setOptionsInput('');
    setContext('');
    setActivePresetId(null);
    setActiveRecordId(null);
    setAnalysis(null);
    setAnalyzeError(null);
    setDevilError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) {
      setAnalyzeError('Please describe the decision you want to evaluate.');
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setDevilError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decision.trim(),
          options: optionsInput.trim(),
          context: context.trim(),
          priorities,
          model,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || `Request failed with status ${res.status}`);
      }

      setAnalysis(payload.analysis);
      setAnalysisSource('ai');
      setActivePresetId(null);
      setActiveRecordId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to complete analysis.';
      setAnalyzeError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunDevilsAdvocate = async (targetOption: string) => {
    if (!analysis) return;

    // If a starter preset already ships with a curated Devil's Advocate for that recommendation, surface it if offline or refresh live
    setIsDevilLoading(true);
    setDevilError(null);

    try {
      const res = await fetch('/api/devils-advocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decision.trim(),
          targetOption,
          currentVerdict: analysis.verdict.summary,
          context: context.trim(),
          model,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        // If preset already has a built-in Devil's Advocate and API key isn't configured, fall back gracefully to the preset's built-in counter-thesis
        if (res.status === 503 && analysisSource === 'preset' && analysis.devilsAdvocate) {
          setAnalysis({ ...analysis });
          return;
        }
        throw new Error(payload?.error || `Request failed with status ${res.status}`);
      }

      setAnalysis({
        ...analysis,
        devilsAdvocate: payload.devilsAdvocate,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to generate counter-argument.';
      setDevilError(message);
    } finally {
      setIsDevilLoading(false);
    }
  };

  const handleSaveToLog = (chosenOption: string, outcomeNote: string) => {
    if (!analysis || !decision.trim()) return;

    if (activeRecordId) {
      setHistory((prev) =>
        prev.map((rec) =>
          rec.id === activeRecordId
            ? {
                ...rec,
                decision: decision.trim(),
                optionsInput: optionsInput.trim(),
                context: context.trim(),
                priorities,
                analysis,
                chosenOption,
                outcomeNote: outcomeNote.trim() || undefined,
              }
            : rec,
        ),
      );
      return;
    }

    const newRecord: SavedDecisionRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      decision: decision.trim(),
      optionsInput: optionsInput.trim(),
      context: context.trim(),
      priorities,
      analysis,
      chosenOption,
      outcomeNote: outcomeNote.trim() || undefined,
      createdAt: new Date().toISOString(),
      source: analysisSource,
    };

    setHistory((prev) => [newRecord, ...prev]);
    setActiveRecordId(newRecord.id);
    setActivePresetId(null);
  };

  const jumpToView = (tab: AnalysisTab) => {
    setActiveTab(tab);
    document.getElementById('analysis-matrix')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Three-Zone Top Bar */}
      <header className="h-14 sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open decision library"
            className="lg:hidden p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Menu className="h-5 w-5" />
          </button>
          <a
            href="#decision-brief"
            className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            The Tiebreaker
          </a>
        </div>

        {/* Zone 2: Concise Single-Line Navigation */}
        <nav
          aria-label="Workspace sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#decision-brief"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Decision Brief
          </a>
          <button
            type="button"
            onClick={() => jumpToView('proscons')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Pros &amp; Cons
          </button>
          <button
            type="button"
            onClick={() => jumpToView('table')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Matrix
          </button>
          <button
            type="button"
            onClick={() => jumpToView('weights')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Priority Weights
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleNewDecision}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-3.5 w-3.5" />
            New Decision
          </button>
        </div>
      </header>

      {/* Workspace Body: Sidebar + Main Viewport */}
      <div className="flex flex-1">
        <Sidebar
          presets={DECISION_PRESETS}
          activePresetId={activePresetId}
          activeRecordId={activeRecordId}
          history={history}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onSelectPreset={handleSelectPreset}
          onSelectHistory={handleSelectHistory}
          onDeleteHistory={handleDeleteHistory}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Decision Brief Composer */}
            <section
              id="decision-brief"
              aria-labelledby="brief-heading"
              className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <div>
                  <h1
                    id="brief-heading"
                    className="font-display text-lg font-bold text-slate-900 tracking-tight"
                  >
                    Frame Your Decision
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define your dilemma and constraints to generate a multi-angle breakdown.
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {analysisSource === 'ai' ? 'Generated via Gemini' : 'Starter Scenario'}
                </span>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div>
                  <label
                    htmlFor="decision-input"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    What decision are you trying to make?
                  </label>
                  <textarea
                    id="decision-input"
                    rows={2}
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    placeholder="e.g., Should I accept the remote leadership offer or stay to launch our Q3 product?"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="options-input"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Options to compare (comma-separated, optional)
                    </label>
                    <input
                      id="options-input"
                      type="text"
                      value={optionsInput}
                      onChange={(e) => setOptionsInput(e.target.value)}
                      placeholder="e.g., Accept Offer, Stay Through Q3"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="context-input"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Priorities &amp; constraints (optional)
                    </label>
                    <input
                      id="context-input"
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g., 12-month savings runway, minimal relocation"
                      className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                    />
                  </div>
                </div>

                {analyzeError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 px-3.5 py-2.5 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{analyzeError}</span>
                  </div>
                )}

                <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <label htmlFor="model-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                      Reasoning depth:
                    </label>
                    <select
                      id="model-select"
                      value={model}
                      onChange={(e) => setModel(e.target.value as GeminiModelOption)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-600"
                    >
                      <option value="gemini-4-hydrogen">Balanced (Gemini 4 Hydrogen)</option>
                      <option value="gemini-3.1-flash-lite">Fast (Gemini 3.1 Flash Lite)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    {isAnalyzing ? 'Analyzing trade-offs...' : 'Break the Tie'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </section>

            {/* Loading Skeleton */}
            {isAnalyzing && (
              <div
                aria-live="polite"
                aria-label="Generating decision analysis"
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 animate-pulse"
              >
                <div className="flex gap-2">
                  <div className="h-8 w-28 bg-slate-200 rounded-md" />
                  <div className="h-8 w-32 bg-slate-100 rounded-md" />
                  <div className="h-8 w-28 bg-slate-100 rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-12 bg-slate-100 rounded" />
                    <div className="h-12 bg-slate-100 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-12 bg-slate-100 rounded" />
                    <div className="h-12 bg-slate-100 rounded" />
                  </div>
                </div>
              </div>
            )}

            {/* Empty State when "New Decision" cleared the canvas */}
            {!isAnalyzing && !analysis && (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Ready to evaluate your next crossroads
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
                  Enter a dilemma above and click <strong>Break the Tie</strong>, or pick any starter scenario from the sidebar to test the interactive matrix.
                </p>
              </div>
            )}

            {/* Active Analysis + Verdict */}
            {!isAnalyzing && analysis && (
              <>
                <AnalysisViews
                  analysis={analysis}
                  activeTab={activeTab}
                  priorities={priorities}
                  onChangeTab={setActiveTab}
                  onChangePriorities={setPriorities}
                />

                <VerdictPanel
                  key={`${activePresetId ?? activeRecordId ?? 'ai'}-${analysis.verdict.recommendation}`}
                  analysis={analysis}
                  decisionText={decision}
                  isDevilLoading={isDevilLoading}
                  devilError={devilError}
                  devilsAdvocate={analysis.devilsAdvocate}
                  isSaved={Boolean(activeRecordId)}
                  initialChosenOption={
                    activeRecordId
                      ? history.find((item) => item.id === activeRecordId)?.chosenOption
                      : undefined
                  }
                  initialOutcomeNote={
                    activeRecordId
                      ? history.find((item) => item.id === activeRecordId)?.outcomeNote
                      : undefined
                  }
                  onRunDevilsAdvocate={handleRunDevilsAdvocate}
                  onSaveToLog={handleSaveToLog}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
