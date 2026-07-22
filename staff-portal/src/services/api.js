// async function request(method, args = {}) {
// 	const res = await fetch(`/api/method/${method}`, {
// 		method: "POST",
// 		credentials: "same-origin",
// 		headers: {
// 			"Content-Type": "application/json",
// 			Accept: "application/json",
// 		},
// 		body: JSON.stringify(args),
// 	});

// 	const data = await res.json();

// 	if (!res.ok) {
// 		throw new Error(data.message || data.exception || "Something went wrong.");
// 	}

// 	return data.message;
// }

// export default request;


// services/api.js
export default async function api(method, args = {}) {
  // Get CSRF token from meta tag
  let csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
  
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
      if (response.status === 417) {
        console.error('CSRF Token Error.', data);
        // Don't reload - just throw the error
        throw new Error('Session validation failed. Please try again.');
      }
      
      if (data.exception) {
        throw new Error(data.exception);
      }
      if (data._server_messages) {
        try {
          const messages = JSON.parse(data._server_messages);
          throw new Error(messages.join('\n'));
        } catch {
          throw new Error(data._server_messages);
        }
      }
      throw new Error(data.message || data.exception || "Something went wrong.");
    }

    return data.message;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}