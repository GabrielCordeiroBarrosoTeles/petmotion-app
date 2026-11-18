import { router } from 'expo-router';
import { Lock, Mail, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BouncingBall } from '@/components/BouncingBall';
import { Button } from '@/components/Button';
import { LegalLinks } from '@/components/LegalLinks';
import { PressableScale } from '@/components/PressableScale';
import { TextField } from '@/components/TextField';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { api, errorMessage } from '@/services/api';
import { useAuth } from '@/store/auth';
import { spring } from '@/theme/motion';
import { customToast } from '@/utils/toast';
import {
  Brand, Footer, FooterText, Headline, Hero, HeroText, Link, Screen, Scroll, Sheet, Subtitle, Title,
} from './styles';
import type { RegisterErrors } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const signIn = useAuth((s) => s.signIn);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next: RegisterErrors = {};
    if (name.trim().length < 2) next.name = 'Como podemos te chamar?';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Digite um e-mail válido.';
    if (password.length < 6) next.password = 'Use pelo menos 6 caracteres.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { token, user } = await api.register(name.trim(), email.trim().toLowerCase(), password);
      await signIn(token, user);
      customToast(`Bem-vindo, ${name.trim().split(' ')[0]}! Agora cadastre seu pet.`, 'success');
      router.push('/pet-form');
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const clear = (field: keyof RegisterErrors) => errors[field] && setErrors((e) => ({ ...e, [field]: undefined }));

  return (
    <Screen>
      <Scroll contentContainerStyle={{ flexGrow: 1, paddingBottom: keyboardHeight }}>
        <Hero $top={insets.top}>
          <HeroText from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 14 })}>
            <Brand>PetMotion</Brand>
            <Headline>Cada passo{'\n'}conta.</Headline>
          </HeroText>
          <BouncingBall size={RFValue(48)} />
        </Hero>

        <Sheet
          $bottom={insets.bottom}
          from={{ translateY: 80, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={spring({ damping: 18, delay: 120 })}
        >
          <Title>Criar conta</Title>
          <Subtitle>Leva 20 segundos. Depois é só passear.</Subtitle>

          <TextField
            label="Seu nome"
            icon={UserRound}
            value={name}
            onChangeText={(t) => {
              setName(t);
              clear('name');
            }}
            error={errors.name}
            placeholder="Como você se chama?"
            autoComplete="name"
            textContentType="name"
          />
          <TextField
            label="E-mail"
            icon={Mail}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              clear('email');
            }}
            error={errors.email}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextField
            label="Senha"
            icon={Lock}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              clear('password');
            }}
            error={errors.password}
            helper="Mínimo de 6 caracteres."
            secure
            placeholder="Crie uma senha"
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={submit}
          />

          <LegalLinks prefix="Ao criar a conta, você concorda com os" />
          <Button title="Criar conta" onPress={submit} loading={loading} />

          <Footer>
            <FooterText>Já tem conta?</FooterText>
            <PressableScale onPress={() => router.back()} accessibilityRole="link" accessibilityLabel="Voltar para entrar">
              <Link>Entrar</Link>
            </PressableScale>
          </Footer>
        </Sheet>
      </Scroll>
    </Screen>
  );
}
