/** Planner task: type (estudo, revisão, questões, flashcards, simulado, discursiva), topic number + title, subject, duration, status (done / late), lock for automatic reviews, optional preview note. */
export interface PlanTask {
  id: string;
  date: string;
  subject: string;
  subjectId?: string;
  topicNum?: string;
  title: string;
  type: 'estudo' | 'revisao' | 'questoes' | 'flashcards' | 'simulado' | 'discursiva';
  minutes: number;
  status: 'pending' | 'done' | 'late';
  /** Automatic spaced review — never moved by bulk actions */
  auto?: boolean;
}
export interface TaskCardProps {
  task: PlanTask;
  selected?: boolean;
  onClick?: () => void;
  /** Preview label when a reschedule is being previewed, e.g. "→ sáb 14/11" */
  preview?: string;
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function TaskCard(props: TaskCardProps): JSX.Element;
export declare const TASK_TYPES: Record<PlanTask['type'], { label: string; icon: string }>;
