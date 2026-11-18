import {
  dayMonthLabel, daysUntil, duration, firstName, joinNames, fromIsoDate, fullDateLabel, greeting, km, localIso, maskDate,
  minutesLabel, pace, parseDate, petAge, relativeDay, thousands, timeLabel, toIsoDate, weekdayShort,
} from '../format';

describe('format', () => {
  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-11-17T15:00:00')));
  afterEach(() => jest.useRealTimers());

  it('formata km com vírgula e casas decimais', () => {
    expect(km(1234)).toBe('1,23');
    expect(km(1234, 1)).toBe('1,2');
  });

  it('formata duração com e sem horas', () => {
    expect(duration(65)).toBe('01:05');
    expect(duration(3725)).toBe('1:02:05');
  });

  it('formata minutos em texto', () => {
    expect(minutesLabel(45)).toBe('45 min');
    expect(minutesLabel(60)).toBe('1h');
    expect(minutesLabel(95)).toBe('1h35');
  });

  it('calcula o ritmo só com distância mínima', () => {
    expect(pace(600, 30)).toBe('--');
    expect(pace(600, 1000)).toBe('10\'00"');
  });

  it('separa milhares no padrão brasileiro', () => {
    expect(thousands(12345)).toBe('12.345');
  });

  it('interpreta datas puras ao meio-dia para não trocar de dia', () => {
    expect(parseDate('2026-11-17').getHours()).toBe(12);
    expect(parseDate('2026-11-17T08:30:00').getHours()).toBe(8);
  });

  it('gera rótulos de data e hora', () => {
    expect(weekdayShort('2026-11-17')).toBe('ter');
    expect(dayMonthLabel('2026-11-17')).toBe('17 de nov');
    expect(timeLabel('2026-11-17T08:30:00')).toBe('08:30');
    expect(fullDateLabel('2026-11-17')).toBe('17 de novembro de 2026');
  });

  it.each([
    ['2026-11-17', 'Hoje'],
    ['2026-11-16', 'Ontem'],
    ['2026-11-18', 'Amanhã'],
    ['2026-11-20', 'Em 3 dias'],
    ['2026-11-13', 'Há 4 dias'],
    ['2026-12-25', '25 de dez'],
  ])('relativeDay(%s) = %s', (iso, label) => {
    expect(relativeDay(iso)).toBe(label);
  });

  it('conta dias até uma data', () => {
    expect(daysUntil('2026-11-20')).toBe(3);
    expect(daysUntil('2026-11-15')).toBe(-2);
  });

  it('calcula a idade do pet em meses ou anos', () => {
    expect(petAge(null)).toBeNull();
    expect(petAge('2026-09-17')).toBe('2 meses');
    expect(petAge('2026-10-10')).toBe('1 mês');
    expect(petAge('2025-10-17')).toBe('1 ano');
    expect(petAge('2023-01-17')).toBe('3 anos');
  });

  it.each([
    [9, 'Bom dia'],
    [14, 'Boa tarde'],
    [20, 'Boa noite'],
  ])('greeting às %ih = %s', (hour, text) => {
    jest.setSystemTime(new Date(2026, 10, 17, hour));
    expect(greeting()).toBe(text);
  });

  it('pega o primeiro nome', () => {
    expect(firstName('Gabriel Cordeiro')).toBe('Gabriel');
    expect(firstName(null)).toBe('');
  });

  it('aplica máscara de data progressiva', () => {
    expect(maskDate('1')).toBe('1');
    expect(maskDate('1711')).toBe('17/11');
    expect(maskDate('17112026999')).toBe('17/11/2026');
  });

  it('converte data mascarada em ISO e rejeita inválidas', () => {
    expect(toIsoDate('17/11/2026')).toBe('2026-11-17');
    expect(toIsoDate('17/11')).toBeNull();
    expect(toIsoDate('31/02/2026')).toBeNull();
    expect(toIsoDate('99/99/2026')).toBeNull();
  });

  it('converte ISO em data mascarada', () => {
    expect(fromIsoDate(null)).toBe('');
    expect(fromIsoDate('2026-11-17T00:00:00')).toBe('17/11/2026');
  });

  it('gera a data local mesmo à noite (sem virar o dia pelo UTC)', () => {
    expect(localIso(new Date(2026, 10, 17, 23, 30))).toBe('2026-11-17');
    expect(localIso()).toBe('2026-11-17');
  });
});

describe('joinNames', () => {
  it('junta 0, 1, 2 e 3 nomes', () => {
    expect(joinNames([])).toBe('');
    expect(joinNames(['Thor'])).toBe('Thor');
    expect(joinNames(['Thor', 'Mel'])).toBe('Thor e Mel');
    expect(joinNames(['Thor', 'Mel', 'Bidu'])).toBe('Thor, Mel e Bidu');
  });
});
