import { UserDocument } from "../../../../types/UserType";

const formatDate = (date?: Date) =>
  date ? date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "Not set";

// Read-only account details. Editing happens in ModalPersonalInfo (opened from the profile header).
const PersonalInfo = ({ currentUser }: { currentUser: UserDocument | null }) => {
  if (currentUser === null) return null;

  const rows = [
    { label: "Name", value: `${currentUser.firstName} ${currentUser.lastName}`.trim() },
    { label: "Email", value: currentUser.email },
    { label: "Date of birth", value: formatDate(currentUser.birthday?.toDate()) },
    { label: "Member since", value: formatDate(currentUser.creationDate?.toDate?.()) },
  ];

  return (
    <dl className="overflow-hidden rounded-box bg-base-100">
      {rows.map((row, i) => (
        <div key={row.label} className="relative grid gap-1 px-6 py-5 sm:grid-cols-3 sm:gap-4">
          {i > 0 && <span className="perf-x absolute inset-x-6 top-0 text-base-300" aria-hidden="true" />}
          <dt className="text-sm font-semibold text-base-content/60">{row.label}</dt>
          <dd className="break-words font-semibold sm:col-span-2">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default PersonalInfo;
