import { renderWithTheme, screen } from '../../../test/render';
import { makePet, makeWalk } from '../../../test/fixtures';
import { notchedPath } from '../TabBar/NotchedBackground';
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

describe('notchedPath', () => {
  it('desenha a barra com o encaixe côncavo centralizado', () => {
    const d = notchedPath(300, 60, 40, 20);
    expect(d.startsWith('M20,0')).toBe(true);
    expect(d).toContain('A40,40 0 0 0'); // o arco do encaixe
    expect(d).toContain('L280,0');
    expect(d.endsWith('Z')).toBe(true);
  });
});
