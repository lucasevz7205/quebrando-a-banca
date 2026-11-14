/**
 * CEBRASPE Certo/Errado item: metadata, statement at reading size, C/E choices, confidence, and post-answer result with remission to the concept.
 * @startingPoint section="Questions" subtitle="CEBRASPE Certo/Errado item with confidence" viewport="760x520"
 */
export interface QuestionCardProps {
  /** e.g. "Q 0412" (mono) */
  code?: string;
  /** default 'CEBRASPE' */
  board?: string;
  year?: number | string;
  /** e.g. "Câmara dos Deputados · Analista Legislativo" */
  exam?: string;
  tags?: string[];
  statement: React.ReactNode;
  /** Optional associated text block */
  context?: React.ReactNode;
  answer?: 'C' | 'E' | null;
  onAnswer?: (a: 'C' | 'E') => void;
  confidence?: 'baixa' | 'media' | 'alta' | null;
  onConfidence?: (c: 'baixa' | 'media' | 'alta') => void;
  /** Ask confidence after choosing, before confirming. Default true */
  showConfidence?: boolean;
  /** Set to reveal the result (locks choices) */
  answerKey?: 'C' | 'E' | null;
  /** Remission to exact mind-map node, shown after reveal */
  conceptLink?: { label: string; onClick?: () => void };
  bookmarked?: boolean;
  onBookmark?: () => void;
  style?: React.CSSProperties;
}
export declare function QuestionCard(props: QuestionCardProps): JSX.Element;
