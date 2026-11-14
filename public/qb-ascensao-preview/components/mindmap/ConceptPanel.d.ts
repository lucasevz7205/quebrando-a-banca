/** Side panel for a mind-map node: breadcrumb, title, mastery evidence, summary, example, connections, active review CTA, sources, and a "return to question" bar preserving context. */
export interface ConceptPanelProps {
  title: string;
  /** Breadcrumb ancestors */
  path?: string[];
  mastery?: { state: 'correct' | 'incorrect' | 'no-evidence' | 'progress'; text: string };
  summary?: React.ReactNode;
  example?: React.ReactNode;
  connections?: { id: string; label: string; /** e.g. "difere de" */ relation?: string }[];
  /** Legal / doctrinal references (mono) */
  sources?: string[];
  onNavigate?: (id: string) => void;
  onReview?: () => void;
  reviewCount?: number;
  /** e.g. "questão Q 0412" — shows the return bar */
  returnTo?: string;
  onReturn?: () => void;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function ConceptPanel(props: ConceptPanelProps): JSX.Element;
