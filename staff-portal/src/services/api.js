async function request(method, args = {}) {
	const res = await fetch(`/api/method/${method}`, {
		method: "POST",
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(args),
	});

	const data = await res.json();

	if (!res.ok) {
		throw new Error(data.message || data.exception || "Something went wrong.");
	}

	return data.message;
}

export default request;
