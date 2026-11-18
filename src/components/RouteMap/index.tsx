import { Droplet, Droplets, Leaf } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import type MapView from 'react-native-maps';
import { Marker, Polyline } from 'react-native-maps';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components/native';
import { regionFor, toCoord } from '@/utils/geo';
import { mapStyle } from './mapStyle';
import { Map, Me, Pin, Start } from './styles';
import type { RouteMapProps } from './types';

const EVENT_ICON = { pee: Droplet, poop: Leaf, water: Droplets };

export function RouteMap({ points, events = [], follow, interactive = true, lite = false, edgePadding }: RouteMapProps) {
  const theme = useTheme();
  const ref = useRef<MapView>(null);
  const last = points[points.length - 1];
  const coords = points.map(toCoord);

  useEffect(() => {
    if (!ref.current || !last) return;
    if (follow) {
      ref.current.animateCamera({ center: toCoord(last), zoom: 17 }, { duration: 600 });
    }
  }, [follow, last]);

  return (
    <Map
      ref={ref}
      initialRegion={regionFor(points)}
      liteMode={lite}
      customMapStyle={mapStyle}
      showsPointsOfInterests={false}
      showsCompass={false}
      toolbarEnabled={false}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={false}
      pitchEnabled={false}
      onMapReady={() => {
        if (!follow && coords.length > 1) {
          ref.current?.fitToCoordinates(coords, {
            edgePadding: edgePadding ?? { top: 40, right: 40, bottom: 40, left: 40 },
            animated: false,
          });
        }
      }}
      accessibilityLabel="Mapa do trajeto"
    >
      {coords.length > 1 ? (
        <>
          {/* contorno escuro + traço bola de tênis = rota legível em qualquer fundo */}
          <Polyline coordinates={coords} strokeColor={theme.colors.ink} strokeWidth={RFValue(9)} lineCap="round" lineJoin="round" />
          <Polyline coordinates={coords} strokeColor={theme.colors.primary} strokeWidth={RFValue(5)} lineCap="round" lineJoin="round" />
        </>
      ) : null}
      {coords[0] ? (
        <Marker coordinate={coords[0]} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <Start />
        </Marker>
      ) : null}
      {events.map((event, i) => {
        const Icon = EVENT_ICON[event.type];
        return (
          <Marker key={`${event.occurred_at}-${i}`} coordinate={{ latitude: event.lat, longitude: event.lng }} tracksViewChanges={false}>
            <Pin $type={event.type}>
              <Icon size={RFValue(14)} color={theme.colors.ink} strokeWidth={2.6} />
            </Pin>
          </Marker>
        );
      })}
      {follow && last ? (
        <Marker coordinate={toCoord(last)} anchor={{ x: 0.5, y: 0.5 }}>
          <Me />
        </Marker>
      ) : null}
    </Map>
  );
}
