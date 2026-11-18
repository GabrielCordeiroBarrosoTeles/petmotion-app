const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const fullDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export function km(meters: number, decimals = 2): string {
  return (meters / 1000).toFixed(decimals).replace('.', ',');
}

export function duration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/** Ritmo em min/km. */
export function pace(seconds: number, meters: number): string {
  if (meters < 50) return '--';
  const secPerKm = seconds / (meters / 1000);
  return `${Math.floor(secPerKm / 60)}'${String(Math.round(secPerKm % 60)).padStart(2, '0')}"`;
}

export function thousands(n: number): string {
  return n.toLocaleString('pt-BR');
}

export const parseDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
export const weekdayShort = (iso: string) => weekday.format(parseDate(iso)).replace('.', '');
export const dayMonthLabel = (iso: string) => dayMonth.format(parseDate(iso)).replace('.', '');
export const timeLabel = (iso: string) => time.format(parseDate(iso));
export const fullDateLabel = (iso: string) => fullDate.format(parseDate(iso));

export function relativeDay(iso: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = parseDate(iso);
  date.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === -1) return 'Ontem';
  if (diff === 1) return 'Amanhã';
  if (diff > 1 && diff < 7) return `Em ${diff} dias`;
  if (diff < -1 && diff > -7) return `Há ${-diff} dias`;
  return dayMonthLabel(iso);
}

export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = parseDate(iso);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

export function petAge(birth: string | null): string | null {
  if (!birth) return null;
  const months = Math.floor((Date.now() - parseDate(birth).getTime()) / (30.44 * 86400000));
  if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function firstName(name?: string | null): string {
  return name?.split(' ')[0] ?? '';
}

/** Máscara progressiva DD/MM/AAAA (sem literais flutuantes). */
export function maskDate(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** DD/MM/AAAA -> AAAA-MM-DD (ou null se incompleto/inválido). */
export function toIsoDate(masked: string): string | null {
  const m = masked.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const date = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
  return Number.isNaN(date.getTime()) || date.getDate() !== Number(dd) ? null : `${yyyy}-${mm}-${dd}`;
}

export function fromIsoDate(iso: string | null): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** AAAA-MM-DD no fuso local (toISOString usaria UTC e viraria o dia à noite no Brasil). */
export function localIso(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "Thor", "Thor e Mel", "Thor, Mel e Bidu". */
export function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`;
}
