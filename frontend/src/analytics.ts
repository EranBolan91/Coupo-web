import type { Analytics } from "firebase/analytics";
import app from "./firebaseConfig";

// Google Analytics (Firebase). The app sends page views itself (PageViewTracker, on every route change),
// so GA's automatic first page view is turned off. Use track() for actions.
// Only the built site sends data, so the dev server never counts. Don't send names, emails or uids.

type Params = Record<string, string | number | boolean | undefined>;

const enabled = import.meta.env.PROD && !!import.meta.env.VITE_MEASUREMENT_ID;
let analytics: Promise<Analytics | null> | null = null;

// Loaded on demand so it stays out of the first download.
const load = () => {
  if (!enabled) return Promise.resolve(null);
  analytics ??= import("firebase/analytics")
    .then(async ({ initializeAnalytics, isSupported }) =>
      (await isSupported()) ? initializeAnalytics(app, { config: { send_page_view: false } }) : null
    )
    .catch(() => null);
  return analytics;
};

export const startAnalytics = () => void load();

// Never throws: analytics must not get in the visitor's way.
export const track = (name: string, params?: Params) => {
  load()
    .then(async (instance) => {
      if (!instance) return;
      const { logEvent } = await import("firebase/analytics");
      logEvent(instance, name, params);
    })
    .catch(() => {});
};

export const trackPageView = () =>
  track("page_view", { page_location: window.location.href, page_title: document.title });

// Stops counting this browser (used for admins, so your own visits don't skew the numbers).
export const stopAnalytics = () => {
  load()
    .then(async (instance) => {
      if (!instance) return;
      const { setAnalyticsCollectionEnabled } = await import("firebase/analytics");
      setAnalyticsCollectionEnabled(instance, false);
    })
    .catch(() => {});
};
