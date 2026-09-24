import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const CONTENT_UPDATED_KEY = "rws_content_updated_at";

/**
 * Call this from the admin CMS right after a successful save/delete.
 * - Same-tab public pages get a window event.
 * - Other open tabs get a `storage` event (fires only in other tabs).
 */
export function notifyContentUpdated() {
  try {
    localStorage.setItem(CONTENT_UPDATED_KEY, String(Date.now()));
  } catch {
    /* storage may be unavailable (private mode) — window event still works */
  }
  window.dispatchEvent(new Event("rws:content-updated"));
}

/**
 * Re-runs `refetch` after an Admin save, SPA navigation, tab focus/visibility,
 * or a back/forward cache restore. No continuous polling is needed.
 * `refetch` should update state silently (no loading skeleton flash).
 */
export default function useContentRefresh(refetch) {
  const cb = useRef(refetch);
  cb.current = refetch;
  const lastRun = useRef(0);
  const previousLocation = useRef(null);
  const location = useLocation();

  // Existing components fetch once on mount; only re-fetch on later SPA
  // navigations here to avoid duplicating that initial request.
  useEffect(() => {
    const currentLocation = `${location.pathname}${location.search}`;
    if (previousLocation.current === null) {
      previousLocation.current = currentLocation;
      return;
    }
    previousLocation.current = currentLocation;
    const now = Date.now();
    if (now - lastRun.current < 1500) return;
    lastRun.current = now;
    try {
      cb.current?.();
    } catch {
      /* never break the page because a background refresh failed */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Same-tab saves use the custom event, other tabs use the storage event,
  // and focus/visibility events refresh pages when a user returns to them.
  useEffect(() => {
    const run = ({ throttle = true } = {}) => {
      const now = Date.now();
      // Focus + visibility events often fire back-to-back after a tab
      // switch, but an explicit admin save must never be swallowed.
      if (throttle && now - lastRun.current < 1500) return;
      lastRun.current = now;
      try {
        cb.current?.();
      } catch {
        /* never break the page because a background refresh failed */
      }
    };
    const runNow = () => run({ throttle: false });
    const onStorage = (e) => {
      if (e.key === CONTENT_UPDATED_KEY) runNow();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") run();
    };
    const onPageShow = (e) => {
      // Fired on normal loads AND on back/forward cache restores
      // (React Router navigations don't reload, so this never loops).
      if (e.persisted) runNow();
    };
    window.addEventListener("focus", run);
    window.addEventListener("rws:content-updated", runNow);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", run);
      window.removeEventListener("rws:content-updated", runNow);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}
