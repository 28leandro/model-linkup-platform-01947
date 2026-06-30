const RESET_EMAIL_KEY = "passwordResetEmail";
const RECOVERY_ACTIVE_KEY = "passwordRecoveryActive";
const RECOVERY_REQUESTED_AT_KEY = "passwordRecoveryRequestedAt";

const RECOVERY_WINDOW_MS = 60 * 60 * 1000;

export type RecoveryUrlState = {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  hasHashTokens: boolean;
  hasRecoveryMarker: boolean;
  hasAuthParams: boolean;
  error: string | null;
};

const safeStorageGet = (storage: Storage | undefined, key: string) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeStorageSet = (storage: Storage | undefined, key: string, value: string) => {
  try {
    storage?.setItem(key, value);
  } catch {
    // Storage can be blocked in some private/iOS contexts.
  }
};

const safeStorageRemove = (storage: Storage | undefined, key: string) => {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage can be blocked in some private/iOS contexts.
  }
};

export function getPasswordResetRedirectUrl() {
  return `${window.location.origin}/reset-password`;
}

export function rememberPasswordResetEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  safeStorageSet(window.sessionStorage, RESET_EMAIL_KEY, normalized);
  safeStorageSet(window.localStorage, RESET_EMAIL_KEY, normalized);
  safeStorageSet(window.localStorage, RECOVERY_REQUESTED_AT_KEY, String(Date.now()));
}

export function getRememberedPasswordResetEmail() {
  return (
    safeStorageGet(window.sessionStorage, RESET_EMAIL_KEY) ||
    safeStorageGet(window.localStorage, RESET_EMAIL_KEY)
  );
}

export function markPasswordRecoveryActive() {
  safeStorageSet(window.sessionStorage, RECOVERY_ACTIVE_KEY, "1");
}

export function clearPasswordRecoveryState() {
  safeStorageRemove(window.sessionStorage, RECOVERY_ACTIVE_KEY);
  safeStorageRemove(window.sessionStorage, RESET_EMAIL_KEY);
  safeStorageRemove(window.localStorage, RESET_EMAIL_KEY);
  safeStorageRemove(window.localStorage, RECOVERY_REQUESTED_AT_KEY);
}

export function hasRecentPasswordRecoveryRequest() {
  const requestedAt = Number(safeStorageGet(window.localStorage, RECOVERY_REQUESTED_AT_KEY) || 0);
  return Number.isFinite(requestedAt) && Date.now() - requestedAt < RECOVERY_WINDOW_MS;
}

export function isPasswordRecoveryActive() {
  return safeStorageGet(window.sessionStorage, RECOVERY_ACTIVE_KEY) === "1";
}

export function getRecoveryUrlState(href = window.location.href): RecoveryUrlState {
  const url = new URL(href);
  const hashParams = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  const searchParams = url.searchParams;
  const type = searchParams.get("type") || hashParams.get("type");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash") || hashParams.get("token_hash");
  const hasHashTokens =
    hashParams.has("access_token") ||
    hashParams.has("refresh_token") ||
    searchParams.has("access_token") ||
    searchParams.has("refresh_token");
  const error =
    searchParams.get("error") ||
    searchParams.get("error_code") ||
    hashParams.get("error") ||
    hashParams.get("error_code");

  return {
    code,
    tokenHash,
    type,
    hasHashTokens,
    hasRecoveryMarker: type === "recovery" || searchParams.get("recovery") === "1",
    hasAuthParams: Boolean(code || tokenHash || hasHashTokens),
    error,
  };
}

export function shouldTreatUrlAsPasswordRecovery(href = window.location.href) {
  const state = getRecoveryUrlState(href);
  if (state.hasRecoveryMarker || state.tokenHash || state.hasHashTokens) return true;
  return Boolean(state.code && hasRecentPasswordRecoveryRequest());
}

export function cleanPasswordRecoveryUrl() {
  window.history.replaceState({}, "", "/reset-password");
}
