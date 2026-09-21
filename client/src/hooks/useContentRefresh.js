import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const CONTENT_UPDATED_KEY = "rws_content_updated_at";

/**
 * Call this from the admin CMS right after a successful save/delete.
 * - Same-tab public pages get a window event.
 * - Other open tabs get a `storage` event (fires only in *other* tabs).
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
 * Re-runs `refetch` whenever fresh content may be available:
 * same-tab admin save, other-tab admin save, back/forward navigation
 * within the SPA, or when the tab becomes visible again.
 * `refetch` should update state silently (no loading skeleton flash).
 */
export default function useContentRefresh(refetch, { pollMs = 30000 } = {}) {
  const cb = useRef(refetch);
  cb.current = refetch;
  const lastRun = useRef(0);
  const lastSeen = useRef(0);
  const location = useLocation();

  // Any navigation inside the SPA (public menu, back/forward, or the admin
  // "View site" link) silently re-fetches, so fresh CMS content appears
  // without a manual browser refresh.
  useEffect(() => {
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

  // Same-tab save, other-tab save, tab focus/visibility, plus a light poll
  // for pages left open a long time (e.g. a phone keeps /portfolio open
  // while you save from /admin on a laptop — no browser event can reach it).
  useEffect(() => {
    try {
      lastSeen.current = Number(localStorage.getItem(CONTENT_UPDATED_KEY) || 0);
    } catch {
      lastSeen.current = 0;
    }
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
    let pollId;
    if (pollMs > 0) {
      pollId = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        let stamp = 0;
        try {
          stamp = Number(localStorage.getItem(CONTENT_UPDATED_KEY) || 0);
        } catch {
          stamp = 0;
        }
        // Same device / same browser profile: pick up saves made from a
        // private window, another profile quirk, or a missed storage event.
        if (stamp && stamp !== lastSeen.current) {
          lastSeen.current = stamp;
          runNow();
          return;
        }
        // Different device (phone vs laptop): nothing can push to this tab,
        // so re-fetch quietly on a slow cadence while the page is visible.
        run();
      }, pollMs);
    }
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
      if (pollId) clearInterval(pollId);
    };
  }, [pollMs]);
}
