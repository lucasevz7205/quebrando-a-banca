import type { IconName } from './Icon';

/** Small pill label. State tones auto-attach an icon so meaning never relies on color alone. */
export interface BadgeProps {
  /** default 'neutral'. correct/incorrect/no-evidence/attention add an icon automatically */
  tone?: 'neutral' | 'gold' | 'correct' | 'incorrect' | 'no-evidence' | 'attention' | 'crimson';
  /** Override icon; pass null to suppress the automatic state icon */
  icon?: IconName | null;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
