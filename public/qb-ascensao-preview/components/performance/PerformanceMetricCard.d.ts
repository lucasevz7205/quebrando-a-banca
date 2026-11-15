import type { IconName } from '../core/Icon';

/** Analytic indicator card for Desempenho. Shows the value only when `state` is 'ok'; a zero denominator must be passed as state 'empty' (never "0/0"), an undefined metric as 'pending'. */
export interface PerformanceMetricCardProps {
  label: string;
  icon?: IconName;
  /** Main value, already formatted (e.g. "83%", "+163", 248). Ignored unless state is 'ok'. */
  value?: React.ReactNode;
  unit?: string;
  /** Colours the value only. default 'neutral' */
  tone?: 'neutral' | 'gold' | 'correct' | 'incorrect';
  /** One-line calculation rule, always visible. */
  formula?: string;
  /** Counts behind the value, e.g. "205 de 247 respostas válidas". */
  detail?: React.ReactNode;
  /** Keeps acertos / erros / brancos / não realizadas distinct. */
  breakdown?: { label: string; value: React.ReactNode; tone?: 'correct' | 'incorrect' | 'neutral' }[];
  /** Pass only when the comparison base has valid answers; null/undefined hides it. */
  comparison?: { delta: number; label: string } | null;
  /** 'empty' = no records in scope; 'pending' = formula or source data not defined yet. default 'ok' */
  state?: 'ok' | 'empty' | 'pending';
  stateText?: string;
  warning?: string;
  /** Longer methodology text behind the info button (keyboard accessible disclosure). */
  method?: string;
  action?: { label: string; onClick: () => void };
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function PerformanceMetricCard(props: PerformanceMetricCardProps): JSX.Element;
