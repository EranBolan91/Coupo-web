import { trackPageView } from "../../analytics";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

// Sends a Google Analytics page view on every page change (path only: typing a search or changing
// filters updates the query string and isn't a new page). Waits a moment so pages that set their
// title from loaded data (coupon, store) usually report the right title.
const PageViewTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const timer = setTimeout(trackPageView, 1000);
    return () => clearTimeout(timer);
  }, [pathname]);
  return null;
};

export default PageViewTracker;
