import { CouponTerms, emptyTerms, normalizeStoreUrl } from "./couponTerms";
import { Coupon } from "../types/CouponType";
import { Timestamp } from "firebase/firestore";
import { CouponDeal, CurrencyCode, MAX_AMOUNT, isCurrency } from "./discount";

// Bulk import on /admin/import: turns a pasted CSV (or rows copied from a spreadsheet) into
// admin coupons, checking each row the same way the coupon form would.

export const IMPORT_COLUMNS = ["brand", "code", "discount", "expiry", "category", "description", "storeUrl", "minSpend", "usableAt", "firstOrderOnly"] as const;
type Column = (typeof IMPORT_COLUMNS)[number];
const REQUIRED: Column[] = ["brand", "code", "discount", "expiry", "category"];

export const IMPORT_TEMPLATE = [
  IMPORT_COLUMNS.join(","),
  'asos,EXAMPLE20,20%,2026-12-31,fashion,"20% off full-price items",asos.com,,online,no',
  "asos,EXAMPLE50,£50,2026-12-31,fashion,,asos.com,200,online,no",
  "asos,FREESHIP,free shipping,never,fashion,,asos.com,£35,online,no",
].join("\n");

// Currency symbols and names people write, longest first so "CA$" wins over "$".
const CURRENCY_WORDS: [string, CurrencyCode][] = [
  ["ca$", "CAD"], ["a$", "AUD"], ["r$", "BRL"], ["$", "USD"], ["€", "EUR"], ["£", "GBP"], ["₪", "ILS"], ["₹", "INR"], ["¥", "JPY"],
  ["nis", "ILS"], ["shekels", "ILS"], ["shekel", "ILS"],
];

// "₪50", "50 ILS", "$12.50", "1,000", "50" → { amount, currency? }, or undefined if it isn't an amount.
export const parseMoney = (input: string): { amount: number; currency?: CurrencyCode } | undefined => {
  let text = input.trim().toLowerCase();
  let currency: CurrencyCode | undefined;
  const code = text.match(/\b([a-z]{3})\b/);
  if (code && isCurrency(code[1].toUpperCase())) {
    currency = code[1].toUpperCase() as CurrencyCode;
    text = text.replace(code[0], "");
  } else {
    const word = CURRENCY_WORDS.find(([w]) => text.includes(w));
    if (word) {
      currency = word[1];
      text = text.replace(word[0], "");
    }
  }
  text = text.replace(/[\s,]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return undefined;
  const amount = Number(text);
  return amount > 0 && amount <= MAX_AMOUNT ? { amount, currency } : undefined;
};

// The discount cell: "20" or "20%" is percent off (as before), "free shipping" is free shipping, and an
// amount with its currency ("₪50", "50 ILS", "$10") is an amount off.
export const parseDiscount = (
  input: string
): { type: CouponDeal["discountType"]; value: number; currency?: CurrencyCode } | { error: string } => {
  const text = input.trim().toLowerCase();
  if (/^(free\s*)?shipping$|^free\s*delivery$/.test(text)) return { type: "shipping", value: 0 };
  if (/^\d+(\.\d+)?\s*%?$/.test(text)) {
    const value = Number(text.replace("%", "").trim());
    return Number.isInteger(value) && value >= 1 && value <= 100 ? { type: "percent", value } : { error: "Percent off must be a whole number from 1 to 100" };
  }
  const money = parseMoney(text);
  if (!money) return { error: 'Discount must be like 20%, ₪50, 50 ILS or "free shipping"' };
  return money.currency ? { type: "amount", value: money.amount, currency: money.currency } : { error: "Add the currency, like ₪50 or 50 ILS" };
};

// Splits CSV text into rows of cells. Handles quoted cells ("a, b" and "say ""hi""") and line breaks
// inside quotes. Uses tabs instead of commas when the first line has a tab (rows pasted from a spreadsheet).
export const parseCsv = (text: string): string[][] => {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const separator = firstLine.includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell.trim() === "") {
      quoted = true;
      cell = "";
    } else if (char === separator) {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some((c) => c !== ""));
};

// "Store URL", "store_url" and "storeurl" all mean storeUrl.
const columnFor = (header: string): Column | undefined => {
  const key = header.toLowerCase().replace(/[^a-z]/g, "");
  const aliases: Record<string, Column> = {
    store: "brand",
    name: "brand",
    link: "storeUrl",
    url: "storeUrl",
    details: "description",
    // Older templates had a free-text minOrder column; amounts in it become the minimum spend.
    minorder: "minSpend",
    minimumspend: "minSpend",
    minimumorder: "minSpend",
  };
  return IMPORT_COLUMNS.find((c) => c.toLowerCase() === key) ?? aliases[key];
};

// "2026-12-31" or "31/12/2026" (also with - or .) → "2026-12-31", or undefined if it isn't a real date.
export const parseExpiry = (input: string): string | undefined => {
  const iso = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const dmy = input.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  const parts = iso ? [iso[1], iso[2], iso[3]] : dmy ? [dmy[3], dmy[2], dmy[1]] : undefined;
  if (!parts) return undefined;
  const [y, m, d] = parts;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) return undefined;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

// A blank expiry cell, or one of these, means the coupon has no expiry date.
const NO_EXPIRY = ["", "never", "none", "no", "no expiry", "-"];
export const isNoExpiry = (input: string) => NO_EXPIRY.includes(input.trim().toLowerCase());

