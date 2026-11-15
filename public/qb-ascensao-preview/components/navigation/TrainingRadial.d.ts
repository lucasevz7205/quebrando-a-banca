import type { EditalSubject } from '../edital/HeatmapGrid';

export type TrainingActionId = 'train' | 'mindmap' | 'review' | 'architect';
/** Navigation intent emitted by level 3. Pass it untouched to the navigation service. */
export interface TrainingIntent { subjectId: string; topicId: string; action: TrainingActionId; nodeId?: string }
export interface TrainingSelection { subjectId: string | null; topicId: string | null }

/**
 * Three-level radial selector for Treinar: matérias → assuntos → 4 contextual actions (Treinar, Mapa Mental, Revisão Ativa, O Arquiteto).
 * Rings show accuracy only when valid answers exist (never invented); badges show pending activities from `pending`.
 * Controlled `value` keeps the context when the learner returns. Unknown ids never fall back to another item.
 * Radial ⇄ Lista toggle; automatic linear list when narrower than `size`. Esc goes up one level.
 */
export interface TrainingRadialProps {
  subjects: EditalSubject[];
  /** Controlled selection. Omit for uncontrolled. */
  value?: TrainingSelection;
  onChange?: (v: TrainingSelection) => void;
  onAction?: (intent: TrainingIntent) => void;
  /** topicId → pending activities (only real counts) */
  pending?: Record<string, number>;
  /** Per-action link data: nodeId to carry, availability and a short note (e.g. "5 questões", "Sem vínculo") */
  linkInfo?: (subjectId: string, topicId: string, action: TrainingActionId) => { nodeId?: string; available?: boolean; note?: string } | undefined;
  /** Diameter px, default 540 */
  size?: number;
  /** Nodes per radial page, default 9 */
  pageSize?: number;
  /** default 'auto' */
  layout?: 'auto' | 'radial' | 'list';
  /** Shown when a topic has no title in the source files */
  emptyTitle?: string;
  style?: React.CSSProperties;
}
export declare function TrainingRadial(props: TrainingRadialProps): JSX.Element;
export declare const TRAINING_ACTIONS: { id: TrainingActionId; label: string; icon: string; hint: string }[];
