/**
 * Cinematic panorama banner (day / night / sunset citadel) with a left protection gradient so text stays ≥ 4.5:1.
 * Use on welcome + dashboard header only — never inside question, flashcard or review flows.
 * @startingPoint section="Brand" subtitle="Cinematic citadel banner with protected copy" viewport="1100x380"
 */
export interface HeroAscensionProps {
  /** default 'night' */
  scene?: 'night' | 'day' | 'sunset';
  /** Small gold overline */
  eyebrow?: string;
  /** Cinzel ceremonial title */
  title?: string;
  /** Cormorant italic line */
  subtitle?: string;
  /** Action buttons */
  children?: React.ReactNode;
  /** px, default 360 */
  height?: number;
  /** Where the citadel sits; text always left. Default 'right' */
  focal?: 'left' | 'center' | 'right';
  /** 'strong' (default) for busy scenes, 'soft' when copy is short */
  overlay?: 'strong' | 'soft';
  radius?: string | number;
  style?: React.CSSProperties;
}
export declare function HeroAscension(props: HeroAscensionProps): JSX.Element;
