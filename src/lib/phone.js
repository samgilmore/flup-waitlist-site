function sanitizePhoneDigits(value) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }

  return digits;
}

export function formatUsPhoneNumber(value) {
  const digits = sanitizePhoneDigits(value).slice(0, 10);

  if (!digits) {
    return "";
  }

  if (digits.length < 4) {
    return `(${digits}`;
  }

  if (digits.length < 7) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function normalizeUsPhoneNumber(value) {
  const trimmed = String(value ?? "").trim();

  if (!trimmed) {
    return null;
  }

  const digits = sanitizePhoneDigits(trimmed);

  if (digits.length !== 10) {
    return null;
  }

  return formatUsPhoneNumber(digits);
}
