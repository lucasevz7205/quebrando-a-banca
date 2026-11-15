/**
 * O Arquiteto · Tutor Socrático conversation: matéria + tópico pickers (history kept per topic), modes (Socrático, Feynman, Banca CEBRASPE, Arguição oral), tutor/user/error bubbles, quick actions (Testar retenção, Armadilhas da banca, Analogia Feynman, Arguição por voz), processing / error+retry / empty / voice-unavailable states, and "Limpar histórico" with explicit confirmation.
 * All replies are simulated in the design system — no AI service is called.
 */
export interface SocraticChatProps {
  subjects: { id: string; name: string; topics: { id: string; num: string; title?: string }[] }[];
  subjectId?: string;
  topicId?: string;
  onContextChange?: (subjectId: string, topicId: string) => void;
  /** Where the studio was opened from, e.g. "questão Q 0412" */
  origin?: string;
  style?: React.CSSProperties;
}
export declare function SocraticChat(props: SocraticChatProps): JSX.Element;
