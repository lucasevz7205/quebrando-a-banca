/** Session bar: subject overline, topic, "Questão N de M" progress, mono timer, pause and focus-mode toggles. */
export interface StudySessionHeaderProps {
  /** e.g. "Direito Constitucional" */
  subject: string;
  /** e.g. "Processo legislativo — emendas à Constituição" */
  topic: string;
  current?: number;
  total?: number;
  /** Progress noun, default 'Questão' (use 'Cartão' for flashcards) */
  unit?: string;
  /** Seconds */
  elapsed?: number;
  focusMode?: boolean;
  onToggleFocus?: () => void;
  onBack?: () => void;
  paused?: boolean;
  onTogglePause?: () => void;
  style?: React.CSSProperties;
}
export declare function StudySessionHeader(props: StudySessionHeaderProps): JSX.Element;
