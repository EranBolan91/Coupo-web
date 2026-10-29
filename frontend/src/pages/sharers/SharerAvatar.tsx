// Letter avatar for a sharer (profile photos live on private Users docs, so public pages use initials).
// inverted: ink circle with lime letters, for use on a lime background.
const SharerAvatar = ({
  name,
  className = "size-12 text-xl",
  inverted = false,
}: {
  name: string;
  className?: string;
  inverted?: boolean;
}) => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-extrabold ${
        inverted ? "bg-primary-content text-primary" : "bg-primary text-primary-content"
      } ${className}`}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
};

export default SharerAvatar;
