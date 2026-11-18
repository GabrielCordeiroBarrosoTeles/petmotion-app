import { parseInviteCode } from '../invite';

describe('parseInviteCode', () => {
  it.each([
    ['K7M2QX9A', 'K7M2QX9A'],
    ['  k7m2qx9a ', 'K7M2QX9A'],
    ['petmotion://convite/k7m2qx9a', 'K7M2QX9A'],
    ['https://petmotion.tolembrado.com.br/convite/K7M2QX9A', 'K7M2QX9A'],
    ['https://petmotion.tolembrado.com.br/convite/k7m2qx9a/', 'K7M2QX9A'],
  ])('aceita %s', (text, code) => expect(parseInviteCode(text)).toBe(code));

  it.each(['', 'abc', 'K7M2QX9', 'K7M2QX9AB', 'https://google.com/search?q=K7M2QX9A', 'K7M2 QX9A', 'petmotion://outra/K7M2QX9A'])(
    'rejeita %p',
    (text) => expect(parseInviteCode(text)).toBeNull(),
  );
});
