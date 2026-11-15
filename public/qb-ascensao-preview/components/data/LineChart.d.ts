/** Responsive line/area chart (SVG) for accuracy over time. Points with n < minSample are hollow; null y = gap (no data). Each point has a <title> with value and n. */
export interface LineChartProps {
  data: { x: string; y: number | null; n?: number }[];
  /** px, default 220 */
  height?: number;
  yMax?: number;
  yTicks?: number[];
  format?: (v: number) => string;
  /** default 10 */
  minSample?: number;
  /** aria-label */
  label?: string;
  color?: string;
  style?: React.CSSProperties;
}
export declare function LineChart(props: LineChartProps): JSX.Element;
