import { PiLinkBold, PiTicketBold } from "react-icons/pi";
import { CouponKind } from "../../logic/dealLinks";

const options: { value: CouponKind; label: string; icon: typeof PiTicketBold }[] = [
  { value: "code", label: "A code", icon: PiTicketBold },
  { value: "link", label: "A link", icon: PiLinkBold },
];

// "How do people get the deal?": a code to type at checkout, or a link that applies the discount.
// Used by the share form and the admin edit dialog.
const CouponKindToggle = ({ value, onChange }: { value: CouponKind; onChange: (kind: CouponKind) => void }) => (
  <fieldset>
    <legend className="field-label">How do people get the deal?</legend>
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map(({ value: option, label, icon: Icon }) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option)}
            className={`btn btn-sm h-10 min-h-10 px-4 ${active ? "btn-secondary" : "btn-ghost border-2 border-base-300"}`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  </fieldset>
);

export default CouponKindToggle;
