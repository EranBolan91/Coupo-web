import { PiInstagramLogoBold, PiStorefrontBold } from "react-icons/pi";
import PageHeader from "../ui/PageHeader";
import AddUserSocialCoupon from "./AddUserSocialCoupon";
import AddUserCoupon from "./AddUserCoupon";
import { useState } from "react";

const kinds = [
  { id: "store", label: "Store coupon", icon: PiStorefrontBold, hint: "A code for a brand in our list" },
  { id: "social", label: "Social coupon", icon: PiInstagramLogoBold, hint: "A code you saw on social media" },
] as const;

const AddCouponPage = () => {
  const [kind, setKind] = useState<(typeof kinds)[number]["id"]>("store");

  return (
    <>
      <PageHeader
        title={
          <>
            Share a <span className="marker">coupon</span>
          </>
        }
        description="Found a code that works? Add it here and help everyone save."
      />
      <section className="page-container py-10">
        <div role="radiogroup" aria-label="Coupon type" className="mb-10 grid gap-3 sm:inline-grid sm:grid-cols-2">
          {kinds.map(({ id, label, icon: Icon, hint }) => {
            const active = kind === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setKind(id)}
                className={`relative flex items-center gap-4 rounded-box border-2 p-4 pr-6 text-left transition-colors ${
                  active ? "border-base-content bg-base-100" : "border-base-300 bg-base-100/50 hover:border-base-content/40"
                }`}
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full transition-colors ${
                    active ? "bg-primary text-primary-content" : "bg-base-200"
                  }`}
                >
                  <Icon className="size-6" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-xl font-extrabold tracking-tight">{label}</span>
                  <span className="block text-sm text-base-content/60">{hint}</span>
                </span>
              </button>
            );
          })}
        </div>
        {kind === "store" ? <AddUserCoupon /> : <AddUserSocialCoupon />}
      </section>
    </>
  );
};

export default AddCouponPage;
