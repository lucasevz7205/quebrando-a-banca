export interface SelectOption { value: string; label: string }
export interface SelectGroup { label: string; options: SelectOption[] }

/** Labelled native select (keyboard + screen-reader friendly) with gold chevron; supports option groups. */
export interface SelectFieldProps {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  options: (SelectOption | SelectGroup)[];
  hint?: string;
  /** Visually hide the label (still announced) */
  hideLabel?: boolean;
  style?: React.CSSProperties;
  selectStyle?: React.CSSProperties;
}
export declare function SelectField(props: SelectFieldProps): JSX.Element;
