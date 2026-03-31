// lib/utils/date.ts
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function parseLooseDate(input?: string | null): Date | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  // try native
  const d0 = new Date(s);
  if (!Number.isNaN(d0.getTime())) return d0;

  // digits only
  const digits = s.replace(/\D/g, "");

  // YYYYMMDD
  if (digits.length === 8) {
    const y = Number(digits.slice(0, 4));
    const m = Number(digits.slice(4, 6));
    const day = Number(digits.slice(6, 8));
    if (y >= 1900 && m >= 1 && m <= 12 && day >= 1 && day <= 31) {
      return new Date(Date.UTC(y, m - 1, day));
    }
  }

  // 6 digits: MMYYYY (common when leading 0 lost) OR YYYYMM
  if (digits.length === 6) {
    const a = Number(digits.slice(0, 2));
    const b = Number(digits.slice(2, 6));

    // treat as MMYYYY if first two between 1..12
    if (a >= 1 && a <= 12 && b >= 1900 && b <= 2100) {
      return new Date(Date.UTC(b, a - 1, 1));
    }

    // treat as YYYYMM if last two between 1..12
    const y = Number(digits.slice(0, 4));
    const m = Number(digits.slice(4, 6));
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12) {
      return new Date(Date.UTC(y, m - 1, 1));
    }
  }

  // 4 digits: YYYY
  if (digits.length === 4) {
    const y = Number(digits);
    if (y >= 1900 && y <= 2100) return new Date(Date.UTC(y, 0, 1));
  }

  return null;
}

export function formatMonthYearTR(input?: string | null, lang: "tr" | "en" = "tr"): string | null {
  const d = parseLooseDate(input);
  if (!d) return input ?? null;
  return d.toLocaleDateString(lang === "en" ? "en-US" : "tr-TR", { year: "numeric", month: "long" });
}
