import type { IconName } from '../core/Icon';

export interface BrandHeaderItem { id: string; label: string; icon?: IconName }

/**
 * App header from the brand sheet: sword-and-ribbon art at left, "Quebrando a Banca / A Ascensão" lockup, nav, search · bell · stats · profile.
 * `compact` is the 56px study-mode bar with a context slot.
 * @startingPoint section="Navigation" subtitle="Full and compact (study) headers" viewport="1100x200"
 */
export interface BrandHeaderProps {
  /** default 'full' */
  variant?: 'full' | 'compact';
  items?: BrandHeaderItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
  /** Unread count on the bell */
  notifications?: number;
  user?: { name: string; initials?: string };
  onSearch?: () => void;
  onNotifications?: () => void;
  onStats?: () => void;
  onProfile?: () => void;
  /** compact only — shows close button */
  onExit?: () => void;
  /** compact only — context content (subject, progress…) */
  children?: React.ReactNode;
  /** Rounded framed bar (default) vs flush full-width */
  floating?: boolean;
  style?: React.CSSProperties;
}
export declare function BrandHeader(props: BrandHeaderProps): JSX.Element;
