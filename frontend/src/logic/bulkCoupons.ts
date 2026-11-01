import { CouponTerms, emptyTerms, MIN_ORDER_MAX_LENGTH, normalizeStoreUrl } from "./couponTerms";
import { Coupon } from "../types/CouponType";
import { Timestamp } from "firebase/firestore";

// Bulk import on /admin/import: turns a pasted CSV (or rows copied from a spreadsheet) into
// admin coupons, checking each row the same way the coupon form would.

export const IMPORT_COLUMNS = ["brand", "code", "discount", "expiry", "category", "description", "storeUrl", "minOrder", "usableAt", "firstOrderOnly"] as const;
type Column = (typeof IMPORT_COLUMNS)[number];
const REQUIRED: Column[] = ["brand", "code", "discount", "expiry", "category"];

export const IMPORT_TEMPLATE = [
  IMPORT_COLUMNS.join(","),
  'asos,EXAMPLE20,20,2026-12-31,fashion,"20% off full-price items",asos.com,,online,no',
].join("\n");

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
  const aliases: Record<string, Column> = { store: "brand", name: "brand", link: "storeUrl", url: "storeUrl", details: "description" };
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
    const discount = Number(value.discount.replace("%", ""));
    const noExpiry = isNoExpiry(value.expiry);
    const expiry = noExpiry ? undefined : parseExpiry(value.expiry);

    if (!brand) problems.push("Missing brand");
    else if (!context.brands.has(brand)) notes.push("No logo for this brand yet, so the card shows its first letter");
    if (!code) problems.push("Missing code");
    else if (/\s/.test(code)) problems.push("Code can't contain spaces");
    if (!Number.isInteger(discount) || discount < 1 || discount > 100) problems.push("Discount must be a whole number from 1 to 100");
    if (!expiry && !noExpiry) problems.push('Expiry must be a date like 2026-12-31 or 31/12/2026, or blank / "never" for no expiry');
    else if (expiry && expiry < context.today) problems.push("Already expired");
    if (!category) problems.push(value.category ? `No category "${value.category}". Add it on the Categories page first` : "Missing category");

    const terms: CouponTerms = { ...emptyTerms };
    if (value.storeUrl) {
      terms.storeUrl = normalizeStoreUrl(value.storeUrl);
      if (!terms.storeUrl) problems.push("Store link isn't a web address");
    }
    terms.minOrder = value.minOrder;
    if (terms.minOrder.length > MIN_ORDER_MAX_LENGTH) problems.push(`Min. order must be under ${MIN_ORDER_MAX_LENGTH} characters`);
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
    if (problems.length === 0 && (expiry || noExpiry) && category) {
      const [y, m, d] = (expiry ?? "").split("-").map(Number);
      row.coupon = {
        name: brand,
        imgUrl: context.brands.get(brand) ?? "",
        category,
        code,
        discount,
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
