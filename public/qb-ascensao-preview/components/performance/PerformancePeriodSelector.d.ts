/** Period control of the Desempenho filters. 'day' = one date with previous/next/today; 'range' = from/to plus quick presets. Dates are ISO `YYYY-MM-DD`; values outside [min, max] are never emitted. */
export interface PerformancePeriodSelectorProps {
  /** default 'day' */
  mode?: 'day' | 'range';
  /** `{ date }` in day mode, `{ from, to }` in range mode. */
  value: { date?: string; from?: string; to?: string };
  /** First date with records. */
  min?: string;
  /** Last selectable date (normally today). */
  max?: string;
  /** Enables the "Hoje" shortcut in day mode. */
  today?: string;
  /** Range presets, e.g. { id: '7', label: '7 dias', from, to }. */
  presets?: { id: string; label: string; from: string; to: string }[];
  /** Emits `{ date }` or `{ from, to }` (from ≤ to guaranteed). */
  onChange?: (value: { date?: string; from?: string; to?: string }) => void;
  style?: React.CSSProperties;
}
export declare function PerformancePeriodSelector(props: PerformancePeriodSelectorProps): JSX.Element;
