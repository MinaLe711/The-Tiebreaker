import { RotateCcw } from 'lucide-react';
import type { AnalysisTab, DecisionAnalysis, ImpactLevel, PriorityWeights } from '../types';

interface AnalysisViewsProps {
  analysis: DecisionAnalysis;
  activeTab: AnalysisTab;
  priorities: PriorityWeights;
  onChangeTab: (tab: AnalysisTab) => void;
  onChangePriorities: (next: PriorityWeights) => void;
}

const IMPACT_STYLES: Record<ImpactLevel, string> = {
  High: 'text-slate-900 font-semibold',
  Medium: 'text-slate-600 font-medium',
  Low: 'text-slate-400 font-normal',
};

const PRIORITY_CRITERIA: Array<{
  key: keyof PriorityWeights;
  label: string;
  hint: string;
}> = [
  {
    key: 'costEfficiency',
    label: 'Cost Efficiency',
    hint: 'Upfront spend, ongoing expenses, and capital preservation',
  },
  {
    key: 'timeFlexibility',
    label: 'Time & Flexibility',
    hint: 'Reversibility, speed to value, and daily schedule autonomy',
  },
  {
    key: 'riskSafety',
    label: 'Risk Safety',
    hint: 'Downside protection, predictability, and margin of safety',
  },
  {
    key: 'upsideGrowth',
    label: 'Long-Term Upside',
    hint: 'Compounding learning, equity, or strategic leverage over 2+ years',
  },
];

export function computeWeightedScores(analysis: DecisionAnalysis, priorities: PriorityWeights) {
  const totalWeight =
    priorities.costEfficiency +
    priorities.timeFlexibility +
    priorities.riskSafety +
    priorities.upsideGrowth;

  const safeDivisor = totalWeight > 0 ? totalWeight : 1;

  return analysis.priorityScores
    .map((entry) => {
      const weighted =
        (entry.costEfficiency * priorities.costEfficiency +
          entry.timeFlexibility * priorities.timeFlexibility +
          entry.riskSafety * priorities.riskSafety +
          entry.upsideGrowth * priorities.upsideGrowth) /
        safeDivisor;

      return {
        ...entry,
        weightedScore: Number(weighted.toFixed(2)),
      };
    })
    .sort((a, b) => b.weightedScore - a.weightedScore);
}

