/**
 * Bulk schedule adjustments with mandatory preview → apply / cancel → undo. Actions: puxar próximas N para o dia, distribuir na semana, trazer atrasadas para hoje, aliviar o dia, redistribuir pendências, editar cronograma. Quantity selector.
 * Rules shown in copy: nothing is completed, deleted or duplicated; automatic reviews are not moved.
 */
export interface ReschedulePreview {
  action: 'pull' | 'spread' | 'late' | 'relieve' | 'redistribute';
  description: string;
  changes: { id: string; title: string; from: string; to: string }[];
  /** Automatic reviews left untouched */
  skipped?: number;
}
export interface RescheduleActionsProps {
  /** e.g. "sáb 14/11" */
  dayLabel: string;
  quantity?: number;
  onQuantity?: (n: number) => void;
  /** late = overdue tasks, day = movable tasks on selected day, week = pending this week */
  counts?: { late?: number; day?: number; week?: number };
  preview?: ReschedulePreview | null;
  onPreview?: (action: ReschedulePreview['action']) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Message after applying, enables Desfazer */
  lastApplied?: string | null;
  onUndo?: () => void;
  onEdit?: () => void;
  style?: React.CSSProperties;
}
export declare function RescheduleActions(props: RescheduleActionsProps): JSX.Element;
