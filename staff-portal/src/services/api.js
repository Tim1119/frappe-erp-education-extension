// services/api.js

export default async function api(method, args = {}) {
  // Get CSRF token from meta tag
  // let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
  let csrfToken = window.csrf_token || document.querySelector('meta[name="csrf-token"]')?.content || '';

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
      // Extract the real backend message first — Frappe puts the
      // human-readable validation message in _server_messages, and
      // the exception type/name in exc_type / exception.
      let serverMessage = null;

      if (data._server_messages) {
        try {
          const parsed = JSON.parse(data._server_messages);
          serverMessage = parsed
            .map((m) => {
              try {
                return JSON.parse(m).message;
              } catch {
                return m;
              }
            })
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
      const looksLikeCsrfIssue =
        !serverMessage ||
        /csrf/i.test(serverMessage) ||
        data.exc_type === "CSRFTokenError";

      if (response.status === 417 && looksLikeCsrfIssue) {
        console.error("CSRF Token Error.", data);
        throw new Error("Session validation failed. Please refresh and try again.");
      }

      throw new Error(serverMessage || "Something went wrong.");
    }

    return data.message;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}