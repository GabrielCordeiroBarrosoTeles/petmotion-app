import { router } from 'expo-router';
import { ClipboardList, PawPrint, Sparkles, Trophy, X } from 'lucide-react-native';
import { useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { BouncingBall } from '@/components/BouncingBall';
import { Button } from '@/components/Button';
import { Confetti } from '@/components/Confetti';
import { PressableScale } from '@/components/PressableScale';
import { useStatusBar } from '@/hooks/useStatusBar';
import { api, errorMessage } from '@/services/api';
import { useAuth } from '@/store/auth';
import { spring, timing } from '@/theme/motion';
import { fullDateLabel } from '@/utils/format';
import { celebrate } from '@/utils/haptics';
import { customToast } from '@/utils/toast';
import { BenefitRow } from './BenefitRow';
import { PlanCard } from './PlanCard';
import type { Plan } from './PlanCard/types';
import {
  Balls, Benefits, Close, Content, FinePrint, FullWidth, Heading, Lede, Medal, Plans, Screen, Scroll, Title, Welcome,
  WelcomeBody, WelcomeTitle,
} from './styles';
import type { PremiumView } from './types';

const PLANS: Plan[] = [
  { id: 'yearly', title: 'Anual', price: 'R$ 79,90', period: '/ano', note: 'Sai por R$ 6,66 por mês', tag: 'Economize 33%' },
  { id: 'monthly', title: 'Mensal', price: 'R$ 9,90', period: '/mês', note: 'Cancele quando quiser' },
];

const BENEFITS = [
  { icon: PawPrint, title: 'Pets ilimitados', description: 'Cachorro, gato, a turma toda na mesma conta.' },
  { icon: Sparkles, title: 'Selo da Matilha', description: 'No seu perfil e em cada card de passeio que você compartilhar.' },
  { icon: ClipboardList, title: 'Relatório para o veterinário', description: 'Passeios, marcações e vacinas do mês num PDF.', soon: true },
  { icon: Trophy, title: 'Desafios exclusivos', description: 'Metas mensais com prêmios de marcas parceiras.', soon: true },
];

export function PremiumScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  useStatusBar('light');
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const [plan, setPlan] = useState<Plan['id']>('yearly');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<PremiumView>(user?.is_premium ? 'welcome' : 'offer');
  const [burst, setBurst] = useState(0);

  const startTrial = async () => {
    if (!user?.trial_available) {
      customToast('Os pagamentos chegam em breve. Nesta demonstração, só o teste grátis está disponível.', 'warning');
      return;
    }
    setLoading(true);
    try {
      setUser(await api.startTrial());
      celebrate();
      setBurst(Date.now());
      setView('welcome');
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const until = user?.premium_until ? fullDateLabel(user.premium_until) : null;

  return (
    <Screen>
      {view === 'welcome' ? (
        <Welcome
          $top={insets.top}
          $bottom={insets.bottom}
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring({ damping: 14 })}
        >
          <Medal
            from={{ rotate: '-20deg', scale: 0.4 }}
            animate={{ rotate: '0deg', scale: 1 }}
            transition={spring({ damping: 8, delay: 150 })}
          >
            <PawPrint size={RFValue(60)} color={theme.colors.ink} strokeWidth={2.2} />
          </Medal>
          <WelcomeTitle accessibilityRole="header">Bem-vindo à Matilha!</WelcomeTitle>
          <WelcomeBody>
            {until ? `Seu acesso vai até ${until}. ` : ''}Agora dá para cadastrar todos os seus pets, e o selo da Matilha já aparece no seu perfil e nos cards de passeio.
          </WelcomeBody>
          <FullWidth>
            <Button title="Bora passear" onPress={() => router.back()} />
          </FullWidth>
        </Welcome>
      ) : (
        <Scroll>
          <Content $top={insets.top} $bottom={insets.bottom}>
            <PressableScale onPress={() => router.back()} accessibilityLabel="Fechar">
              <Close>
                <X size={RFValue(20)} color={theme.colors.onInk} />
              </Close>
            </PressableScale>

            <Balls>
              <BouncingBall size={RFValue(34)} />
              <BouncingBall size={RFValue(46)} delay={160} />
              <BouncingBall size={RFValue(34)} delay={320} />
            </Balls>

            <Heading from={{ opacity: 0, translateY: 18 }} animate={{ opacity: 1, translateY: 0 }} transition={spring({ damping: 15, delay: 120 })}>
              <Title accessibilityRole="header">Entre para{'\n'}a Matilha.</Title>
              <Lede>O plano de quem não perde um passeio. Comece com 7 dias grátis.</Lede>
            </Heading>

            <Benefits>
              {BENEFITS.map((b, i) => (
                <BenefitRow key={b.title} {...b} index={i} />
              ))}
            </Benefits>

            <Plans accessibilityRole="radiogroup" from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={timing({ duration: 400, delay: 850 })}>
              {PLANS.map((p) => (
                <PlanCard key={p.id} plan={p} selected={plan === p.id} onSelect={setPlan} />
              ))}
            </Plans>

            <Button
              title={user?.trial_available ? 'Começar 7 dias grátis' : 'Assinar'}
              icon={PawPrint}
              onPress={startTrial}
              loading={loading}
            />
            <FinePrint>
              Demonstração: nenhuma cobrança é feita. Depois do teste, você volta ao plano grátis sem fazer nada.
            </FinePrint>
          </Content>
        </Scroll>
      )}
      <Confetti burstKey={burst} />
    </Screen>
  );
}
