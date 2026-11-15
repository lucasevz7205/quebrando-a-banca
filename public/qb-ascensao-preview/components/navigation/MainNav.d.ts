import type { IconName } from '../core/Icon';

export interface MainNavItem {
  id: string;
  label: string;
  icon?: IconName;
  /** Pending count badge (e.g. Treinar 50) */
  count?: number;
  /** Quick-access sub view rendered as a pill inside the item (e.g. Planejamento → Hoje) */
  quick?: { id: string; label: string };
}

/**
 * Framed primary navigation bar (double gold border, pill items). Destinations: Menu principal, Planejamento (+Hoje), Edital, Treinar, Estudo, Simulado, Desempenho.
 * Compact (topo compacto) and collapsed (recolhido) states. Labels hide under 760px; the item row scrolls horizontally.
 * @startingPoint section="Navigation" subtitle="Primary module navigation with quick 'Hoje'" viewport="1200x120"
 */
export interface MainNavProps {
  items: MainNavItem[];
  activeId?: string;
  /** Active quick view id (e.g. 'hoje') */
  activeQuick?: string;
  onNavigate?: (id: string, quickId?: string) => void;
  /** Topo compacto: 38px items */
  compact?: boolean;
  /** Recolhido: slim bar with current section + expand */
  collapsed?: boolean;
  onExpand?: () => void;
  /** Left slot (brand mark) */
  leading?: React.ReactNode;
  /** Right slot (avatar) */
  trailing?: React.ReactNode;
  label?: string;
  style?: React.CSSProperties;
}
export declare function MainNav(props: MainNavProps): JSX.Element;
