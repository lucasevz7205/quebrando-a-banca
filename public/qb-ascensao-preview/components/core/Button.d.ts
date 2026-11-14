import type { IconName } from './Icon';

/**
 * Primary action control. Gold = main path, secondary = bronze outline, ghost = tertiary, crimson = ceremonial/destructive.
 * @startingPoint section="Core" subtitle="Gold / outline / ghost / crimson buttons" viewport="700x300"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'crimson';
  /** sm 36px · md 44px · lg 52px. Default 'md' */
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  /** Shows spinner, disables, sets aria-busy */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
