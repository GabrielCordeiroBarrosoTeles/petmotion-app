import { useSettings } from '../settings';
import { useToastStore } from '../toast';

describe('settings', () => {
  it('liga o modo apresentação e o lembrete', () => {
    useSettings.getState().setDemoMode(true);
    useSettings.getState().setWalkReminder(true);
    expect(useSettings.getState()).toMatchObject({ demoMode: true, walkReminder: true });
  });
});

describe('toast', () => {
  it('mostra e esconde', () => {
    useToastStore.getState().show('Oi', 'warning');
    expect(useToastStore.getState().current).toMatchObject({ message: 'Oi', type: 'warning' });
    useToastStore.getState().hide();
    expect(useToastStore.getState().current).toBeNull();
  });
});
