/** Linear progress with label + numeric value text (progress never shown by color alone). */
export interface ProgressBarProps {
  /** 0–1 */
  value: number;
  label?: string;
  /** Replaces the default "NN%" e.g. "4 de 20" */
  valueText?: string;
  /** default 'progress' (gold-bright) */
  tone?: 'progress' | 'gold' | 'correct';
  /** sm 4px · md 6px · lg 10px */
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
