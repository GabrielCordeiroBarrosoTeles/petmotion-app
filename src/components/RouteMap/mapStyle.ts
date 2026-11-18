import { theme } from '@/theme';

/** Estilo do Google Maps (Android) nas cores da marca: verde-neblina, ruas claras, água "poça". */
export const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#E4EBE2' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: theme.colors.textMuted }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: theme.colors.surface }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#CFE3C3' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: theme.colors.surface }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F3F6F1' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: theme.colors.sky }] },
];
