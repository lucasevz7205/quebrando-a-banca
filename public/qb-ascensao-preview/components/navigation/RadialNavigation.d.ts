import type { IconName } from '../core/Icon';

export interface RadialItem { id: string; label: string; icon: IconName; /** e.g. "38 pendentes" */ meta?: string }

/**
 * Radial dashboard: study shortcuts orbit a central progress seal. Falls back to an accessible linear list when the container is narrower than `size`.
 * @startingPoint section="Navigation" subtitle="Radial dashboard with progress seal + list fallback" viewport="700x560"
 */
export interface RadialNavigationProps {
  items: RadialItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  /** Central seal: value 0–1 renders a gold ring + %, label in Cormorant italic */
  center?: { value?: number; overline?: string; label?: string };
  /** Diameter px, default 520 */
  size?: number;
  /** default 'auto' (list below `size` width) */
  layout?: 'auto' | 'radial' | 'list';
  /** Faint bronze-disc artifact behind the seal. Default true */
  artifact?: boolean;
  style?: React.CSSProperties;
}
export declare function RadialNavigation(props: RadialNavigationProps): JSX.Element;
