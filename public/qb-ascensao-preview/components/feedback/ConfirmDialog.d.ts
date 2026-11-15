/** Modal confirmation (alertdialog): focus starts on Cancel, Esc / backdrop cancel. tone="danger" uses crimson confirm + trash icon (e.g. "Limpar histórico", "Finalizar simulado"). */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** default 'default' */
  tone?: 'default' | 'danger';
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Extra content, e.g. a summary of unanswered items */
  children?: React.ReactNode;
}
export declare function ConfirmDialog(props: ConfirmDialogProps): JSX.Element | null;
