#!/usr/bin/env python3
"""
check_fields.py — DocType field completeness checker

Purpose
-------
Every time a new module is generated from a Frappe DocType JSON, the single
biggest risk is a field silently getting dropped somewhere in the generated
form/detail page. This script removes the need to eyeball-compare a JSON
schema against generated JSX by hand.

It parses a DocType's `fields` array, extracts every real data field
(skipping layout-only fieldtypes like Section Break / Column Break / Tab
Break), and checks whether each fieldname is referenced anywhere in one or
more given frontend files (form page, profile page, and their sub-
components). Anything present in the DocType but never referenced anywhere
is printed as a MISSING field.

This is a blunt instrument on purpose: it does a substring/regex search for
the fieldname, so it can't tell you whether a field is *displayed
correctly* — only whether it appears at all. Treat a clean report as "check
that nothing was skipped," not "this form is done and correct." Always
still review the actual rendered page.

Usage
-----
    python3 check_fields.py <doctype.json> <file1.jsx> [file2.jsx ...]

Example
-------
    python3 check_fields.py \\
        academic_term.json \\
        src/pages/admin/academic-term/AcademicTermFormPage.jsx \\
        src/pages/admin/academic-term/AcademicTermProfilePage.jsx

Exit code is 1 if any fields are missing, 0 if everything is accounted for
— so it can be wired into a CI step or a pre-commit hook later if useful.
"""

import json
import re
import sys
from pathlib import Path

# Fieldtypes that are pure layout/UI structure, never real data to display.
LAYOUT_FIELDTYPES = {
    "Section Break",
    "Column Break",
    "Tab Break",
    "HTML",
    "Button",
    "Heading",
    "Fold",
}

# Fields that exist on virtually every Frappe doctype and are almost never
# meant to be surfaced on a staff-portal form/detail page. Suppressed by
# default so the report stays focused on fields you actually need to add.
# Pass --include-standard to see them anyway.
STANDARD_NOISE_FIELDS = {
    "naming_series",
    "amended_from",
    "disabled",  # often intentionally handled separately (e.g. as enabled toggle) — review manually if flagged
}


def load_doctype_fields(doctype_json_path):
    """Return list of (fieldname, label, fieldtype) for real data fields."""
    with open(doctype_json_path) as f:
        schema = json.load(f)

    fields = []
    for field in schema.get("fields", []):
        fieldtype = field.get("fieldtype", "")
        fieldname = field.get("fieldname")
        if not fieldname or fieldtype in LAYOUT_FIELDTYPES:
            continue
        fields.append((fieldname, field.get("label", ""), fieldtype))
    return fields


def load_child_table_fields(doctype_json_path, apps_root=None):
    """
    For Table / Table MultiSelect fields, attempt to also resolve and
    include the CHILD doctype's own fields, since child table rows are a
    common place for fields to get silently dropped.

    Best-effort only: requires the child doctype's JSON to be discoverable
    under apps_root (defaults to searching two levels up from the given
    doctype's own file, which matches Frappe's app layout convention:
    apps/<app>/<app>/doctype/<doctype_name>/<doctype_name>.json).
    """
    with open(doctype_json_path) as f:
        schema = json.load(f)

    child_info = []
    doctype_path = Path(doctype_json_path).resolve()

    for field in schema.get("fields", []):
        if field.get("fieldtype") not in ("Table", "Table MultiSelect"):
            continue
        child_doctype = field.get("options")
        if not child_doctype:
            continue

        # Search for the child doctype's JSON nearby (apps/*/*/doctype/.../*.json)
        search_root = doctype_path.parents[3] if len(doctype_path.parents) >= 4 else doctype_path.parent
        slug = child_doctype.lower().replace(" ", "_")
        matches = list(search_root.rglob(f"doctype/{slug}/{slug}.json"))

        if matches:
            child_fields = load_doctype_fields(matches[0])
            child_info.append((field["fieldname"], child_doctype, child_fields))
        else:
            child_info.append((field["fieldname"], child_doctype, None))  # not found — flagged separately

    return child_info


