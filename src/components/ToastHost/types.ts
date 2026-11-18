import type { ToastType } from '@/store/toast';

export interface ToastBoxProps {
  $type: ToastType;
  $top: number;
}
