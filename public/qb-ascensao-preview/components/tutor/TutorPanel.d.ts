export interface TutorMessage {
  role: 'tutor' | 'user';
  text: React.ReactNode;
  /** Remission chips to questions / map nodes */
  refs?: { id: string; label: string; kind?: 'question' | 'concept' }[];
}

/**
 * Contextual AI-tutor conversation panel with explicit demo labelling, context chip, suggestion chips and remission references.
 * @startingPoint section="Tutor" subtitle="Contextual tutor chat with honest demo state" viewport="560x620"
 */
export interface TutorPanelProps {
  messages: TutorMessage[];
  onSend?: (text: string) => void;
  /** Quick prompts, e.g. "Explique com um exemplo" */
  suggestions?: string[];
  /** e.g. "Q 0412 · Limites formais" */
  contextLabel?: string;
  /** Shows "Demonstração" badge + footnote. Keep true until a real model is connected. Default true */
  demo?: boolean;
  /** Typing indicator */
  thinking?: boolean;
  onRef?: (id: string) => void;
  onClose?: () => void;
  /** default 'Tutor' */
  title?: string;
  style?: React.CSSProperties;
}
export declare function TutorPanel(props: TutorPanelProps): JSX.Element;
