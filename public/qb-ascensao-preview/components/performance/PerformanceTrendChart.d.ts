export interface PerformanceTrendPoint {
  /** Stable bucket key (ISO date, week start or YYYY-MM). */
  key: string;
  /** Axis label, e.g. "14/11". */
  label: string;
  /** Tooltip heading, e.g. "sábado, 14/11/2026". */
  longLabel?: string;
  correct: number;
  wrong: number;
  blank?: number;
}

/** Accuracy over time. Percent = correct ÷ (correct + wrong), computed here. Buckets with no valid answers get no point and break the line (nothing is interpolated). Keyboard: focus the chart, then ← → Home End Esc. Includes text summary and a data table. */
export interface PerformanceTrendChartProps {
  /** One entry per bucket of the period, INCLUDING buckets without records (zeros). */
  data: PerformanceTrendPoint[];
  /** Previous period aligned by index; null when there is no valid base. */
  previous?: PerformanceTrendPoint[] | null;
  currentLabel?: string;
  previousLabel?: string;
  /** Shown when `previous` is missing, e.g. "Sem registros no período anterior". */
  previousNote?: string;
  granularity?: string;
  granularities?: { id: string; label: string }[];
  onGranularity?: (id: string) => void;
  /** default 260 */
  height?: number;
  /** Below this many valid answers the marker is hollow. default 10 */
  minSample?: number;
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}
export declare function PerformanceTrendChart(props: PerformanceTrendChartProps): JSX.Element;
