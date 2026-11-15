import type { IconName } from '../core/Icon';

export interface PerformancePriority {
  id: string;
  /** Evidence category, e.g. "Erros recorrentes", "Baixa precisão", "Pendências vencidas", "Revisões necessárias". */
  kind: string;
  tone?: 'neutral' | 'gold' | 'correct' | 'incorrect' | 'attention' | 'no-evidence';
  /** What to act on (topic label or pluralised count). */
  title: string;
  /** Verifiable reason with the numbers that triggered it. Required. */
  reason: string;
  /** Destination is resolved by the host in `onAction`; extra fields (intent, go, open…) travel on the item. */
  action?: { label: string; icon?: IconName; [key: string]: unknown };
}

/** Ordered list of evidence-based study priorities. Renders an informative empty state when `items` is empty — the host must NOT create priorities from metrics without records. */
export interface PerformancePriorityPanelProps {
  items: PerformancePriority[];
  onAction?: (item: PerformancePriority) => void;
  title?: string;
  /** Period the evidence comes from, e.g. "Base: 08/11 a 14/11". */
  basis?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  style?: React.CSSProperties;
}
export declare function PerformancePriorityPanel(props: PerformancePriorityPanelProps): JSX.Element;
