import { router, useLocalSearchParams } from 'expo-router';
import { Cake, Camera, Cat, Dog, Images, PawPrint, Scale, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { Button } from '@/components/Button';
import { PetAvatar } from '@/components/PetAvatar';
import { PressableScale } from '@/components/PressableScale';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import { TextField } from '@/components/TextField';
import { KeyboardScrollContext } from '@/hooks/KeyboardScrollContext';
import { useKeyboardAwareScroll } from '@/hooks/useKeyboardAwareScroll';
import { useModalTopInset } from '@/hooks/useModalTopInset';
import { api, errorMessage } from '@/services/api';
import type { Pet, Species } from '@/services/types';
import { useAuth } from '@/store/auth';
import { usePets } from '@/store/pets';
import { spring } from '@/theme/motion';
import { fromIsoDate, localIso, maskDate, toIsoDate } from '@/utils/format';
import { celebrate } from '@/utils/haptics';
import { type ImageSource, pickImage } from '@/utils/pickImage';
import { confirmAction } from '@/utils/confirm';
import { customToast } from '@/utils/toast';
import { GoalStepper } from './GoalStepper';
import { Form, Half, PhotoArea, PhotoBadge, PhotoButtons, Row, Screen, Scroll } from './styles';
import type { PetFormErrors, PetFormParams } from './types';

/** Igual ao User::FREE_PET_LIMIT da API. */
const FREE_PET_LIMIT = 1;

/** Peso aceita vírgula e no máximo 2 casas. */
const maskWeight = (v: string) => {
  const clean = v.replace(/[^\d,.]/g, '').replace('.', ',');
  const [int, dec] = clean.split(',');
  return dec !== undefined ? `${int.slice(0, 3)},${dec.slice(0, 2)}` : int.slice(0, 3);
};

export function PetFormScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  const modalTop = useModalTopInset();
  const { scrollRef, keyboardHeight, onScroll, scrollToFocused } = useKeyboardAwareScroll();
  const { id } = useLocalSearchParams<PetFormParams>();
  const existing = usePets((s) => s.pets.find((p) => String(p.id) === id));
  const upsert = usePets((s) => s.upsert);
  const petCount = usePets((s) => s.pets.length);
  const isPremium = useAuth((s) => !!s.user?.is_premium);
  const remove = usePets((s) => s.remove);

  const [name, setName] = useState(existing?.name ?? '');
  const [species, setSpecies] = useState<Species>(existing?.species ?? 'dog');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [birth, setBirth] = useState(fromIsoDate(existing?.birth_date ?? null));
  const [weight, setWeight] = useState(existing?.weight_kg ? String(existing.weight_kg).replace('.', ',') : '');
  const [goal, setGoal] = useState(existing?.daily_goal_minutes ?? 30);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<PetFormErrors>({});
  const [saving, setSaving] = useState(false);

  const pickPhoto = async (source: ImageSource) => {
    const uri = await pickImage(source, [1, 1]);
    if (uri) setPhotoUri(uri);
  };

  const save = async () => {
    // plano grátis: 1 pet. A API também barra, mas aqui já leva direto para a Matilha.
    if (!existing && !isPremium && petCount >= FREE_PET_LIMIT) {
      customToast('No plano grátis cabe 1 pet. Entre para a Matilha para ter pets ilimitados.', 'warning');
      router.push('/premium');
      return;
    }
    const isoBirth = birth ? toIsoDate(birth) : null;
    const next: PetFormErrors = {};
    if (name.trim().length < 1) next.name = 'Qual o nome do seu pet?';
    if (birth && (!isoBirth || isoBirth > localIso())) next.birth_date = 'Data inválida.';
    const weightNum = weight ? Number(weight.replace(',', '.')) : null;
    if (weight && (!weightNum || weightNum > 150)) next.weight_kg = 'Peso inválido.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const payload = {
      name: name.trim(),
      species,
      breed: breed.trim(),
      birth_date: isoBirth ?? undefined,
      weight_kg: weightNum ? String(weightNum) : undefined,
      daily_goal_minutes: goal,
      photoUri,
    };
    try {
      const pet = existing ? await api.updatePet(existing.id, payload) : await api.createPet(payload);
      upsert(pet);
      celebrate();
      customToast(existing ? 'Alterações salvas.' : `${pet.name} entrou para a família!`, 'success');
      router.back();
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (pet: Pet) => {
    const ok = await confirmAction({
      title: `Remover ${pet.name}?`,
      message: 'Todos os passeios e registros de saúde serão apagados. Isso não tem volta.',
      confirmLabel: `Remover ${pet.name}`,
      icon: Trash2,
    });
    if (!ok) return;
    try {
      await api.deletePet(pet.id);
      remove(pet.id);
      customToast(`${pet.name} foi removido.`, 'success');
      router.back();
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    }
  };

  const preview = { name: name || '?', species, photo_url: photoUri ?? existing?.photo_url ?? null };

  return (
    <Screen $top={modalTop}>
      <ScreenHeader title={existing ? `Editar ${existing.name}` : 'Novo pet'} onBack={() => router.back()} />
      <KeyboardScrollContext.Provider value={scrollToFocused}>
      <Scroll ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: keyboardHeight }}>
        <Form $bottom={insets.bottom}>
          <PhotoArea from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={spring({ damping: 12 })}>
            <PressableScale onPress={() => pickPhoto('library')} accessibilityLabel="Escolher foto do pet">
              <PetAvatar pet={preview} size={RFValue(120)} ring />
              <PhotoBadge>
                <Camera size={RFValue(18)} color={theme.colors.primary} />
              </PhotoBadge>
            </PressableScale>
            <PhotoButtons>
              <Button title="Câmera" icon={Camera} variant="ghost" compact onPress={() => pickPhoto('camera')} />
              <Button title="Galeria" icon={Images} variant="ghost" compact onPress={() => pickPhoto('library')} />
            </PhotoButtons>
          </PhotoArea>

          <TextField
            label="Nome"
            icon={PawPrint}
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
            }}
            error={errors.name}
            placeholder="Ex.: Thor"
            maxLength={40}
          />

          <SegmentedControl
            label="Espécie"
            value={species}
            onChange={setSpecies}
            options={[
              { value: 'dog', label: 'Cachorro', icon: Dog },
              { value: 'cat', label: 'Gato', icon: Cat },
            ]}
          />

          <TextField label="Raça" value={breed} onChangeText={setBreed} placeholder="Ex.: Vira-lata caramelo" maxLength={60} />

          <Row>
            <Half>
              <TextField
                label="Nascimento"
                icon={Cake}
                value={birth}
                onChangeText={(t) => setBirth(maskDate(t))}
                error={errors.birth_date}
                keyboardType="number-pad"
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
            </Half>
            <Half>
              <TextField
                label="Peso (kg)"
                icon={Scale}
                value={weight}
                onChangeText={(t) => setWeight(maskWeight(t))}
                error={errors.weight_kg}
                keyboardType="decimal-pad"
                placeholder="Ex.: 12,5"
              />
            </Half>
          </Row>

          <GoalStepper value={goal} onChange={setGoal} />

          <Button title={existing ? 'Salvar alterações' : 'Cadastrar pet'} onPress={save} loading={saving} />
          {existing ? <Button title={`Remover ${existing.name}`} icon={Trash2} variant="danger" onPress={() => confirmDelete(existing)} /> : null}
        </Form>
      </Scroll>
      </KeyboardScrollContext.Provider>
    </Screen>
  );
}
