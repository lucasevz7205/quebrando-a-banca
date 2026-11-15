/** Simple vertical bar chart (HTML) with value label on top and category below. null value = "—" placeholder bar. */
export interface BarChartProps {
  data: { label: string; value: number | null; title?: string; color?: string; muted?: boolean }[];
  /** px, default 160 */
  height?: number;
  max?: number;
  format?: (v: number) => string;
  color?: string;
  label?: string;
  style?: React.CSSProperties;
}
export declare function BarChart(props: BarChartProps): JSX.Element;
