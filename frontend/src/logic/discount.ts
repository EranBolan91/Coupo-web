import { Coupon } from "../types/CouponType";

// What kind of discount a coupon gives. Coupons saved before this existed have no discountType
// and are percent off, so always read it through discountTypeOf.
export const DISCOUNT_TYPES = ["percent", "amount", "shipping"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const discountTypeOf = (coupon: Partial<Pick<Coupon, "discountType">>): DiscountType =>
  coupon.discountType === "amount" || coupon.discountType === "shipping" ? coupon.discountType : "percent";

// Currencies a sharer can pick, most used first. Stored as the ISO code.
export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "ILS", symbol: "₪" },
  { code: "CAD", symbol: "CA$" },
  { code: "AUD", symbol: "A$" },
  { code: "INR", symbol: "₹" },
  { code: "JPY", symbol: "¥" },
  { code: "CHF", symbol: "CHF" },
  { code: "BRL", symbol: "R$" },
] as const;
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const isCurrency = (value: unknown): value is CurrencyCode => CURRENCIES.some((c) => c.code === value);

export const currencySymbol = (code: string) => CURRENCIES.find((c) => c.code === code)?.symbol ?? code;

const EURO_REGIONS = ["AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK"];
const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", GB: "GBP", IL: "ILS", CA: "CAD", AU: "AUD", IN: "INR", JP: "JPY", CH: "CHF", BR: "BRL",
};

// A sensible first choice for the currency picker, from the browser's language (he-IL → ILS).
export const defaultCurrency = (languages: readonly string[] = typeof navigator === "undefined" ? [] : navigator.languages ?? []): CurrencyCode => {
  for (const language of languages) {
    const region = language.split("-")[1]?.toUpperCase();
    if (language.toLowerCase().startsWith("he")) return "ILS";
    if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
    if (region && EURO_REGIONS.includes(region)) return "EUR";
  }
  return "USD";
};

