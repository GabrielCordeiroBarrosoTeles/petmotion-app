import { Linking } from 'react-native';
import { siteUrl } from '@/services/api';
import { Link, Text } from './styles';
import type { LegalLinksProps } from './types';

export const TERMS_URL = `${siteUrl}/termos`;
export const PRIVACY_URL = `${siteUrl}/privacidade`;

export function LegalLinks({ prefix }: LegalLinksProps) {
  return (
    <Text>
      {prefix ? `${prefix} ` : ''}
      <Link accessibilityRole="link" onPress={() => Linking.openURL(TERMS_URL)}>Termos de uso</Link>
      {' e a '}
      <Link accessibilityRole="link" onPress={() => Linking.openURL(PRIVACY_URL)}>Política de privacidade</Link>.
    </Text>
  );
}
