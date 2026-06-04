/** Server va brauzerda bir xil chiqishi uchun Intl o‘rniga barqaror formatlash. */
export function formatUzs(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${grouped} so'm`;
}

export function calcAdvanceAmount(
  totalAmount: number,
  advancePercent: number
): number {
  if (totalAmount <= 0) return 0;
  const pct = Math.min(100, Math.max(0, advancePercent));
  return Math.round((totalAmount * pct) / 100);
}
