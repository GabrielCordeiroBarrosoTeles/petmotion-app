export interface Plan {
  id: 'yearly' | 'monthly';
  title: string;
  price: string;
  period: string;
  note: string;
  tag?: string;
}

export interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: (id: Plan['id']) => void;
}
