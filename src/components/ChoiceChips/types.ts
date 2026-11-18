export interface ChoiceChipsProps {
  options: string[];
  onPick: (value: string) => void;
  selected?: string;
}
