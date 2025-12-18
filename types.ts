
export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export type CalcMode = 'basic' | 'scientific';

/**
 * Interface for AI-generated mathematical explanations.
 */
export interface AIExplanation {
  stepByStep: string[];
  concept: string;
  realWorldUsage: string;
}
