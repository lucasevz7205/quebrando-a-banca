import type { EditalSubject } from './HeatmapGrid';

/**
 * Two-step radial navigator: subjects around a core (topic count + block) → pick a subject → its assuntos → pick one to open it in the list.
 * Core shows Taxa de acertos, Cobertura and Volume SEPARATELY. Paginates (pageSize), offers "Lista completa", and falls back to an accessible list when narrower than size.
 * @startingPoint section="Edital" subtitle="Subject → assunto radial navigator" viewport="700x700"
 */
export interface SubjectRadialProps {
  subjects: EditalSubject[];
  /** Whole-edital totals for the core when no subject is selected */
  summary?: { accuracy: number | null; correct: number; wrong: number; valid: number; answered: number; coverage: number; studied: number; total: number };
  /** Diameter px, default 520 */
  size?: number;
  /** Nodes per page, default 6 */
  pageSize?: number;
  onSelectTopic?: (subjectId: string, topicId: string) => void;
  onOpenList?: (subjectId?: string) => void;
  layout?: 'auto' | 'radial' | 'list';
  style?: React.CSSProperties;
}
export declare function SubjectRadial(props: SubjectRadialProps): JSX.Element;
