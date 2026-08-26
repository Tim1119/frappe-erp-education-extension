let redirecting = false;

export function getCsrfToken() {
  const cookie = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return window.csrf_token
    || document.querySelector('meta[name="csrf-token"]')?.content
    || (cookie ? decodeURIComponent(cookie[1]) : "");
}

export function isExpiredSessionResponse(status, payload) {
  const type = payload?.exc_type || "";
  const exception = payload?.exception || "";
  return type === "CSRFTokenError"
    || /CSRFTokenError|csrf token/i.test(exception)
    || (status === 401 && /AuthenticationError|SessionExpired|Guest/i.test(`${type} ${exception}`));
}

export function redirectToLogin() {
  if (redirecting) return;
  redirecting = true;
  const target = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(`/login?redirect-to=${encodeURIComponent(target)}`);
}
