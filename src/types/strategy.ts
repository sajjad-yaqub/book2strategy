export interface StrategyCard {
  id: string;
  headline: string;
  story: string;
  snepoa: {
    stimuli: string;
    novelty: string;
    evolutionary_filters: string;
    pre_existing_substrate: string;
    outcome: string;
    action: string;
  };
  pl_impact: string;
  urgent_action: string;
}

export type AppPhase = 'upload' | 'analyzing' | 'swiping' | 'complete';
