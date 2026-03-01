const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface StoredValue {
  value: string;
  expiresAt: number;
}

function makeKey(slug: string, suffix: string) {
  return `popup-${suffix}-${slug}`;
}

export function getPopupValue(slug: string, suffix: string): string | null {
  try {
    const raw = localStorage.getItem(makeKey(slug, suffix));
    if (!raw) return null;
    const parsed: StoredValue = JSON.parse(raw);
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(makeKey(slug, suffix));
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

export function setPopupValue(slug: string, suffix: string, value: string) {
  try {
    const stored: StoredValue = {
      value,
      expiresAt: Date.now() + TTL_MS,
    };
    localStorage.setItem(makeKey(slug, suffix), JSON.stringify(stored));
  } catch {
    // localStorage full or unavailable
  }
}

export function wasEmailPopupDismissed(slug: string): boolean {
  return getPopupValue(slug, "email-dismissed") === "true";
}

export function wasEmailPopupConverted(slug: string): boolean {
  return getPopupValue(slug, "email-converted") === "true";
}

export function setEmailPopupDismissed(slug: string) {
  setPopupValue(slug, "email-dismissed", "true");
}

export function setEmailPopupConverted(slug: string) {
  setPopupValue(slug, "email-converted", "true");
}

export function wasExitIntentDismissed(slug: string): boolean {
  return getPopupValue(slug, "exit-dismissed") === "true";
}

export function wasExitIntentConverted(slug: string): boolean {
  return getPopupValue(slug, "exit-converted") === "true";
}

export function setExitIntentDismissed(slug: string) {
  setPopupValue(slug, "exit-dismissed", "true");
}

export function setExitIntentConverted(slug: string) {
  setPopupValue(slug, "exit-converted", "true");
}

/** Dispatch a custom event to coordinate between popups */
export function dispatchPopupEvent(name: string) {
  window.dispatchEvent(new CustomEvent(name));
}
