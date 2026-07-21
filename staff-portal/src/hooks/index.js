import { useEffect, useState, useCallback, useRef } from "react";
import { getErrorMessage } from "../utils/errors";
import toast from "react-hot-toast";

export function useAsync(factory, deps = [], fallback = null, options = {}) {
	const [data, setData] = useState(fallback);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [reloadKey, setReloadKey] = useState(0);

	useEffect(() => {
		let alive = true;
		setLoading(true);
		setError(null);
		Promise.resolve()
			.then(factory)
			.then((result) => {
				if (alive) setData(result);
			})
			.catch((err) => {
				if (!alive) return;
				setError(err);
				if (options.showError !== false) {
					const msg = getErrorMessage(err);
					toast.error(msg);
				}
			})
			.finally(() => {
				if (alive) setLoading(false);
			});
		return () => {
			alive = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...deps, reloadKey]);

	const reload = useCallback(() => setReloadKey((k) => k + 1), []);

	return { data, setData, loading, error, reload };
}

export function useDebounce(value, delay = 350) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
}

export function usePagination(initial = 1) {
	const [page, setPage] = useState(initial);
	const reset = useCallback(() => setPage(1), []);
	return { page, setPage, reset };
}
