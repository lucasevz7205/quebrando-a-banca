/**
 * Two clearly separate settings: hours available per weekday (calendar capacity) and the ordered SEQUENCE of cycle subjects with minutes per turn (reorder, add, remove). Shows weekly total, one-lap duration and estimated days per lap.
 * @startingPoint section="Planning" subtitle="Daily hours + cycle subject sequence" viewport="900x420"
 */
export interface CycleConfiguratorProps {
  /** Sun..Sat hours */
  hours: number[];
  onHoursChange?: (h: number[]) => void;
  cycle: { subjectId: string; name: string; minutes: number }[];
  onCycleChange?: (c: CycleConfiguratorProps['cycle']) => void;
  /** Subjects that can be added */
  available?: { id: string; name: string }[];
  style?: React.CSSProperties;
}
export declare function CycleConfigurator(props: CycleConfiguratorProps): JSX.Element;
