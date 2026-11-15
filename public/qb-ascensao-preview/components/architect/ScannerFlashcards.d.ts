/** Flashcards 3D & Scanner: flip/rate deck for the selected topic; Scanner flow = material input (simulated) → editable recognised text → suggested cards → edit & approve. */
export interface ScannerFlashcardsProps {
  deck?: { front: React.ReactNode; back: React.ReactNode }[];
  topicLabel?: string;
  style?: React.CSSProperties;
}
export declare function ScannerFlashcards(props: ScannerFlashcardsProps): JSX.Element;
