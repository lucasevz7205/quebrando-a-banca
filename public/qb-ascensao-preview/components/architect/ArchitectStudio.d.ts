/**
 * O Arquiteto — expanded active-learning studio (replaces the generic "Tutor"). Tabs: Tutor Socrático, Laboratório Feynman, Caderno Cornell, Flashcards 3D e Scanner, Pomodoro e Áudio Alfa. Keeps the origin context (question / flashcard / topic). Modal (Esc closes) or inline.
 * @startingPoint section="O Arquiteto" subtitle="Active-learning studio with 5 tools" viewport="1180x760"
 */
export interface ArchitectStudioProps {
  open?: boolean;
  /** default 'modal' */
  mode?: 'modal' | 'inline';
  onClose?: () => void;
  subjects: { id: string; name: string; short?: string; topics: { id: string; num: string; title?: string }[] }[];
  /** origin e.g. "questão Q 0412" */
  context?: { subjectId?: string; topicId?: string; origin?: string };
  onContextChange?: (c: ArchitectStudioProps['context']) => void;
  tool?: 'socratico' | 'feynman' | 'cornell' | 'cards' | 'pomodoro';
  onToolChange?: (t: string) => void;
  /** Flashcards for the cards tool */
  deck?: { front: React.ReactNode; back: React.ReactNode }[];
  style?: React.CSSProperties;
}
export declare function ArchitectStudio(props: ArchitectStudioProps): JSX.Element | null;
