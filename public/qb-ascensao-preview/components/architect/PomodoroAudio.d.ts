/** Pomodoro (focus/break phases, start/pause/reset/skip, cycle count) + background audio controls (play/pause, type, volume) — audio is simulated; copy makes no medical/cognitive claims. */
export interface PomodoroAudioProps {
  /** default 25 */
  focusMin?: number;
  /** default 5 */
  breakMin?: number;
  style?: React.CSSProperties;
}
export declare function PomodoroAudio(props: PomodoroAudioProps): JSX.Element;
