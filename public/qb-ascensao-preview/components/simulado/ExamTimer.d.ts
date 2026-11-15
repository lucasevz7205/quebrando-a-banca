/** Countdown display (mono h:mm:ss) with remaining-time bar; switches to ember + text warning under 10%. Controlled: the screen owns the clock. */
export interface ExamTimerProps {
  /** Seconds left */
  remaining: number;
  /** Total seconds (enables bar + warning) */
  total?: number;
  paused?: boolean;
  label?: string;
  style?: React.CSSProperties;
}
export declare function ExamTimer(props: ExamTimerProps): JSX.Element;
