import { router } from 'expo-router';
import { Lock, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { LegalLinks } from '@/components/LegalLinks';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { api, errorMessage } from '@/services/api';
import { useAuth } from '@/store/auth';
import { useWalk } from '@/store/walk';
import { customToast } from '@/utils/toast';
import { Content, Item, Screen, Scroll, Warning, WarningTitle } from './styles';

const DELETED = [
  'Todos os seus pets e as fotos deles',
  'Todos os passeios, trajetos e marcações',
  'A carteirinha de saúde e os lembretes',
  'Sua conta, nome e e-mail',
];

export function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!password) {
      setError('Digite sua senha para confirmar.');
      return;
    }
    setLoading(true);
    try {
      await api.deleteAccount(password);
      useWalk.getState().reset();
      await useAuth.getState().signOut();
      customToast('Sua conta foi excluída. Até a próxima!', 'success');
    } catch (e) {
      setError(errorMessage(e));
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Excluir conta" onBack={() => router.back()} />
      <Scroll contentContainerStyle={{ paddingBottom: keyboardHeight }}>
        <Content $bottom={insets.bottom}>
          <Warning accessibilityRole="summary">
            <WarningTitle>Isso não tem volta.</WarningTitle>
            {DELETED.map((item) => (
              <Item key={item}>• {item}</Item>
            ))}
          </Warning>
          <TextField
            label="Sua senha"
            icon={Lock}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError(null);
            }}
            error={error}
            secure
            placeholder="Para confirmar que é você"
            autoComplete="password"
          />
          <Button title="Excluir minha conta" icon={Trash2} variant="danger" onPress={confirm} loading={loading} />
          <Button title="Cancelar" variant="ghost" onPress={() => router.back()} />
          <LegalLinks prefix="Saiba como tratamos seus dados nos" />
        </Content>
      </Scroll>
    </Screen>
  );
}
