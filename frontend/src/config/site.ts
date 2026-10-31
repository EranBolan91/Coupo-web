// The site's public address, used for canonical links and link previews. To move to a custom domain,
// set VITE_SITE_URL in frontend/.env (e.g. VITE_SITE_URL=https://coupo.com) and SITE_URL in
// "cloud functions/functions/.env", then deploy functions and hosting. No trailing slash.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://coupo-e03c4.web.app").replace(/\/+$/, "");

export const DEFAULT_DESCRIPTION = "Find, share and vote on coupon codes.";
