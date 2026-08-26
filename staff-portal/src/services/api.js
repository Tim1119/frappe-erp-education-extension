// services/api.js
import {
  getCsrfToken,
  isExpiredSessionResponse,
  redirectToLogin,
} from "./sessionExpiry";

export default async function api(method, args = {}) {
  // Get CSRF token from meta tag
  // let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
  const csrfToken = getCsrfToken();

  try {
    const response = await fetch(`/api/method/${method}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(csrfToken && { "X-Frappe-CSRF-Token": csrfToken }),
      },
      body: JSON.stringify(args || {}),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isExpiredSessionResponse(response.status, data)) {
        console.error("Session expired.", data);
        redirectToLogin();
        throw new Error("Your session has expired. Redirecting to login.");
      }
      // Extract the real backend message first — Frappe puts the
      // human-readable validation message in _server_messages, and
      // the exception type/name in exc_type / exception.
      let serverMessage = null;

      if (data._server_messages) {
        try {
          const parsed = JSON.parse(data._server_messages);
          const messages = parsed
            .map((m) => {
              try {
                return JSON.parse(m);
              } catch {
                return { message: m };
              }
            })
            .filter((item) => item?.message);
          const raised = messages.filter((item) => item.raise_exception);
          serverMessage = (raised.length ? raised : messages)
            .map((item) => item.message)
            .join("\n");
        } catch {
          serverMessage = data._server_messages;
        }
      } else if (data.exception) {
        // "frappe.exceptions.ValidationError: The Term cannot start..."
        // — strip the Python exception class prefix so the user just
        // sees the message.
        serverMessage = data.exception.includes(": ")
          ? data.exception.split(": ").slice(1).join(": ")
          : data.exception;
      } else if (data.message) {
        serverMessage = data.message;
      }

      // A 417 from Frappe is NOT always a CSRF failure — it's the
      // generic status for frappe.throw()'d exceptions, including
      // ordinary validation errors like the one above. Only treat it
      // as a session/CSRF problem if nothing else explains it AND the
      // message actually mentions CSRF/session.
      throw new Error(serverMessage || "Something went wrong.");
    }

    return data.message;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
