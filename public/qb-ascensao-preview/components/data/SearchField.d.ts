/** Text search input with leading icon and clear button. */
export interface SearchFieldProps {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  /** Accessible label (visually hidden) */
  label?: string;
  style?: React.CSSProperties;
}
export declare function SearchField(props: SearchFieldProps): JSX.Element;
