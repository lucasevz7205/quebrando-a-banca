/**
 * One of the four brand symbols as a journey milestone. Always tied to an explicit, stated rule — never a substitute for performance data.
 * @startingPoint section="Brand" subtitle="Soldado · Sábio · Estrategista · Ascensão milestones" viewport="700x260"
 */
export interface AchievementEmblemProps {
  /** default 'soldado' */
  variant?: 'soldado' | 'sabio' | 'estrategista' | 'ascensao';
  /** default 'earned' */
  state?: 'earned' | 'in-progress' | 'locked';
  /** Plaque width px, default 112 */
  size?: number;
  /** 0–1, shown when state="in-progress" */
  progress?: number;
  /** Explicit unlock rule, e.g. "7 dias seguidos com sessão concluída" */
  rule?: string;
  showLabel?: boolean;
  style?: React.CSSProperties;
}
export declare function AchievementEmblem(props: AchievementEmblemProps): JSX.Element;
