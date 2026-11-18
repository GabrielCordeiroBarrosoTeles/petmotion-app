import { router } from 'expo-router';
import { Footprints } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useSafeInsets } from '@/hooks/useSafeInsets';
import { useTheme } from 'styled-components/native';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BAR_HEIGHT, FAB_SIZE } from '@/components/TabBar/styles';
import { useFetch } from '@/hooks/useFetch';
import { api, errorMessage } from '@/services/api';
import type { Walk } from '@/services/types';
import { useSelectedPet } from '@/store/pets';
import { km } from '@/utils/format';
import { customToast } from '@/utils/toast';
import { HistorySkeleton } from './SkeletonLoader';
import { Footer, List, Refresh, Screen, Separator, Summary, SummaryItem, SummaryLabel, SummaryValue } from './styles';
import type { HistoryPage } from './types';
import { WalkRow } from './WalkRow';

export function HistoryScreen() {
  const theme = useTheme();
  const insets = useSafeInsets();
  const pet = useSelectedPet();
  const [loadingMore, setLoadingMore] = useState(false);
  // ref (e não só estado): o onEndReached pode disparar 2x antes do re-render e duplicar a página
  const loadingMoreRef = useRef(false);

  const { data, loading, refreshing, refetch, setData } = useFetch<HistoryPage>(
    async () => {
      const res = await api.walks(pet!.id, 1);
      return { items: res.data, page: res.current_page, lastPage: res.last_page, total: res.total };
    },
    { enabled: !!pet, deps: [pet?.id] },
  );

  const loadMore = async () => {
    if (!data || !pet || loadingMoreRef.current || data.page >= data.lastPage) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await api.walks(pet.id, data.page + 1);
      setData((prev) => prev && { ...prev, items: [...prev.items, ...res.data], page: res.current_page, lastPage: res.last_page });
    } catch (e) {
      customToast(errorMessage(e), 'danger');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const openWalk = useCallback((walk: Walk) => router.push({ pathname: '/walks/[id]', params: { id: String(walk.id) } }), []);
  const renderItem = useCallback(({ item, index }: { item: Walk; index: number }) => <WalkRow walk={item} index={index} onPress={openWalk} />, [openWalk]);

  const loadedKm = data?.items.reduce((sum, w) => sum + w.distance_meters, 0) ?? 0;
  const bottom = BAR_HEIGHT + FAB_SIZE / 2 + insets.bottom + theme.spacing.xl;

  return (
    <Screen $top={insets.top}>
      <ScreenHeader title="Passeios" subtitle={pet ? `Histórico do ${pet.name}` : undefined} />
      {loading ? (
        <HistorySkeleton />
      ) : (
        <List
          data={data?.items ?? []}
          keyExtractor={(w) => String(w.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={Separator}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.large, paddingBottom: bottom }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={<Refresh refreshing={refreshing} onRefresh={() => refetch('pull')} />}
          ListHeaderComponent={
            data && data.total > 0 ? (
              <Summary accessibilityRole="summary">
                <SummaryItem>
                  <SummaryValue>{data.total}</SummaryValue>
                  <SummaryLabel>passeios</SummaryLabel>
                </SummaryItem>
                <SummaryItem>
                  <SummaryValue>{km(loadedKm, 1)}</SummaryValue>
                  <SummaryLabel>km {data.page < data.lastPage ? 'recentes' : 'no total'}</SummaryLabel>
                </SummaryItem>
              </Summary>
            ) : undefined
          }
          ListEmptyComponent={
            <EmptyState
              icon={Footprints}
              title="Nenhum passeio ainda"
              message={pet ? `Que tal o primeiro passeio do ${pet.name}? O trajeto aparece aqui.` : 'Cadastre seu pet para começar.'}
              actionLabel={pet ? 'Começar passeio' : 'Cadastrar pet'}
              onAction={() => router.push(pet ? '/walk' : '/pet-form')}
            />
          }
          ListFooterComponent={loadingMore ? <Footer accessibilityLabel="Carregando mais passeios" /> : undefined}
        />
      )}
    </Screen>
  );
}
