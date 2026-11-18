import { renderWithTheme, screen } from '../../../test/render';
import { makePet, makeWalk } from '../../../test/fixtures';
import { barPath } from '../TabBar/BarBackground';
import { PackBadge } from '../PackBadge';
import { TennisBall } from '../TennisBall';
import { WalkShareCard } from '../WalkShareCard';

describe('PackBadge', () => {
  it.each(['default', 'onInk'] as const)('selo da Matilha no tom %s', async (tone) => {
    await renderWithTheme(<PackBadge tone={tone} />);
    expect(screen.getByLabelText('Membro da Matilha')).toBeOnTheScreen();
  });

  it('tom padrão', async () => {
    await renderWithTheme(<PackBadge />);
    expect(screen.getByText('Matilha')).toBeOnTheScreen();
  });
});

describe('TennisBall', () => {
  it('parada ou girando, com conteúdo por cima', async () => {
    await renderWithTheme(<TennisBall size={60} spinning><PackBadge /></TennisBall>);
    expect(screen.getByText('Matilha')).toBeOnTheScreen();
    await renderWithTheme(<TennisBall size={60} />);
  });
});

describe('WalkShareCard', () => {
  it('mostra o selo só para membros', async () => {
    await renderWithTheme(<WalkShareCard walk={makeWalk()} pet={makePet()} premium />);
    expect(screen.getByLabelText('Membro da Matilha')).toBeOnTheScreen();
    await renderWithTheme(<WalkShareCard walk={makeWalk()} pet={makePet()} />);
    expect(screen.queryByLabelText('Membro da Matilha')).toBeNull();
  });
});

describe('barPath', () => {
  it('desenha a barra presa no rodapé com a elevação da bola no centro', () => {
    const d = barPath(300, 60, 40, 20);
    expect(d.startsWith('M0,60')).toBe(true); // borda de cima em y = 40 (a elevação cabe acima)
    expect(d).toContain('A40,40 0 0 1'); // arco por cima da bola
    expect(d).toContain('L280,40');
    expect(d).toContain('L300,100 L0,100'); // base reta até o rodapé
    expect(d.endsWith('Z')).toBe(true);
  });
});
