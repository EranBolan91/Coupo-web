interface Props {
  checked: boolean;
  onChange: (on: boolean) => void;
  // Expired coupons that match the current search and filters.
  expiredCount: number;
}

// "Show expired" switch for coupon lists. Hidden when there's nothing expired to show.
const ExpiredToggle = ({ checked, onChange, expiredCount }: Props) => {
  if (expiredCount === 0 && !checked) return null;
  return (
    <label className="flex h-10 cursor-pointer items-center gap-2.5 text-sm font-medium">
      <input
        type="checkbox"
        className="toggle toggle-primary toggle-sm"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        Show expired <span className="text-base-content/60">({expiredCount})</span>
      </span>
    </label>
  );
};

export default ExpiredToggle;
