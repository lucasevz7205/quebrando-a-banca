/**
 * Brand lockups. Image variants use the supplied art (never redrawn); text variants set the wordmark in Cinzel / Cormorant.
 */
export interface BrandLogoProps {
  /** horizontal = mark + title-case lockup (headers) · wordmark = Cinzel caps + ruled subtitle · vertical = full emblem art · app-icon · mark. Default 'horizontal' */
  variant?: 'horizontal' | 'wordmark' | 'vertical' | 'app-icon' | 'mark';
  /** Height in px (wordmark: cap size). Default 40 */
  size?: number;
  /** Reduced symbol for variant="mark". Default 'q-sword'. Check recognition at 24–32px */
  mark?: 'q-sword' | 'sword' | 'mountain' | 'mountain-ribbon';
  /** wordmark only: adds "Conhecimento · Estratégia · Disciplina · Conquista" */
  showMotto?: boolean;
  /** wordmark only */
  align?: 'start' | 'center';
  style?: React.CSSProperties;
}
export declare function BrandLogo(props: BrandLogoProps): JSX.Element;
