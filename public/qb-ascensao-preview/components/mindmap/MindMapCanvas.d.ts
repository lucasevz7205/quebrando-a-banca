export interface MindMapNode {
  id: string;
  label: string;
  /** Omit for the root */
  parent?: string;
  /** Learning evidence — rendered as icon + accessible label */
  mastery?: 'correct' | 'incorrect' | 'no-evidence' | 'progress';
}

/**
 * Interactive radial mind map: pan (drag), zoom, expand/collapse branches, gold path to the selected node, focus dimming, and an accessible list fallback.
 * @startingPoint section="Mind map" subtitle="Radial concept map with focus path + list fallback" viewport="900x560"
 */
export interface MindMapCanvasProps {
  nodes: MindMapNode[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Initially expanded ids. Default: root + level 1 */
  defaultExpanded?: string[];
  /** Controlled view; otherwise internal toggle */
  view?: 'map' | 'list';
  onViewChange?: (v: 'map' | 'list') => void;
  /** Dim nodes outside the selected node's path/siblings. Default true */
  focusPath?: boolean;
  /** px, default 560 */
  height?: number;
  style?: React.CSSProperties;
}
export declare function MindMapCanvas(props: MindMapCanvasProps): JSX.Element;
