const SOURCE_METADATA_FIELDS = new Set([
  "name", "docstatus", "modified", "creation", "owner", "modified_by", "idx",
  "doctype", "parent", "parentfield", "parenttype", "__islocal", "__unsaved",
]);

export function cleanNewDocumentPrefill(prefill) {
  if (!prefill || typeof prefill !== "object") return prefill;
  return { ...Object.fromEntries(
    Object.entries(prefill).filter(([key]) => !SOURCE_METADATA_FIELDS.has(key)),
  ), docstatus: 0 };
}
