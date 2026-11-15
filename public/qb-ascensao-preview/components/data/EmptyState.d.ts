import type { IconName } from '../core/Icon';

/** Honest no-data / small-sample / error / unavailable / pending-definition state. */
export interface EmptyStateProps {
  /** default 'empty' */
  tone?: 'empty' | 'small-sample' | 'error' | 'unavailable' | 'pending';
  icon?: IconName;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Inline row layout */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
