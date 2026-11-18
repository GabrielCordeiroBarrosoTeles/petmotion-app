import { Camera, GeoJSONSource, Layer, Marker } from '@maplibre/maplibre-react-native';
import { Droplet, Droplets, Leaf } from 'lucide-react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { DEFAULT_CENTER, boundsFor, toLngLat } from '@/utils/geo';
import { Map, Me, Pin, Start } from './styles';
import type { RouteMapProps } from './types';

const EVENT_ICON = { pee: Droplet, poop: Leaf, water: Droplets };

/** Mapa claro e limpo do OpenFreeMap (base OpenStreetMap): sem chave, sem cadastro. */
export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const FOLLOW_ZOOM = 17;
const DEFAULT_PADDING = { top: 40, right: 40, bottom: 40, left: 40 };

export function RouteMap({ points, events = [], follow, interactive = true, lite = false, edgePadding }: RouteMapProps) {
  const theme = useTheme();
  const last = points[points.length - 1];
  const bounds = points.length > 1 ? boundsFor(points) : null;
  const moving = interactive && !lite;
  const route = {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'LineString' as const, coordinates: points.map(toLngLat) },
  };

  return (
    <Map
      mapStyle={MAP_STYLE}
      dragPan={moving}
      touchZoom={moving}
      doubleTapZoom={moving}
      doubleTapHoldZoom={moving}
      touchRotate={false}
      touchPitch={false}
      compass={false}
      logo={false}
      attribution={!lite}
      accessibilityLabel="Mapa do trajeto"
    >
      {follow && last ? (
        // ao vivo: a câmera acompanha o último ponto
        <Camera center={toLngLat(last)} zoom={FOLLOW_ZOOM} duration={600} easing="ease" />
      ) : (
        <Camera
          initialViewState={
            bounds
              ? { bounds, padding: edgePadding ?? DEFAULT_PADDING }
              : { center: last ? toLngLat(last) : DEFAULT_CENTER, zoom: 15 }
          }
        />
      )}

      {points.length > 1 ? (
        <GeoJSONSource id="route" data={route}>
          {/* contorno escuro + traço bola de tênis = rota legível em qualquer fundo */}
          <Layer
            id="route-outline"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': theme.colors.ink, 'line-width': RFValue(9) }}
          />
          <Layer
            id="route-line"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': theme.colors.primary, 'line-width': RFValue(5) }}
          />
        </GeoJSONSource>
      ) : null}

      {points[0] ? (
        <Marker lngLat={toLngLat(points[0])}>
          <Start />
        </Marker>
      ) : null}
      {events.map((event, i) => {
        const Icon = EVENT_ICON[event.type];
        return (
          <Marker key={`${event.occurred_at}-${i}`} lngLat={[event.lng, event.lat]}>
            <Pin $type={event.type}>
              <Icon size={RFValue(14)} color={theme.colors.ink} strokeWidth={2.6} />
            </Pin>
          </Marker>
        );
      })}
      {follow && last ? (
        <Marker lngLat={toLngLat(last)}>
          <Me />
        </Marker>
      ) : null}
    </Map>
  );
}