export function AnalysisViews({
  analysis,
  activeTab,
  priorities,
  onChangeTab,
  onChangePriorities,
}: AnalysisViewsProps) {
  const rankedScores = computeWeightedScores(analysis, priorities);
  const topScore = rankedScores[0]?.weightedScore ?? 0;

  return (
    <section
      id="analysis-matrix"
      aria-label="Decision Analysis Views"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Toolbar & Segmented Switcher */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div
          role="tablist"
          aria-label="Analysis modes"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg overflow-x-auto max-w-full"
        >
          {(
            [
              { id: 'proscons', label: 'Pros & Cons' },
              { id: 'table', label: 'Comparison Table' },
              { id: 'swot', label: 'SWOT Analysis' },
              { id: 'weights', label: 'Priority Weights' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onChangeTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 whitespace-nowrap shrink-0">
          <span>Comparing</span>
          <span className="font-medium text-slate-800">{analysis.options.join(' vs ')}</span>
        </div>
      </div>

      {/* Tab Panel Body */}
      <div className="p-5 sm:p-6">
        {activeTab === 'proscons' && (
          <div className="divide-y divide-slate-200">
            {analysis.prosCons.map((group, idx) => (
              <div key={group.option} className={idx > 0 ? 'pt-6 mt-6' : ''}>
                <div className="flex items-baseline justify-between gap-4 mb-4">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    {group.option}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap shrink-0">
                    {group.pros.length} pros · {group.cons.length} cons
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pros Column */}
                  <div>
                    <h4 className="text-xs font-semibold tracking-wide text-emerald-700 mb-3">
                      Advantages
                    </h4>
                    <ul className="divide-y divide-slate-100 border-t border-slate-100">
                      {group.pros.map((pro, pIdx) => (
                        <li
                          key={pIdx}
                          className="py-2.5 flex items-start justify-between gap-4 text-sm text-slate-700"
                        >
                          <span className="flex items-start gap-2.5 leading-relaxed">
                            <span className="text-emerald-600 font-mono font-semibold select-none">
                              +
                            </span>
                            <span>{pro.text}</span>
                          </span>
                          <span
                            className={`text-xs whitespace-nowrap shrink-0 pt-0.5 ${IMPACT_STYLES[pro.impact] ?? 'text-slate-500'}`}
                          >
                            {pro.impact} impact
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons Column */}
                  <div>
                    <h4 className="text-xs font-semibold tracking-wide text-rose-700 mb-3">
                      Trade-offs &amp; Risks
                    </h4>
                    <ul className="divide-y divide-slate-100 border-t border-slate-100">
                      {group.cons.map((con, cIdx) => (
                        <li
                          key={cIdx}
                          className="py-2.5 flex items-start justify-between gap-4 text-sm text-slate-700"
                        >
                          <span className="flex items-start gap-2.5 leading-relaxed">
                            <span className="text-rose-600 font-mono font-semibold select-none">
                              −
                            </span>
                            <span>{con.text}</span>
                          </span>
                          <span
                            className={`text-xs whitespace-nowrap shrink-0 pt-0.5 ${IMPACT_STYLES[con.impact] ?? 'text-slate-500'}`}
                          >
                            {con.impact} impact
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'table' && (
          <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  {analysis.comparisonTable.headers.map((header, idx) => (
                    <th
                      key={idx}
                      scope="col"
                      className={`py-2.5 px-4 text-left font-display text-xs font-semibold text-slate-600 ${
                        idx === 0 ? 'w-48' : ''
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {analysis.comparisonTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-4 align-top leading-relaxed ${
                          cIdx === 0 ? 'font-medium text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'swot' && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                Strategic focus: <span className="font-semibold text-slate-900">{analysis.swot.subject}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 rounded-lg overflow-hidden divide-y md:divide-y-0 divide-slate-200">
              <div className="p-5 md:border-r md:border-b border-slate-200 bg-emerald-50/25">
                <h4 className="font-display text-xs font-semibold tracking-wide text-emerald-800 mb-3">
                  Strengths · Internal
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                  {analysis.swot.strengths.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 md:border-b border-slate-200 bg-rose-50/25">
                <h4 className="font-display text-xs font-semibold tracking-wide text-rose-800 mb-3">
                  Weaknesses · Internal
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                  {analysis.swot.weaknesses.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 md:border-r border-slate-200 bg-sky-50/25">
                <h4 className="font-display text-xs font-semibold tracking-wide text-sky-800 mb-3">
                  Opportunities · External
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                  {analysis.swot.opportunities.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-amber-50/25">
                <h4 className="font-display text-xs font-semibold tracking-wide text-amber-800 mb-3">
                  Threats · External
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                  {analysis.swot.threats.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weights' && (
          <div id="priority-weights" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sliders */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Tune Your Priorities
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Adjust how much each factor matters to recalculate the weighted winner live.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onChangePriorities({
                      costEfficiency: 5,
                      timeFlexibility: 5,
                      riskSafety: 5,
                      upsideGrowth: 5,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>

              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {PRIORITY_CRITERIA.map(({ key, label, hint }) => (
                  <div key={key} className="py-3.5">
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                      <label htmlFor={`slider-${key}`} className="text-sm font-medium text-slate-800">
                        {label}
                      </label>
                      <span className="font-mono text-xs font-semibold tabular-nums text-blue-700">
                        {priorities[key]} / 10
                      </span>
                    </div>
                    <input
                      id={`slider-${key}`}
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={priorities[key]}
                      onChange={(e) =>
                        onChangePriorities({
                          ...priorities,
                          [key]: Number(e.target.value),
                        })
                      }
                      className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <p className="mt-1 text-xs text-slate-500">{hint}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Weighted Scoreboard */}
            <div className="lg:col-span-5 lg:border-l lg:border-slate-200 lg:pl-8">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                Weighted Fit Ranking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">
                Normalized composite out of 10.00 based on your sliders
              </p>

              <div className="space-y-4">
                {rankedScores.map((item, idx) => {
                  const isLeader = idx === 0 && item.weightedScore === topScore;
                  const pct = Math.min(100, Math.max(0, (item.weightedScore / 10) * 100));
                  return (
                    <div
                      key={item.option}
                      className={`p-4 rounded-lg border ${
                        isLeader ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <div className="font-display text-sm font-semibold text-slate-900">
                          {idx + 1}. {item.option}
                        </div>
                        <div className="font-mono text-base font-semibold tabular-nums text-slate-900">
                          {item.weightedScore.toFixed(2)}
                        </div>
                      </div>

                      <div className="mt-2.5 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${
                            isLeader ? 'bg-blue-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-2 text-[11px] text-slate-500 font-mono tabular-nums">
                        <div>Cost {item.costEfficiency}</div>
                        <div>Time {item.timeFlexibility}</div>
                        <div>Safe {item.riskSafety}</div>
                        <div>Gain {item.upsideGrowth}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
