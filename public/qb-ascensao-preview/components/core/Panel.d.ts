/** Card surface: navy-raised, bronze hairline, 18px radius. Ornate adds the gold border used for milestones. */
export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  /** default 'raised' */
  variant?: 'raised' | 'sunken' | 'glass' | 'ornate';
  /** px or CSS value, default 24 */
  padding?: number | string;
  as?: keyof JSX.IntrinsicElements;
  /** Hover/focus affordance for clickable cards */
  interactive?: boolean;
  children?: React.ReactNode;
}
export declare function Panel(props: PanelProps): JSX.Element;
