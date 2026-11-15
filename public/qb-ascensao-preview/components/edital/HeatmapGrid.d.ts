export interface EditalTopic {
  id: string;
  /** Original edital numbering, e.g. "4.2", "2a" */
  num: string;
  title?: string;
  /** Title available in source files (false = demo placeholder) */
  known?: boolean;
  status: 'not-started' | 'studying' | 'reviewing' | 'mastered';
  correct: number;
  wrong: number;
  blank?: number;
}
export interface EditalSubject {
  id: string;
  name: string;
  short?: string;
  /** e.g. "P1" */
  block: string;
  blockLabel?: string;
  icon?: string;
  topics: EditalTopic[];
}

/**
 * Accuracy heat map: one row per subject, one clickable cell per topic (original number). 6 bands (<60, 60–74, 75–84, 85–89, ≥90, sem respostas) with distinct fill/outline/dashed treatments; every cell has an aria-label with %, counts and band.
 * Shows ACCURACY only — study status is shown elsewhere (EditalTree).
 * @startingPoint section="Edital" subtitle="Per-topic accuracy heat map" viewport="1000x420"
 */
export interface HeatmapGridProps {
  subjects: EditalSubject[];
  selectedTopicId?: string;
  onSelect?: (subjectId: string, topicId: string) => void;
  style?: React.CSSProperties;
}
export declare function HeatmapGrid(props: HeatmapGridProps): JSX.Element;
/** Single cell */
export declare function HeatmapCell(props: { topic: EditalTopic; subjectName: string; selected?: boolean; onClick?: () => void }): JSX.Element;
/** accuracy = correct ÷ (correct + wrong); blanks excluded */
export declare function heatTier(correct?: number, wrong?: number): { tier: 1 | 2 | 3 | 4 | 5 | 'none'; pct: number | null; n: number };
export declare const HEAT_TIERS: { id: number | 'none'; label: string; short: string }[];