// "₪50", "$12.50", "€1,000". Whole amounts have no decimals.
export const formatMoney = (amount: number, currency?: string) => {
  const code = isCurrency(currency) ? currency : "USD";
  const whole = Number.isInteger(amount);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currencySymbol(code)}${amount}`;
  }
};

type DealFields = Partial<Pick<Coupon, "discount" | "discountType" | "currency" | "minSpend">>;

// The minimum spend, or 0 when there is none.
export const minSpendOf = (coupon: DealFields) => {
  const value = Number(coupon.minSpend);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

// The main line: "20% off", "₪50 off", "Free shipping", or "" when there's no usable discount.
// Same wording as discountLabel in functions/src/couponPreview.ts (link previews); keep them in step.
export const discountLabel = (coupon: DealFields) => {
  const type = discountTypeOf(coupon);
  const value = Number(coupon.discount) || 0;
  if (type === "shipping") return "Free shipping";
  if (value <= 0) return "";
  return type === "amount" ? `${formatMoney(value, coupon.currency)} off` : `${value}% off`;
};

// The full deal: "₪50 off orders of ₪100+", "15% off", "Free shipping on orders of $35+".
export const dealText = (coupon: DealFields) => {
  const min = minSpendOf(coupon);
  const label = discountLabel(coupon);
  if (!label || min <= 0) return label;
  return `${label} ${discountTypeOf(coupon) === "shipping" ? "on orders" : "orders"} of ${formatMoney(min, coupon.currency)}+`;
};

// "₪50 off orders of ₪200+ at Fox" or "Coupon for Fox". Same as couponTitle on the server.
export const couponTitle = (coupon: DealFields & { name?: string }) => {
  const deal = dealText(coupon);
  return deal ? `${deal} at ${coupon.name}` : `Coupon for ${coupon.name}`;
};

// For the yellow price tag: a big part and a small part ("20%" + "off", "₪50" + "off", "Free" + "shipping").
export const tagParts = (coupon: DealFields): { big: string; small: string } => {
  const type = discountTypeOf(coupon);
  const value = Number(coupon.discount) || 0;
  if (type === "shipping") return { big: "Free", small: "shipping" };
  if (type === "amount") return { big: formatMoney(value, coupon.currency), small: "off" };
  return { big: `${value}%`, small: "off" };
};

// The percent off, for percent coupons only (0 for the others). Used for "up to X% off".
export const percentOff = (coupon: DealFields) => (discountTypeOf(coupon) === "percent" ? Number(coupon.discount) || 0 : 0);

// How good the deal is as a percent, for sorting "Biggest discount" and the "25% or more" filter.
// A fixed amount with a minimum spend counts as amount / minimum (50 off 100 = 50%). A fixed amount
// with no minimum, or free shipping, can't be compared to a percent, so it's undefined.
export const percentValue = (coupon: DealFields): number | undefined => {
  const type = discountTypeOf(coupon);
  if (type === "percent") return Number(coupon.discount) || 0;
  const min = minSpendOf(coupon);
  if (type === "amount" && min > 0) return Math.min(100, ((Number(coupon.discount) || 0) / min) * 100);
  return undefined;
};

// Sort order for "Biggest discount": comparable deals by percent, then fixed amounts with no
// minimum (bigger first, any currency), then free shipping.
export const compareDiscounts = (a: DealFields, b: DealFields) => {
  const rank = (coupon: DealFields) => (percentValue(coupon) !== undefined ? 0 : discountTypeOf(coupon) === "amount" ? 1 : 2);
  const rankDiff = rank(a) - rank(b);
  if (rankDiff) return rankDiff;
  const value = (coupon: DealFields) => percentValue(coupon) ?? (Number(coupon.discount) || 0);
  return value(b) - value(a);
};

// ---- Form ----

// What the deal fields in the forms edit. Numbers are kept as typed text.
export interface DealInput {
  discountType: DiscountType;
  discount: string;
  currency: CurrencyCode;
  minSpend: string;
}

export const emptyDeal = (): DealInput => ({ discountType: "percent", discount: "", currency: defaultCurrency(), minSpend: "" });

export const dealOf = (coupon: DealFields): DealInput => {
  const type = discountTypeOf(coupon);
  const min = minSpendOf(coupon);
  return {
    discountType: type,
    discount: type === "shipping" ? "" : String(coupon.discount ?? ""),
    currency: isCurrency(coupon.currency) ? coupon.currency : defaultCurrency(),
    minSpend: min > 0 ? String(min) : "",
  };
};

export const MAX_AMOUNT = 1_000_000;
const parseAmount = (text: string) => (text.trim() === "" ? NaN : Number(text.trim().replace(/,/g, "")));
const twoDecimals = (value: number) => Math.round(value * 100) === value * 100;

export const dealErrors = (deal: DealInput): { discount?: string; minSpend?: string } => {
  const errors: { discount?: string; minSpend?: string } = {};
  const value = parseAmount(deal.discount);
  if (deal.discountType === "percent") {
    if (deal.discount.trim() === "") errors.discount = "Discount is required";
    else if (!Number.isInteger(value) || value < 1 || value > 100) errors.discount = "1 to 100";
  } else if (deal.discountType === "amount") {
    if (deal.discount.trim() === "") errors.discount = "Amount is required";
    else if (!Number.isFinite(value) || value <= 0 || value > MAX_AMOUNT || !twoDecimals(value)) errors.discount = "Enter an amount, like 50";
  }
  if (deal.minSpend.trim() !== "") {
    const min = parseAmount(deal.minSpend);
    if (!Number.isFinite(min) || min <= 0 || min > MAX_AMOUNT || !twoDecimals(min)) errors.minSpend = "Enter an amount, like 100";
    else if (deal.discountType === "amount" && Number.isFinite(value) && value >= min) errors.minSpend = "Should be more than the amount off";
  }
  return errors;
};

export const dealError = (deal: DealInput) => {
  const errors = dealErrors(deal);
  return errors.discount ?? errors.minSpend;
};

// The deal fields as saved on a coupon.
export type CouponDeal = Required<Pick<Coupon, "discountType" | "discount" | "currency">> & { minSpend: number | null };

// The fields saved on the coupon. Free shipping saves discount 0; no minimum saves minSpend null.
export const cleanDeal = (deal: DealInput): CouponDeal => {
  const min = parseAmount(deal.minSpend);
  return {
    discountType: deal.discountType,
    discount: deal.discountType === "shipping" ? 0 : parseAmount(deal.discount) || 0,
    currency: deal.currency,
    minSpend: Number.isFinite(min) && min > 0 ? min : null,
  };
};
