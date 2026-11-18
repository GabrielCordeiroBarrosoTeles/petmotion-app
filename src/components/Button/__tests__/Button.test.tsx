import { Play } from 'lucide-react-native';
import { fireEvent, renderWithTheme, screen } from '../../../../test/render';
import { Button } from '..';

describe('Button', () => {
  it('chama onPress e mostra o texto e o ícone', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button title="Passear" icon={Play} onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Passear' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('icon:Play')).toBeOnTheScreen();
  });
});
