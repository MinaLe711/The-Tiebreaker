export type ImpactLevel = 'High' | 'Medium' | 'Low';

export type AnalysisTab = 'proscons' | 'table' | 'swot' | 'weights';

export type GeminiModelOption = 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

export interface WeightedPoint {
  text: string;
  impact: ImpactLevel;
}

export interface OptionProsCons {
  option: string;
  pros: WeightedPoint[];
  cons: WeightedPoint[];
}

export interface ComparisonTableData {
  headers: string[];
  rows: string[][];
}

export interface SwotAnalysisData {
  subject: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface OptionDimensionScores {
  option: string;
  costEfficiency: number;
  timeFlexibility: number;
  riskSafety: number;
  upsideGrowth: number;
}

export interface VerdictData {
  recommendation: string;
  decisiveFactor: string;
  summary: string;
}

export interface DevilsAdvocateData {
  challengedOption: string;
  counterThesis: string;
  blindSpots: string[];
  stressTestQuestion: string;
}

export interface PriorityWeights {
  costEfficiency: number;
  timeFlexibility: number;
  riskSafety: number;
  upsideGrowth: number;
}

export interface DecisionAnalysis {
  options: string[];
  prosCons: OptionProsCons[];
  comparisonTable: ComparisonTableData;
  swot: SwotAnalysisData;
  priorityScores: OptionDimensionScores[];
  verdict: VerdictData;
  devilsAdvocate?: DevilsAdvocateData;
}

export interface DecisionPreset {
  id: string;
  title: string;
  category: string;
  decision: string;
  optionsInput: string;
  context: string;
  analysis: DecisionAnalysis;
}

export interface SavedDecisionRecord {
  id: string;
  decision: string;
  optionsInput: string;
  context: string;
  priorities: PriorityWeights;
  analysis: DecisionAnalysis;
  chosenOption?: string;
  outcomeNote?: string;
  createdAt: string;
  source: 'ai' | 'preset';
}
