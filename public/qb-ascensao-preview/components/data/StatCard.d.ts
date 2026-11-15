import type { IconName } from '../core/Icon';

/** Indicator card: label, big tabular value, detail line with the underlying counts, optional trend, method note and small-sample warning. No coloured left borders. */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Underlying numbers, e.g. "205 certos · 42 errados · 1 em branco" */
  detail?: React.ReactNode;
  icon?: IconName;
  /** Colours the value only. default 'neutral' */
  tone?: 'neutral' | 'gold' | 'correct' | 'incorrect';
  /** delta sign drives icon + colour; label e.g. "−2 p.p." */
  trend?: { delta: number; label: string };
  /** Method/explanation tooltip */
  note?: string;
  /** e.g. "Amostra pequena (n = 6)" or "Definição pendente" */
  warning?: string;
  onClick?: () => void;
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
