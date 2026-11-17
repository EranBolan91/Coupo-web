import { CURRENCIES, CurrencyCode, DealInput, DiscountType, currencySymbol, dealErrors } from "../../logic/discount";
import Field from "../ui/Field";

interface Props {
  value: DealInput;
  onChange: (deal: DealInput) => void;
  // Keeps ids unique when several forms are on the page.
  idPrefix: string;
  // Show errors only after the user tried to submit (or always, in edit dialogs).
  showErrors?: boolean;
}

const typeOptions: { value: DiscountType; label: string }[] = [
  { value: "percent", label: "% off" },
  { value: "amount", label: "Amount off" },
  { value: "shipping", label: "Free shipping" },
];

const CurrencySelect = ({ id, value, onChange }: { id: string; value: CurrencyCode; onChange: (code: CurrencyCode) => void }) => (
  <select
    id={id}
    aria-label="Currency"
    className="join-item select select-bordered h-12 w-28 shrink-0 bg-base-100 pl-4 pr-8 font-bold"
    value={value}
    onChange={(e) => onChange(e.target.value as CurrencyCode)}
  >
    {CURRENCIES.map((currency) => (
      <option key={currency.code} value={currency.code}>
        {currency.symbol === currency.code ? currency.code : `${currency.symbol} ${currency.code}`}
      </option>
    ))}
  </select>
);

// What the coupon gives: percent off, an amount off or free shipping, plus an optional minimum spend.
// Used by the share form and the owner/admin edit dialogs.
const CouponDealFields = ({ value, onChange, idPrefix, showErrors = true }: Props) => {
  const set = <K extends keyof DealInput>(key: K, next: DealInput[K]) => onChange({ ...value, [key]: next });
  const errors = showErrors ? dealErrors(value) : {};
  const id = (name: string) => `${idPrefix}-${name}`;
  const isAmount = value.discountType === "amount";

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="field-label">Discount</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {typeOptions.map((option) => {
            const active = value.discountType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ ...value, discountType: option.value, discount: active ? value.discount : "" })}
                className={`btn btn-sm h-10 min-h-10 px-4 ${active ? "btn-secondary" : "btn-ghost border-2 border-base-300"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        {value.discountType === "percent" && (
          <Field label="Percent off" htmlFor={id("discount")} error={errors.discount}>
            <div className="join w-full">
              <input
                id={id("discount")}
                type="number"
                min={1}
                max={100}
                inputMode="numeric"
                placeholder="20"
                className="join-item input input-bordered h-12 w-full min-w-0 bg-base-100"
                value={value.discount}
                aria-invalid={!!errors.discount}
                onChange={(e) => set("discount", e.target.value)}
              />
              <span className="join-item flex h-12 items-center border border-base-content/20 bg-base-200 px-4 font-bold" aria-hidden>
                %
              </span>
            </div>
          </Field>
        )}
        {isAmount && (
          <Field label="Amount off" htmlFor={id("discount")} error={errors.discount}>
            <div className="join w-full">
              <CurrencySelect id={id("currency")} value={value.currency} onChange={(code) => set("currency", code)} />
              <input
                id={id("discount")}
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                placeholder="50"
                className="join-item input input-bordered h-12 w-full min-w-0 bg-base-100"
                value={value.discount}
                aria-invalid={!!errors.discount}
                onChange={(e) => set("discount", e.target.value)}
              />
            </div>
          </Field>
        )}
        <Field
          label="Minimum spend"
          htmlFor={id("minSpend")}
          hint="Optional. Leave empty if any order works."
          error={errors.minSpend}
        >
          <div className="join w-full">
            {isAmount ? (
              <span className="join-item flex h-12 min-w-12 items-center justify-center border border-base-content/20 bg-base-200 px-4 font-bold" aria-hidden>
                {currencySymbol(value.currency)}
              </span>
            ) : (
              <CurrencySelect id={id("minCurrency")} value={value.currency} onChange={(code) => set("currency", code)} />
            )}
            <input
              id={id("minSpend")}
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="100"
              className="join-item input input-bordered h-12 w-full min-w-0 bg-base-100"
              value={value.minSpend}
              aria-invalid={!!errors.minSpend}
              onChange={(e) => set("minSpend", e.target.value)}
            />
          </div>
        </Field>
      </div>
    </div>
  );
};

export default CouponDealFields;
