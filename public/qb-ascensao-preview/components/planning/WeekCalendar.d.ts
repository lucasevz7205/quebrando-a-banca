import type { PlanTask } from './TaskCard';

export interface CalendarDay { date: string; weekday: string; dayNum: number | string; tasks: PlanTask[]; autoReviews?: number }

/**
 * 7-column week calendar: week navigation (+ "Semana atual"), day header with done/total + planned hours + completion bar, TaskCards with "+N tarefas" expansion, today/selected highlight, preview notes for pending reschedules. Scrolls horizontally on small screens.
 * @startingPoint section="Planning" subtitle="Week calendar with tasks and completion" viewport="1200x520"
 */
export interface WeekCalendarProps {
  days: CalendarDay[];
  /** ISO date of today */
  today?: string;
  selectedDate?: string;
  onSelectDay?: (date: string) => void;
  selectedTaskId?: string;
  onSelectTask?: (t: PlanTask) => void;
  /** taskId → preview label while a bulk action is previewed */
  previews?: Record<string, string>;
  /** Cards before "+N tarefas". Default 4 */
  maxVisible?: number;
  weekLabel?: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onToday?: () => void;
  isCurrentWeek?: boolean;
  style?: React.CSSProperties;
}
export declare function WeekCalendar(props: WeekCalendarProps): JSX.Element;
