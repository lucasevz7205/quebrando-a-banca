import type { IconName } from '../core/Icon';

export type PerformanceAction = 'train' | 'mindmap' | 'review' | 'architect';

export interface PerformanceNode {
  /** Unique id. For topics it must equal `topicId`. */
  id: string;
  level: 'subject' | 'group' | 'topic';
  name: string;
  /** Edital code shown in mono (e.g. "10.6"); subject short name for level 'subject'. */
  code?: string;
  icon?: IconName;
  /** True when the title is missing in the source; rendered muted/italic. */
  untitled?: boolean;
  correct: number;
  wrong: number;
  blank?: number;
  subjectId: string;
  topicId?: string;
  /** Exact mind-map node, forwarded in the action payload when present. */
  nodeId?: string;
  /** Only actions with a REAL destination; omitted actions are not rendered. */
  actions?: PerformanceAction[];
  children?: PerformanceNode[];
}

/** Expandable hierarchy Matéria → Assunto → Tópico with accuracy, counts, semantic badge and contextual actions. Percent = correct ÷ (correct + wrong); nodes without valid answers show "Sem respostas", never 0%. Expansion state survives data changes. Keyboard: Tab/Enter/Space, ← → collapse/expand, ↑ ↓ Home End move between rows. */
export interface SubjectPerformanceExplorerProps {
  nodes: PerformanceNode[];
  /** Payload mirrors the navigation Intent; also exposed as data-action / data-subject-id / data-topic-id / data-node-id. */
  onAction?: (intent: { action: PerformanceAction; subjectId: string; topicId: string; nodeId?: string }) => void;
  /** Expands the ancestors of a topic and focuses its row; change `token` to trigger again. */
  reveal?: { subjectId: string; topicId: string; token: number | string } | null;
  /** Below this many valid answers the badge is "Amostra pequena". default 20 */
  minSample?: number;
  /** Accuracy threshold of the "Abaixo de N%" badge. default 60 */
  lowBelow?: number;
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  style?: React.CSSProperties;
}
export declare function SubjectPerformanceExplorer(props: SubjectPerformanceExplorerProps): JSX.Element;
