import { PiArrowClockwiseBold } from "react-icons/pi";
import EmptyState from "./EmptyState";

interface Props {
  // What failed to load, e.g. "coupons" -> "Couldn't load the coupons".
  what: string;
  onRetry?: () => void;
}

// Shown in place of a list when loading it failed, so a failed request never looks like an empty list.
const LoadError = ({ what, onRetry }: Props) => (
  <div role="alert">
    <EmptyState
      title={`Couldn't load the ${what}`}
      description="Check your connection and try again."
      action={
        onRetry && (
          <button type="button" onClick={onRetry} className="btn btn-primary">
            <PiArrowClockwiseBold aria-hidden />
            Try again
          </button>
        )
      }
    />
  </div>
);

export default LoadError;
