/** Exam question grid: counts (respondidas, em branco, pendentes, revisar), filter, numbered buttons showing C/E/B and a review dot; aria labels spell out the state. */
export interface QuestionNavigatorProps {
  items: { answer?: 'C' | 'E' | 'B' | null; flagged?: boolean }[];
  current?: number;
  onGo?: (index: number) => void;
  filter?: 'all' | 'pending' | 'flagged';
  onFilter?: (f: 'all' | 'pending' | 'flagged') => void;
  style?: React.CSSProperties;
}
export declare function QuestionNavigator(props: QuestionNavigatorProps): JSX.Element;
