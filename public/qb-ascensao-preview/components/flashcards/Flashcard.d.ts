/**
 * Spaced-repetition card: front (Georgia prompt) → flip → verso with origin link, then 4-step self-rating with next-review intervals.
 * @startingPoint section="Flashcards" subtitle="Flip card with self-rating and concept origin" viewport="700x500"
 */
export interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  /** Deck / subject label */
  deck?: string;
  /** Concept the card came from, e.g. "Emendas › Limites formais" */
  origin?: string;
  onOpenOrigin?: () => void;
  /** Controlled flip state */
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  /** Shows the rating row once flipped */
  onRate?: (r: 'errei' | 'dificil' | 'bom' | 'facil') => void;
  /** Interval label per rating */
  intervals?: { errei: string; dificil: string; bom: string; facil: string };
  /** Shows the honest "illustrative intervals" note. Default true */
  demo?: boolean;
  /** px, default 360 */
  height?: number;
  style?: React.CSSProperties;
}
export declare function Flashcard(props: FlashcardProps): JSX.Element;
