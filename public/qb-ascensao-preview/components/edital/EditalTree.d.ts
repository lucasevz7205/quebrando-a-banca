import type { EditalSubject, EditalTopic } from './HeatmapGrid';

/**
 * Verticalised edital: subject rows (block, topic count, accuracy %, coverage studied/total, responses) expand into assunto groups and topic rows.
 * Each TopicRow: original number, title (italic placeholder when not in source), study STATUS tag, accuracy chip + ✓/✗/○ counts, and contextual actions (estudar, questões, mapa, flashcards, O Arquiteto).
 * @startingPoint section="Edital" subtitle="Verticalised edital tree with status + accuracy" viewport="1000x560"
 */
export interface EditalTreeProps {
  subjects: EditalSubject[];
  /** Expanded subject ids */
  expanded?: string[];
  onToggle?: (subjectId: string) => void;
  /** Topic to highlight (e.g. after heat-map click) — rows carry data-topic-id for scrolling */
  highlightId?: string;
  onAction?: (action: 'study' | 'questions' | 'map' | 'flashcards' | 'architect', topic: EditalTopic) => void;
  /** "Evocar antes de ler": study action becomes recall-first */
  evokeFirst?: boolean;
  /** Optional assunto titles keyed "subjectId:groupNumber" */
  groupTitles?: Record<string, string>;
  style?: React.CSSProperties;
}
export declare function EditalTree(props: EditalTreeProps): JSX.Element;
export declare function TopicRow(props: { topic: EditalTopic; highlight?: boolean; evokeFirst?: boolean; onAction?: EditalTreeProps['onAction'] }): JSX.Element;
export declare function StatusTag(props: { status: EditalTopic['status'] }): JSX.Element;
export declare function subjectStats(s: EditalSubject): { correct: number; wrong: number; blank: number; answered: number; valid: number; accuracy: number | null; studied: number; total: number; coverage: number };
export declare const STUDY_STATUS: Record<EditalTopic['status'], { label: string; icon: string; color: string }>;
