import type { IconName } from '../core/Icon';

/** Accessible tab list (role=tablist, arrow-key navigation). Pill = segmented sub-views (Hoje/Semana/Ciclos); underline = in-panel tabs. */
export interface TabsProps {
  items: { id: string; label: string; icon?: IconName; count?: number }[];
  value: string;
  onChange?: (id: string) => void;
  /** default 'pill' */
  variant?: 'pill' | 'underline';
  /** aria-label */
  label?: string;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
