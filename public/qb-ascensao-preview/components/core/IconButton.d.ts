import type { IconName } from './Icon';

/** Square 44px icon-only control (header tools, map zoom, drawer close). Always labelled. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required accessible name, also used as tooltip */
  label: string;
  /** default 'ghost' */
  variant?: 'ghost' | 'outline' | 'solid';
  /** md 44px (default) · sm 36px */
  size?: 'sm' | 'md';
  round?: boolean;
  /** Notification count — ribbon-red pill */
  count?: number;
  /** Toggle state (e.g. focus mode) */
  pressed?: boolean;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
