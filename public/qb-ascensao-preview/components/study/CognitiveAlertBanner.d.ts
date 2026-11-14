/**
 * Non-diagnostic nudge about fatigue, attention or a frequent trap. States observable facts ("52 min sem pausa"), never a fictitious diagnosis.
 */
export interface CognitiveAlertBannerProps {
  /** fatigue = pause nudge · attention = reading/attention cue · trap = known Cebraspe trap · info = tip. Default 'fatigue' */
  tone?: 'fatigue' | 'attention' | 'trap' | 'info';
  title?: string;
  children?: React.ReactNode;
  /** Buttons (sm) */
  actions?: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}
export declare function CognitiveAlertBanner(props: CognitiveAlertBannerProps): JSX.Element;