def find_references(fieldname, file_contents):
    """
    Heuristic check for whether `fieldname` is referenced in the given
    source text. Covers the common patterns seen across this project:

        form.fieldname            data.fieldname           doc.fieldname
        "fieldname"               'fieldname'               `fieldname`
        updateField("fieldname"   upd("fieldname"           set("fieldname"
        label="Fieldname"-ish text is NOT checked (labels are freely
        reworded, e.g. Course -> Subject) — only the underlying fieldname.
    """
    # Word-boundary match so "program" doesn't false-positive match inside
    # "program_enrollment" and vice versa.
    pattern = r'(?<![A-Za-z0-9_])' + re.escape(fieldname) + r'(?![A-Za-z0-9_])'
    return bool(re.search(pattern, file_contents))


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)

    doctype_json_path = sys.argv[1]
    include_standard = "--include-standard" in sys.argv
    frontend_files = [a for a in sys.argv[2:] if not a.startswith("--")]

    if not Path(doctype_json_path).exists():
        print(f"DocType JSON not found: {doctype_json_path}")
        sys.exit(2)

    combined_source = ""
    for fp in frontend_files:
        p = Path(fp)
        if not p.exists():
            print(f"WARNING: frontend file not found, skipping: {fp}")
            continue
        combined_source += p.read_text() + "\n"

    if not combined_source:
        print("No frontend files could be read — nothing to check against.")
        sys.exit(2)

    fields = load_doctype_fields(doctype_json_path)

    missing = []
    present = []

    for fieldname, label, fieldtype in fields:
        if not include_standard and fieldname in STANDARD_NOISE_FIELDS:
            continue
        if find_references(fieldname, combined_source):
            present.append((fieldname, label, fieldtype))
        else:
            missing.append((fieldname, label, fieldtype))

    # Child table fields (best-effort)
    child_tables = load_child_table_fields(doctype_json_path)

    print(f"DocType fields checked: {len(fields)}")
    print(f"Frontend files scanned: {len(frontend_files)}")
    print()

    if present:
        print(f"✅ FOUND ({len(present)}):")
        for fieldname, label, fieldtype in present:
            print(f"   {fieldname:<30} {fieldtype:<15} \"{label}\"")
        print()

    if missing:
        print(f"❌ MISSING ({len(missing)}) — not referenced anywhere in the given files:")
        for fieldname, label, fieldtype in missing:
            print(f"   {fieldname:<30} {fieldtype:<15} \"{label}\"")
        print()
    else:
        print("✅ No top-level fields missing.")
        print()

    if child_tables:
        print("─── Child tables (Table / Table MultiSelect fields) ───")
        for parent_fieldname, child_doctype, child_fields in child_tables:
            if child_fields is None:
                print(f"   ⚠️  {parent_fieldname} → {child_doctype}: "
                      f"child doctype JSON not found automatically — "
                      f"check its fields manually.")
                continue

            child_missing = [
                (fn, lbl, ft) for fn, lbl, ft in child_fields
                if not find_references(fn, combined_source)
            ]
            status = "✅" if not child_missing else "❌"
            print(f"   {status} {parent_fieldname} → {child_doctype} "
                  f"({len(child_fields)} fields, {len(child_missing)} not found)")
            for fn, lbl, ft in child_missing:
                print(f"        missing: {fn:<28} {ft:<15} \"{lbl}\"")
        print()

    if missing or any(cf[2] is not None and any(
            not find_references(fn, combined_source) for fn, _, _ in cf[2])
            for cf in child_tables if cf[2]):
        print("Result: INCOMPLETE — review the missing fields above.")
        sys.exit(1)
    else:
        print("Result: COMPLETE (heuristic check — still review the rendered page).")
        sys.exit(0)


if __name__ == "__main__":
    main()
