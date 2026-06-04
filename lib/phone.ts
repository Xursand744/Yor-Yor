export function normalizeUzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    return `+${digits.slice(0, 12)}`;
  }
  return `+998${digits.slice(0, 9)}`;
}

export function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `${digits}@toy24.uz`;
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ");
}
