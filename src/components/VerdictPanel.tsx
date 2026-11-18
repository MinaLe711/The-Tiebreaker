import { useState } from 'react';
import { BookmarkCheck, Coins, Scale, ShieldAlert } from 'lucide-react';
import type { DecisionAnalysis, DevilsAdvocateData } from '../types';

interface VerdictPanelProps {
  analysis: DecisionAnalysis;
  decisionText: string;
  isDevilLoading: boolean;
  devilError: string | null;
  devilsAdvocate?: DevilsAdvocateData;
  isSaved: boolean;
  initialChosenOption?: string;
  initialOutcomeNote?: string;
  onRunDevilsAdvocate: (targetOption: string) => void;
  onSaveToLog: (chosenOption: string, outcomeNote: string) => void;
}

export function VerdictPanel({
  analysis,
  decisionText,
  isDevilLoading,
  devilError,
  devilsAdvocate,
  isSaved,
  initialChosenOption,
  initialOutcomeNote,
  onRunDevilsAdvocate,
  onSaveToLog,
}: VerdictPanelProps) {
  const [coinPick, setCoinPick] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showDevil, setShowDevil] = useState(false);
  const [chosenOption, setChosenOption] = useState<string>(
    initialChosenOption || analysis.verdict.recommendation || analysis.options[0] || '',
  );
  const [outcomeNote, setOutcomeNote] = useState(initialOutcomeNote || '');

  const handleFlipCoin = () => {
    const opts = analysis.options.length >= 2 ? analysis.options : ['Proceed', 'Hold'];
    setIsFlipping(true);
    setTimeout(() => {
      const winner = opts[Math.floor(Math.random() * opts.length)];
      setCoinPick(winner);
      setIsFlipping(false);
    }, 200);
  };

  const handleDevilClick = () => {
    setShowDevil(true);
    onRunDevilsAdvocate(analysis.verdict.recommendation);
  };

  return (
    <section
      id="verdict-section"
      aria-label="Tiebreaker Verdict and Stress Test"
      className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200"
    >
      {/* Primary Verdict */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-blue-700">The Tiebreaker Verdict</span>
              <span aria-hidden="true">·</span>
              <span>Decisive factor: {analysis.verdict.decisiveFactor}</span>
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight">
              Lean toward: {analysis.verdict.recommendation}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed pt-1">{analysis.verdict.summary}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDevilClick}
              disabled={isDevilLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              {isDevilLoading ? 'Stress-testing...' : 'Argue the Opposite'}
            </button>

            <button
              type="button"
              onClick={handleFlipCoin}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <Coins
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isFlipping ? 'rotate-180 scale-110' : ''
                }`}
              />
              Flip Tiebreaker Coin
            </button>
          </div>
        </div>

        {/* Coin Flip Gut-Check Output */}
        {coinPick && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-3 text-sm text-slate-700">
            <Scale className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Coin landed on <strong className="text-slate-900">{coinPick}</strong> — check your
              immediate gut reaction. If you feel relief, commit to it. If you feel a flash of
              disappointment, you already know you prefer the alternative.
            </p>
          </div>
        )}
      </div>

      {/* Devil's Advocate Counter-Thesis */}
      {showDevil && (devilsAdvocate || devilError || isDevilLoading) && (
        <div className="p-5 sm:p-6 bg-amber-50/30">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <h4 className="font-display text-sm font-semibold text-slate-900">
              Devil&rsquo;s Advocate Challenge
              {devilsAdvocate?.challengedOption ? ` · Challenging ${devilsAdvocate.challengedOption}` : ''}
            </h4>
          </div>

          {isDevilLoading ? (
            <div className="space-y-2 animate-pulse" aria-live="polite">
              <div className="h-3.5 bg-slate-200 rounded w-3/4" />
              <div className="h-3.5 bg-slate-200 rounded w-1/2" />
            </div>
          ) : devilError ? (
            <p className="text-sm text-rose-700">{devilError}</p>
          ) : (
            devilsAdvocate && (
              <div className="space-y-4">
                <p className="text-sm text-slate-800 leading-relaxed">{devilsAdvocate.counterThesis}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {devilsAdvocate.blindSpots.map((spot, idx) => (
                    <div key={idx} className="text-xs text-slate-700 leading-relaxed border-t border-amber-200/80 pt-2.5">
                      <span className="font-mono font-semibold text-amber-800 block mb-1">
                        Blind Spot 0{idx + 1}
                      </span>
                      {spot}
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-amber-200/80 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Stress-test question: </span>
                  {devilsAdvocate.stressTestQuestion}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Save Decision & Outcome Reflection */}
      <div className="px-5 py-4 sm:px-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
          <label htmlFor="chosen-option-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
            My choice:
          </label>
          <select
            id="chosen-option-select"
            value={chosenOption}
            onChange={(e) => setChosenOption(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
          >
            {analysis.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            placeholder="Optional note or 6-month check-in reminder..."
            aria-label="Decision note"
            className="flex-1 min-w-[180px] text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={() => onSaveToLog(chosenOption, outcomeNote)}
          disabled={!decisionText.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <BookmarkCheck className="h-3.5 w-3.5" />
          {isSaved ? 'Update Decision Log' : 'Save to Decision Log'}
        </button>
      </div>
    </section>
  );
}
