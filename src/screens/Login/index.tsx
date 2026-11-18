import { router } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { BouncingBall } from '@/components/BouncingBall';
import { Button } from '@/components/Button';
import { PressableScale } from '@/components/PressableScale';
import { TextField } from '@/components/TextField';
import { KeyboardScrollContext } from '@/hooks/KeyboardScrollContext';
import { useKeyboardAwareScroll } from '@/hooks/useKeyboardAwareScroll';
import { useStatusBar } from '@/hooks/useStatusBar';
import { api, errorMessage } from '@/services/api';
import { useAuth } from '@/store/auth';
import { spring } from '@/theme/motion';
import { customToast } from '@/utils/toast';
import {
  Brand, DemoHint, DemoText, Footer, FooterText, Headline, Hero, HeroText, Link, Screen, Scroll, Sheet, Subtitle, Title,
} from './styles';
import type { LoginErrors } from './types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen() {
  const insets = useSafeInsets();
  useStatusBar('light');
  const { scrollRef, keyboardHeight, onScroll, scrollToFocused } = useKeyboardAwareScroll();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next: LoginErrors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Digite um e-mail válido.';
    if (password.length < 6) next.password = 'A senha tem pelo menos 6 caracteres.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { token, user } = await api.login(email.trim().toLowerCase(), password);
      await signIn(token, user);
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardScrollContext.Provider value={scrollToFocused}>
      <Scroll ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ flexGrow: 1, paddingBottom: keyboardHeight }}>
        <Hero $top={insets.top}>
          <HeroText from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 14 })}>
            <Brand>PetMotion</Brand>
            <Headline maxFontSizeMultiplier={1.15}>Bora{'\n'}passear?</Headline>
          </HeroText>
          <BouncingBall size={RFValue(54)} />
        </Hero>

        <Sheet
          $bottom={insets.bottom}
          from={{ translateY: 80, opacity: 0 }}
          animate={{ translateY: 0, opacity: 1 }}
          transition={spring({ damping: 18, delay: 120 })}
        >
          <Title>Entrar</Title>
          <Subtitle>Os passeios do seu pet estão te esperando.</Subtitle>

          <TextField
            label="E-mail"
            icon={Mail}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            error={errors.email}
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <TextField
            label="Senha"
            icon={Lock}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            secure
            placeholder="Sua senha"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />

          <Button title="Entrar" onPress={submit} loading={loading} />

          <DemoHint
            onPress={() => {
              setEmail('gabriel@petmotion.app');
              setPassword('petmotion');
            }}
            accessibilityRole="button"
            accessibilityLabel="Preencher com a conta de demonstração"
          >
            <DemoText>Toque para usar a conta demo: gabriel@petmotion.app</DemoText>
          </DemoHint>

          <Footer>
            <FooterText>Primeira vez aqui?</FooterText>
            <PressableScale onPress={() => router.push('/register')} accessibilityRole="link" accessibilityLabel="Criar conta">
              <Link>Criar conta</Link>
            </PressableScale>
          </Footer>
        </Sheet>
      </Scroll>
      </KeyboardScrollContext.Provider>
    </Screen>
  );
}
