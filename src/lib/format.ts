export type DateFormat = 'YYYY.MM.DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';

export interface FormatDateOptions {
  timezone?: string;
  dateFormat?: DateFormat | string;
  withTime?: boolean;
}

const DEFAULT_TIMEZONE = 'Asia/Seoul';
const DEFAULT_DATE_FORMAT: DateFormat = 'YYYY.MM.DD';

// 환경 설정(타임존/날짜 형식)에 맞춰 날짜를 표시용 문자열로 변환한다.
export function formatDate(date: Date | string | null | undefined, opts: FormatDateOptions = {}): string {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';

  const timeZone = opts.timezone || DEFAULT_TIMEZONE;
  const dateFormat = (opts.dateFormat as DateFormat) || DEFAULT_DATE_FORMAT;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(d).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {} as Record<string, string>);

  const { year, month, day } = parts;
  let formatted: string;
  switch (dateFormat) {
    case 'DD/MM/YYYY':
      formatted = `${day}/${month}/${year}`;
      break;
    case 'MM/DD/YYYY':
      formatted = `${month}/${day}/${year}`;
      break;
    default:
      formatted = `${year}.${month}.${day}`;
  }

  if (opts.withTime) {
    const time = new Intl.DateTimeFormat('ko-KR', {
      timeZone, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(d);
    formatted += ` ${time}`;
  }

  return formatted;
}
