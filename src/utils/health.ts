import { Pill, ShieldPlus, Stethoscope, Syringe, type LucideIcon } from 'lucide-react-native';
import type { HealthType } from '@/services/types';

export const HEALTH_META: Record<HealthType, { label: string; icon: LucideIcon }> = {
  vaccine: { label: 'Vacina', icon: Syringe },
  vermifuge: { label: 'Vermífugo', icon: ShieldPlus },
  medicine: { label: 'Remédio', icon: Pill },
  vet: { label: 'Consulta', icon: Stethoscope },
};