const yes = (input: string) => ["yes", "y", "true", "1", "x"].includes(input.toLowerCase());

export type ImportRow = {
  line: number; // line number in the pasted text, counting the header as 1
  brand: string;
  code: string;
  discount: string;
  expiry: string;
  problems: string[]; // the row is skipped
  notes: string[]; // the row is published anyway
  coupon?: Omit<Coupon, "id">; // set when there are no problems
};

export type ImportContext = {
  brands: Map<string, string>; // lowercase brand name → logo URL
  categories: Map<string, string>; // lowercase → the category name as stored
  existing: Set<string>; // couponKey() of every coupon already on Coupo
  today: string; // YYYY-MM-DD
};

export const couponKey = (brand: string, code: string) => `${brand.trim().toLowerCase()}|${code.trim().toUpperCase()}`;

export type ImportResult = { error?: string; rows: ImportRow[] };

export const checkImport = (text: string, context: ImportContext): ImportResult => {
  const [header, ...lines] = parseCsv(text);
  if (!header) return { rows: [] };
  const columns = header.map(columnFor);
  const missing = REQUIRED.filter((c) => !columns.includes(c));
  if (missing.length) {
    return { rows: [], error: `The first line must name the columns. Missing: ${missing.join(", ")}.` };
  }
  const seen = new Set(context.existing);

  const rows = lines.map((cells, i): ImportRow => {
    const value = Object.fromEntries(IMPORT_COLUMNS.map((c) => [c, ""])) as Record<Column, string>;
    columns.forEach((column, index) => {
      if (column) value[column] = cells[index] ?? "";
    });
    const problems: string[] = [];
    const notes: string[] = [];
    const brand = value.brand.toLowerCase().replace(/\s+/g, " ");
    const code = value.code.toUpperCase();
    const category = context.categories.get(value.category.toLowerCase());
    const parsed = parseDiscount(value.discount);
    const noExpiry = isNoExpiry(value.expiry);
    const expiry = noExpiry ? undefined : parseExpiry(value.expiry);

    if (!brand) problems.push("Missing brand");
    else if (!context.brands.has(brand)) notes.push("No logo for this brand yet, so the card shows its first letter");
    if (!code) problems.push("Missing code");
    else if (/\s/.test(code)) problems.push("Code can't contain spaces");
    if ("error" in parsed) problems.push(parsed.error);
    const minSpend = value.minSpend.trim() ? parseMoney(value.minSpend) : undefined;
    if (value.minSpend.trim() && !minSpend) problems.push("Minimum spend must be an amount, like 100 or ₪100");
    const currency = ("error" in parsed ? undefined : parsed.currency) ?? minSpend?.currency;
    if (minSpend && !currency) problems.push("Add the currency to the minimum spend, like ₪100 or 100 ILS");
    if (!("error" in parsed) && parsed.type === "amount" && minSpend && minSpend.currency && parsed.currency && minSpend.currency !== parsed.currency) {
      problems.push("Discount and minimum spend are in different currencies");
    }
    if (!("error" in parsed) && parsed.type === "amount" && minSpend && parsed.value >= minSpend.amount) {
      problems.push("Minimum spend should be more than the amount off");
    }
    if (!expiry && !noExpiry) problems.push('Expiry must be a date like 2026-12-31 or 31/12/2026, or blank / "never" for no expiry');
    else if (expiry && expiry < context.today) problems.push("Already expired");
    if (!category) problems.push(value.category ? `No category "${value.category}". Add it on the Categories page first` : "Missing category");

    const terms: CouponTerms = { ...emptyTerms };
    if (value.storeUrl) {
      terms.storeUrl = normalizeStoreUrl(value.storeUrl);
      if (!terms.storeUrl) problems.push("Store link isn't a web address");
    }
    const usableAt = value.usableAt.toLowerCase().replace(/\s+/g, "-");
    if (usableAt === "online" || usableAt === "in-store" || usableAt === "both") terms.usableAt = usableAt;
    else if (usableAt) problems.push('Usable at must be "online", "in-store" or "both"');
    terms.firstOrderOnly = yes(value.firstOrderOnly);

    if (brand && code) {
      const key = couponKey(brand, code);
      if (seen.has(key)) problems.push(context.existing.has(key) ? "Already on Coupo" : "Listed twice");
      seen.add(key);
    }

    const row: ImportRow = { line: i + 2, brand, code, discount: value.discount, expiry: noExpiry ? "No expiry" : expiry ?? value.expiry, problems, notes };
    if (problems.length === 0 && (expiry || noExpiry) && category && !("error" in parsed)) {
      const [y, m, d] = (expiry ?? "").split("-").map(Number);
      row.coupon = {
        name: brand,
        imgUrl: context.brands.get(brand) ?? "",
        category,
        code,
        discountType: parsed.type,
        discount: parsed.value,
        currency: currency ?? "USD",
        minSpend: minSpend?.amount ?? null,
        description: value.description,
        userID: "",
        username: "Coupo",
        likes: 0,
        dislikes: 0,
        expiry: expiry ? Timestamp.fromDate(new Date(y, m - 1, d, 23, 59, 59)) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        type: "coupon",
        ...terms,
      };
    }
    return row;
  });
  return { rows };
};
