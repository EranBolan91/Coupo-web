import { CouponTerms, MIN_ORDER_MAX_LENGTH, minOrderError, storeUrlError } from "../../logic/couponTerms";
import Field from "../ui/Field";

interface Props {
  value: CouponTerms;
  onChange: (terms: CouponTerms) => void;
  // Keeps ids unique when several forms are on the page.
  idPrefix: string;
  // Show errors only after the user tried to submit (or always, in edit dialogs).
  showErrors?: boolean;
}

const placeOptions: { value: CouponTerms["usableAt"]; label: string }[] = [
  { value: "", label: "Not sure" },
  { value: "online", label: "Online" },
  { value: "in-store", label: "In store" },
  { value: "both", label: "Both" },
];

// Store link + conditions. Used by the share form and the owner/admin edit dialogs.
const CouponTermsFields = ({ value, onChange, idPrefix, showErrors = true }: Props) => {
  const set = <K extends keyof CouponTerms>(key: K, next: CouponTerms[K]) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-[1fr_12rem]">
        <Field
          label="Store link"
          htmlFor={`${idPrefix}-storeUrl`}
          hint="Optional. Where to use the code."
          error={showErrors ? storeUrlError(value.storeUrl) : undefined}
        >
          <input
            id={`${idPrefix}-storeUrl`}
            type="url"
            inputMode="url"
            placeholder="nike.com"
            autoComplete="off"
            spellCheck={false}
            className="input input-bordered h-12 w-full bg-base-100"
            value={value.storeUrl}
            aria-invalid={showErrors && !!storeUrlError(value.storeUrl)}
            onChange={(e) => set("storeUrl", e.target.value)}
          />
        </Field>
        <Field
          label="Minimum order"
          htmlFor={`${idPrefix}-minOrder`}
          hint="Optional"
          error={showErrors ? minOrderError(value.minOrder) : undefined}
        >
          <input
            id={`${idPrefix}-minOrder`}
            type="text"
            placeholder="e.g. $50"
            maxLength={MIN_ORDER_MAX_LENGTH + 10}
            className="input input-bordered h-12 w-full bg-base-100"
            value={value.minOrder}
            aria-invalid={showErrors && !!minOrderError(value.minOrder)}
            onChange={(e) => set("minOrder", e.target.value)}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="field-label">Where does it work?</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {placeOptions.map((option) => {
            const active = value.usableAt === option.value;
            return (
              <button
                key={option.value || "unknown"}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => set("usableAt", option.value)}
                className={`btn btn-sm h-10 min-h-10 px-4 ${active ? "btn-secondary" : "btn-ghost border-2 border-base-300"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label htmlFor={`${idPrefix}-firstOrder`} className="flex cursor-pointer items-center gap-3">
        <input
          id={`${idPrefix}-firstOrder`}
          type="checkbox"
          className="checkbox checkbox-primary [&:not(:checked)]:bg-base-100"
          checked={value.firstOrderOnly}
          onChange={(e) => set("firstOrderOnly", e.target.checked)}
        />
        <span className="font-semibold">First order only</span>
      </label>
    </div>
  );
};

export default CouponTermsFields;
