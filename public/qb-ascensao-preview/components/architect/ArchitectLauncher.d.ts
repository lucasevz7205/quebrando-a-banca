/** Global compact access to O Arquiteto: floating pill → quick panel (context, 4 quick tools, "Abrir estúdio completo"). Present on every screen; preserves the current context. */
export interface ArchitectLauncherProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** e.g. "Q 0412 · DA 10.6 Papel do fiscalizador" */
  contextLabel?: string;
  onExpand?: () => void;
  /** Quick tool picked: socratico | retencao | feynman | pomodoro */
  onQuick?: (id: string) => void;
  style?: React.CSSProperties;
}
export declare function ArchitectLauncher(props: ArchitectLauncherProps): JSX.Element;
