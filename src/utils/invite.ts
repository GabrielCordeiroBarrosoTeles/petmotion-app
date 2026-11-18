const CODE = /^[A-Za-z0-9]{8}$/;
const LINK = /^(?:petmotion:\/\/convite\/|https?:\/\/[^/\s]+\/convite\/)([A-Za-z0-9]{8})\/?$/;

/** Tira o código do convite de um texto: código puro, link do app ou link do site. Qualquer outra coisa vira null. */
export function parseInviteCode(text: string): string | null {
  const value = text.trim();
  const code = CODE.test(value) ? value : (LINK.exec(value)?.[1] ?? null);
  return code ? code.toUpperCase() : null;
}
