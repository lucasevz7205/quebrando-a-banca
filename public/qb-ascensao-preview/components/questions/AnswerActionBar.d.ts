/** Bottom action bar for a question: confirm (disabled until answered), loading, then "Próxima questão"; review mark and optional skip. */
export interface AnswerActionBarProps {
  /** idle = nothing chosen (confirm disabled) · ready · loading · answered. Default 'idle' */
  state?: 'idle' | 'ready' | 'loading' | 'answered';
  /** Show "Pular" when the mode allows it. Default true */
  allowSkip?: boolean;
  onConfirm?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  onReview?: () => void;
  /** Shows "Ver fundamento" when answered */
  onOpenFeedback?: () => void;
  reviewMarked?: boolean;
  /** Keyboard hint text. Default true */
  showHints?: boolean;
  sticky?: boolean;
  style?: React.CSSProperties;
}
export declare function AnswerActionBar(props: AnswerActionBarProps): JSX.Element;
