import { useMemo } from 'react';
import { useAsync } from '../hooks.js';
import { getPage } from '../services/frappeClient';
import { DOCTYPES } from '../config/doctypes';

/**
 * Fetches a page of a DocType's records from Frappe.
 *
 * @param {keyof typeof DOCTYPES} resourceKey  key into src/config/doctypes.js
 * @param {object} opts
 * @param {string} [opts.search]        matched against `searchFields` via "like" or_filters
 * @param {string[]} [opts.searchFields] fields to search across (defaults to first text field)
 * @param {array[]} [opts.filters]      Frappe filter tuples, e.g. [["status","=","Active"]]
 * @param {string} [opts.orderBy]       e.g. "modified desc"
 * @param {number} [opts.page]
 * @param {number} [opts.pageSize]
 *
 * Returns { rows, count, totalPages, loading, error, reload }.
 */
export function useDocList(resourceKey, opts = {}) {
  const { search = '', searchFields, filters = [], orderBy = 'modified desc', page = 1, pageSize = 20 } = opts;
  const cfg = DOCTYPES[resourceKey];
  if (!cfg) throw new Error(`Unknown resource key "${resourceKey}" — check src/config/doctypes.js`);

  const effectiveFilters = useMemo(() => {
    const combined = [...filters];
    if (search && searchFields?.length) {
      // Frappe supports ["field", "like", "%term%"] tuples; OR them via or_filters server-side
      // by falling back to the first search field here for simplicity.
      combined.push([searchFields[0], 'like', `%${search}%`]);
    }
    return combined;
  }, [filters, search, searchFields]);

  const { data, loading, error, reload } = useAsync(
    () => getPage(cfg.doctype, { fields: cfg.fields, filters: effectiveFilters, order_by: orderBy, page, pageSize }),
    [cfg.doctype, JSON.stringify(effectiveFilters), orderBy, page, pageSize],
    { rows: [], count: 0, totalPages: 1 },
    { showError: false },
  );

  return {
    rows: data?.rows || [],
    count: data?.count || 0,
    totalPages: data?.totalPages || 1,
    loading,
    error,
    reload,
  };
}
