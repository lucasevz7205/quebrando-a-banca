/**
 * Post-answer correction: gabarito, fundamento (+ legal basis), the trap mechanism (progressively revealed) and a remission to the exact mind-map node.
 * Drawer mode needs a positioned parent (it fills it with an overlay).
 */
export interface FeedbackDrawerProps {
  open?: boolean;
  /** drawer = right side-sheet over a positioned parent · inline = card. Default 'drawer' */
  mode?: 'drawer' | 'inline';
  onClose?: () => void;
  result?: 'correct' | 'incorrect';
  answerKey: 'C' | 'E';
  explanation?: React.ReactNode;
  /** e.g. "CF/88, art. 60, § 5º" (mono) */
  legalBasis?: string;
  /** How the item tries to mislead. Auto-expanded when result is incorrect */
  trap?: { name: string; description: React.ReactNode };
  /** Breadcrumb to the node, last item = node */
  concept?: { path: string[] };
  onOpenConcept?: () => void;
  onFlashcards?: () => void;
  style?: React.CSSProperties;
}
export declare function FeedbackDrawer(props: FeedbackDrawerProps): JSX.Element | null;
