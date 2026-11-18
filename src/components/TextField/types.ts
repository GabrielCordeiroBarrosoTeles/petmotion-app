import type { LucideIcon } from 'lucide-react-native';
import type { TextInputProps } from 'react-native';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon?: LucideIcon;
  error?: string | null;
  helper?: string;
  secure?: boolean;
}

export interface FieldBoxProps {
  $focused: boolean;
  $error: boolean;
}
