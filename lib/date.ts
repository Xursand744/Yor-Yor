/**
 * ISO sana qatorini (YYYY-MM-DD) vaqt zonasidan mustaqil Date obyektiga aylantiradi.
 * PostgreSQL @db.Date bilan mos kelishi uchun kun boshini UTC da saqlaymiz.
 */
export function parseBookingDate(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    throw new Error("INVALID_DATE_FORMAT");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("INVALID_DATE_VALUE");
  }

  return date;
}

export function formatBookingDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfMonthUTC(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

export function endOfMonthUTC(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0));
}
