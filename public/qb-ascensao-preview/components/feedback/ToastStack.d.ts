/** Fixed notification stack (polite live region). Tones success/info/warning/error with icon; optional action (e.g. "Desfazer"); auto-dismiss unless sticky. */
export interface ToastItem { id: string | number; tone?: 'success' | 'info' | 'warning' | 'error'; title: string; message?: string; action?: { label: string; onClick: () => void }; sticky?: boolean }
export interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: ToastItem['id']) => void;
  /** ms, default 5000 */
  duration?: number;
  position?: 'bottom-left' | 'bottom-right';
}
export declare function ToastStack(props: ToastStackProps): JSX.Element;
