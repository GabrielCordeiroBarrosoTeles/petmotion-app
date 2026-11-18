import { haversine, projectRoute, regionFor, toCoord } from '../geo';

describe('geo', () => {
  it('mede a distância entre dois pontos em metros', () => {
    expect(haversine([-23.5874, -46.6576], [-23.5874, -46.6576])).toBe(0);
    expect(Math.round(haversine([0, 0], [0, 0.001]))).toBe(111);
  });

  it('usa a região padrão sem pontos', () => {
    expect(regionFor([])).toEqual({ latitude: -23.5874, longitude: -46.6576, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  });

  it('enquadra os pontos com margem e zoom mínimo', () => {
    const region = regionFor([[0, 0], [0.1, 0.2]]);
    expect(region.latitude).toBeCloseTo(0.05);
    expect(region.longitudeDelta).toBeCloseTo(0.3);
    expect(regionFor([[1, 1]]).latitudeDelta).toBe(0.004);
  });

  it('converte para coordenada do mapa', () => {
    expect(toCoord([1, 2])).toEqual({ latitude: 1, longitude: 2 });
  });

  it('projeta a rota num caminho SVG', () => {
    expect(projectRoute([[1, 1]], 100, 100)).toBe('');
    const d = projectRoute([[0, 0], [1, 1]], 100, 100, 10);
    expect(d.startsWith('M10.0 90.0')).toBe(true);
    expect(d).toContain('L90.0 10.0');
    // ponto repetido: evita divisão por zero
    expect(projectRoute([[0, 0], [0, 0]], 50, 50)).toContain('M');
  });
});
