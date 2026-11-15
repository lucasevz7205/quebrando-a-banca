import type { EditalSubject } from '../edital/HeatmapGrid';

/**
 * Hierarchical, searchable topic picker (combobox in a dialog; bottom sheet under 640px). Replaces long native selects.
 * Search by matéria, código or title words (accent-insensitive). ↑/↓ move, Enter selects, Esc closes, focus returns to the trigger.
 * Full titles wrap (never truncated). Recentes / Favoritos / Revisões pendentes appear only when their id lists are non-empty.
 * Selection only reports ids — it never mutates progress. An unknown `value` is shown as not found, never replaced.
 */
export interface StudyTopicPickerProps {
  subjects: EditalSubject[];
  /** Selected topicId */
  value?: string | null;
  onSelect?: (sel: { subjectId: string; topicId: string }) => void;
  /** topicId → real count (maps, activities). Topics without an entry show nothing. */
  counts?: Record<string, number>;
  /** [singular, plural], default ['mapa','mapas'] */
  countLabel?: [string, string];
  /** topicIds — section hidden when empty */
  recents?: string[];
  favorites?: string[];
  pendingReviews?: string[];
  /** Trigger overline, default 'Assunto' */
  label?: string;
  placeholder?: string;
  emptyTitle?: string;
  style?: React.CSSProperties;
}
export declare function StudyTopicPicker(props: StudyTopicPickerProps): JSX.Element;
