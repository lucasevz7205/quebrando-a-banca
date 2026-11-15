/**
 * Simulado composition by block and subject: planned items, official vs estimated distribution tag, bank availability and an insufficiency warning (icon + text) per row; block and grand totals.
 * @startingPoint section="Simulado" subtitle="Block/subject composition with bank availability" viewport="800x420"
 */
export interface CompositionTableProps {
  blocks: { block: string; label: string; subjects: { name: string; planned: number; available: number; official?: boolean }[] }[];
  /** Show bank availability + status columns. Default true */
  showAvailability?: boolean;
  style?: React.CSSProperties;
}
export declare function CompositionTable(props: CompositionTableProps): JSX.Element;
