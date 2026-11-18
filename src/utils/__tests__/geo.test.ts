import { boundsFor, haversine, projectRoute, toLngLat } from '../geo';

describe('geo', () => {
  it('mede a distância entre dois pontos em metros', () => {
    expect(haversine([-23.5874, -46.6576], [-23.5874, -46.6576])).toBe(0);
    expect(Math.round(haversine([0, 0], [0, 0.001]))).toBe(111);
  });

  it('sem pontos não há caixa para enquadrar', () => {
    expect(boundsFor([])).toBeNull();
  });

  it('caixa [oeste, sul, leste, norte] em volta dos pontos', () => {
    expect(boundsFor([[0, 0], [0.1, 0.2], [-0.05, 0.1]])).toEqual([0, -0.05, 0.2, 0.1]);
  });

  it('converte [lat, lng] para [lng, lat] do mapa', () => {
    expect(toLngLat([1, 2])).toEqual([2, 1]);
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
