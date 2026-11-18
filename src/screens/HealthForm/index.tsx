import { router } from 'expo-router';
import { CalendarClock, CalendarDays, NotebookPen, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/ChoiceChips';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { KeyboardScrollContext } from '@/hooks/KeyboardScrollContext';
import { useKeyboardAwareScroll } from '@/hooks/useKeyboardAwareScroll';
import { useModalTopInset } from '@/hooks/useModalTopInset';
import { api, errorMessage } from '@/services/api';
import type { HealthType } from '@/services/types';
import { useSelectedPet } from '@/store/pets';
import { fromIsoDate, localIso, maskDate, toIsoDate } from '@/utils/format';
import { HEALTH_META } from '@/utils/health';
import { ensureNotificationPermission, scheduleHealthReminder } from '@/utils/notifications';
import { customToast } from '@/utils/toast';
import { Form, Group, GroupLabel, Half, Row, Screen, Scroll } from './styles';
import type { HealthFormErrors, NextDateShortcut, SuggestionMap } from './types';

const SUGGESTIONS: SuggestionMap = {
  vaccine: ['V10', 'Antirrábica', 'Gripe canina', 'Giárdia'],
  vermifuge: ['Drontal Plus', 'Milbemax', 'Endogard'],
  medicine: ['Antipulgas', 'Anti-inflamatório', 'Antibiótico'],
  vet: ['Check-up', 'Retorno', 'Banho e tosa', 'Dentista'],
};

const NEXT: NextDateShortcut[] = [
  { label: '+15 dias', days: 15 },
  { label: '+1 mês', days: 30 },
  { label: '+3 meses', days: 90 },
  { label: '+1 ano', days: 365 },
];

const todayIso = () => localIso();

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localIso(d);
}

export function HealthFormScreen() {
  const insets = useSafeInsets();
  const modalTop = useModalTopInset();
  const { scrollRef, keyboardHeight, onScroll, scrollToFocused } = useKeyboardAwareScroll();
  const pet = useSelectedPet();
  const [type, setType] = useState<HealthType>('vaccine');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(fromIsoDate(todayIso()));
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<HealthFormErrors>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!pet) return;
    const isoDate = toIsoDate(date);
    const isoNext = nextDate ? toIsoDate(nextDate) : null;
    const next: HealthFormErrors = {};
    if (title.trim().length < 2) next.title = 'Dê um nome ao cuidado.';
    if (!isoDate) next.date = 'Data inválida. Use DD/MM/AAAA.';
    if (nextDate && !isoNext) next.next_date = 'Data inválida. Use DD/MM/AAAA.';
    if (isoDate && isoNext && isoNext < isoDate) next.next_date = 'A próxima dose precisa ser depois da aplicação.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await api.createHealth(pet.id, { type, title: title.trim(), date: isoDate!, next_date: isoNext, notes: notes.trim() || null });
      if (isoNext && (await ensureNotificationPermission())) {
        await scheduleHealthReminder(pet.name, title.trim(), isoNext);
      }
      customToast(isoNext ? 'Salvo! A gente te lembra um dia antes.' : 'Cuidado registrado.', 'success');
      router.back();
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen $top={modalTop}>
      <ScreenHeader title="Novo cuidado" subtitle={pet ? `Para ${pet.name}` : undefined} onBack={() => router.back()} />
      <KeyboardScrollContext.Provider value={scrollToFocused}>
      <Scroll ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: keyboardHeight }}>
        <Form $bottom={insets.bottom}>
          <SegmentedControl
            label="Tipo"
            value={type}
            onChange={(t) => {
              setType(t);
              setTitle('');
            }}
            options={(Object.keys(HEALTH_META) as HealthType[]).map((value) => ({ value, label: HEALTH_META[value].label }))}
          />

          <Group>
            <TextField
              label="Nome"
              icon={Tag}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
              }}
              error={errors.title}
              placeholder={`Ex.: ${SUGGESTIONS[type][0]}`}
            />
            <ChoiceChips options={SUGGESTIONS[type]} selected={title} onPick={setTitle} />
          </Group>

          <Row>
            <Half>
              <TextField
                label="Aplicado em"
                icon={CalendarDays}
                value={date}
                onChangeText={(t) => setDate(maskDate(t))}
                error={errors.date}
                keyboardType="number-pad"
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
            </Half>
            <Half>
              <TextField
                label="Próxima dose"
                icon={CalendarClock}
                value={nextDate}
                onChangeText={(t) => setNextDate(maskDate(t))}
                error={errors.next_date}
                keyboardType="number-pad"
                placeholder="Opcional"
                maxLength={10}
              />
            </Half>
          </Row>

          <Group>
            <GroupLabel>Atalhos para a próxima dose</GroupLabel>
            <ChoiceChips
              options={NEXT.map((n) => n.label)}
              onPick={(label) => {
                const base = toIsoDate(date) ?? todayIso();
                const shortcut = NEXT.find((n) => n.label === label)!;
                setNextDate(fromIsoDate(addDays(base, shortcut.days)));
              }}
            />
          </Group>

          <TextField
            label="Observações"
            icon={NotebookPen}
            value={notes}
            onChangeText={setNotes}
            placeholder="Lote, veterinário, reação…"
            multiline
            maxLength={500}
          />

          <Button title="Salvar cuidado" onPress={save} loading={saving} />
        </Form>
      </Scroll>
      </KeyboardScrollContext.Provider>
    </Screen>
  );
}
