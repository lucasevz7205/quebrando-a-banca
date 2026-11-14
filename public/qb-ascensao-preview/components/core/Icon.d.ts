export type IconName =
  | 'search'
  | 'bell'
  | 'chart-column'
  | 'circle-user'
  | 'house'
  | 'network'
  | 'layers'
  | 'list-checks'
  | 'message-circle'
  | 'clock'
  | 'focus'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'x'
  | 'check'
  | 'circle-check'
  | 'circle-x'
  | 'triangle-alert'
  | 'rotate-ccw'
  | 'link'
  | 'book-open'
  | 'zoom-in'
  | 'zoom-out'
  | 'maximize'
  | 'list'
  | 'arrow-right'
  | 'arrow-left'
  | 'skip-forward'
  | 'flag'
  | 'lightbulb'
  | 'send'
  | 'target'
  | 'brain'
  | 'settings'
  | 'menu'
  | 'plus'
  | 'minus'
  | 'circle-help'
  | 'info'
  | 'eye'
  | 'eye-off'
  | 'moon'
  | 'sun'
  | 'calendar'
  | 'trophy'
  | 'pause'
  | 'play'
  | 'corner-up-left'
  | 'bookmark'
  | 'sparkles'
  | 'scale'
  | 'gavel'
  | 'landmark'
  | 'loader-circle'
  | 'circle-dashed'
  | 'map'
  | 'user'
  | 'lock'
  | 'flame'
  | 'timer'
  | 'history'
  | 'coffee'
  | 'log-out'
  | 'repeat'
  | 'file-text'
  | 'locate-fixed'
  | 'shield-alert';

/** Lucide outline glyph, stroke 1.75, inherits currentColor. Decorative unless `label` is given. */
export interface IconProps {
  name: IconName;
  /** px, default 20 */
  size?: number;
  /** default 1.75 */
  strokeWidth?: number;
  color?: string;
  /** Accessible label; omit for decorative icons next to text */
  label?: string;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Icon(props: IconProps): JSX.Element | null;
export declare const ICON_NAMES: IconName[];
