import type { IconName } from '../core/Icon';

/** Secondary global controls as small chips: sync STATUS (not a button), O Arquiteto, Modo foco toggle, Preferências menu (Fundo, Tema), Ferramentas menu, collapse. Every control has label + icon + selected state + keyboard support. */
export interface GlobalToolbarProps {
  /** Status indicator only. default 'ok' */
  sync?: 'ok' | 'syncing' | 'offline';
  /** Shown as "Tentar novamente" only while offline */
  onSync?: () => void;
  /** Preferências › Fundo. dynamic = cinematic scene · static = flat navy. Default 'dynamic' */
  background?: 'dynamic' | 'static';
  onBackground?: (v: 'dynamic' | 'static') => void;
  /** Preferências › Tema. dark (default) or high-contrast */
  theme?: 'dark' | 'contrast';
  onTheme?: (v: 'dark' | 'contrast') => void;
  /** Modo foco: host reduces decoration (scene, wordmark, header height). Chip rendered only when onFocusMode is given. */
  focusMode?: boolean;
  onFocusMode?: (v: boolean) => void;
  /** Items of the Ferramentas menu */
  tools?: { id: string; label: string; icon?: IconName }[];
  onTool?: (id: string) => void;
  collapsed?: boolean;
  onCollapse?: () => void;
  /** Shows the global "O Arquiteto" chip */
  onArchitect?: () => void;
  style?: React.CSSProperties;
}
export declare function GlobalToolbar(props: GlobalToolbarProps): JSX.Element;
