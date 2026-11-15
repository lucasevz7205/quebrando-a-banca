/**
 * Brand lockups. Image variants use the supplied art (never redrawn); text variants set the wordmark in Cinzel / Cormorant.
 */
export interface BrandLogoProps {
  /** q-full = Q-sword logo art (screen-blended, dark grounds only; no 'A Ascensão') · horizontal = mark + title-case lockup (headers) · wordmark = Cinzel caps + ruled subtitle · vertical = full emblem art · app-icon · mark. Default 'horizontal' */
  variant?: 'horizontal' | 'wordmark' | 'q-full' | 'vertical' | 'app-icon' | 'mark';
  /** Height in px (wordmark: cap size). Default 40 */
  size?: number;
  /** Reduced symbol for variant="mark". Default 'q-sword'. Check recognition at 24–32px */
  mark?: 'q-sword' | 'sword' | 'mountain' | 'mountain-ribbon';
  /** wordmark only: ruled subtitle under the name (e.g. a future 'A Ascensão' journey). Omitted by default — the main brand is just 'Quebrando a Banca' */
  subtitle?: string;
  /** wordmark only: adds "Conhecimento · Estratégia · Disciplina · Conquista" */
  showMotto?: boolean;
  /** wordmark only */
  align?: 'start' | 'center';
  style?: React.CSSProperties;
}
export declare function BrandLogo(props: BrandLogoProps): JSX.Element;
