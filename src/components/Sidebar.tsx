import { useMemo, useState } from 'react';
import { BookOpen, Clock, Search, Trash2, X } from 'lucide-react';
import type { DecisionPreset, SavedDecisionRecord } from '../types';

interface SidebarProps {
  presets: DecisionPreset[];
  activePresetId: string | null;
  activeRecordId: string | null;
  history: SavedDecisionRecord[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectPreset: (preset: DecisionPreset) => void;
  onSelectHistory: (record: SavedDecisionRecord) => void;
  onDeleteHistory: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function Sidebar({
  presets,
  activePresetId,
  activeRecordId,
  history,
  isOpenMobile,
  onCloseMobile,
  onSelectPreset,
  onSelectHistory,
  onDeleteHistory,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter(
      (item) =>
        item.decision.toLowerCase().includes(q) ||
        (item.chosenOption && item.chosenOption.toLowerCase().includes(q)) ||
        item.analysis.options.some((opt) => opt.toLowerCase().includes(q)),
    );
  }, [history, searchQuery]);

  const content = (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 lg:hidden">
        <span className="font-display text-sm font-semibold text-slate-900">Decision Library</span>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close library sidebar"
          className="p-2 text-slate-500 hover:text-slate-900 rounded-md focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-7">
        {/* Starter Scenarios */}
        <section aria-labelledby="starter-scenarios-heading">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-3.5 w-3.5 text-slate-500" />
            <h2
              id="starter-scenarios-heading"
              className="font-display text-xs font-semibold tracking-wide text-slate-500"
            >
              Starter Scenarios
            </h2>
          </div>

          <div className="space-y-1.5">
            {presets.map((preset) => {
              const isActive = activePresetId === preset.id && !activeRecordId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onSelectPreset(preset);
                    onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="font-display text-sm font-semibold text-slate-900 truncate">
                    {preset.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span>{preset.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{preset.analysis.options.length} options</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Saved Decision Log */}
        <section aria-labelledby="decision-log-heading" className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-slate-500" />
              <h2
                id="decision-log-heading"
                className="font-display text-xs font-semibold tracking-wide text-slate-500"
              >
                Decision Log
              </h2>
            </div>
            <span className="font-mono text-xs tabular-nums text-slate-400">{history.length}</span>
          </div>

          {history.length > 0 && (
            <div className="relative mb-3">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter saved decisions..."
                aria-label="Filter saved decisions"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          )}

          {history.length === 0 ? (
            <div className="px-3 py-4 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 leading-relaxed">
              No saved decisions yet. Analyze a dilemma and save your verdict to track outcomes over time.
            </div>
          ) : filteredHistory.length === 0 ? (
            <p className="px-2 py-3 text-xs text-slate-500">No matches for &ldquo;{searchQuery}&rdquo;.</p>
          ) : (
            <div className="space-y-1.5">
              {filteredHistory.map((record) => {
                const isSelected = activeRecordId === record.id;
                return (
                  <div
                    key={record.id}
                    className={`group relative rounded-lg border transition-colors duration-150 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-200'
                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectHistory(record);
                        onCloseMobile();
                      }}
                      className="w-full text-left px-3 py-2.5 pr-8 focus-visible:outline-2 focus-visible:outline-blue-600 rounded-lg"
                    >
                      <div className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug">
                        {record.decision}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-mono tabular-nums">{formatDate(record.createdAt)}</span>
                        {record.chosenOption && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-blue-700 font-medium truncate max-w-[130px]">
                              {record.chosenOption}
                            </span>
                          </>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHistory(record.id)}
                      aria-label={`Delete decision: ${record.decision}`}
                      className="absolute right-2 top-2.5 p-1 text-slate-400 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-rose-600 rounded transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-[272px] shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
        {content}
      </aside>

      {/* Mobile slide-over drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10 shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
