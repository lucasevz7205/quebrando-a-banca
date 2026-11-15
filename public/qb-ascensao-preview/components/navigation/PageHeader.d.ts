/** Compact module header: gold overline, Georgia H1, one-line description, right-aligned actions. Replaces tall hero panels inside modules. */
export interface PageHeaderProps {
  overline?: string;
  title: string;
  description?: React.ReactNode;
  /** Right-side buttons / selectors */
  actions?: React.ReactNode;
  /** Extra content under the description (e.g. date selector) */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function PageHeader(props: PageHeaderProps): JSX.Element;
