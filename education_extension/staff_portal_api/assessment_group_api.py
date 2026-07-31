import json

import frappe
from frappe import _


def _flatten_tree(rows):
    """Depth-first flatten with siblings sorted alphabetically by
    assessment_group_name -- mirrors the real Desk tree view exactly:
    frappe.desk.treeview.get_children() orders siblings by `name`
    (order_by="name"), not by lft/insertion order."""
    children_by_parent = {}
    for r in rows:
        children_by_parent.setdefault(r["parent_assessment_group"] or "", []).append(r)
    for kids in children_by_parent.values():
        kids.sort(key=lambda r: (r["assessment_group_name"] or r["name"]).lower())

    ordered = []

    def walk(parent_name, depth):
        for node in children_by_parent.get(parent_name or "", []):
            node["depth"] = depth
            ordered.append(node)
            walk(node["name"], depth + 1)

    walk("", 0)

    # Guard against an orphaned parent link (parent_assessment_group
    # pointing at a value not present in this result set) -- append at
    # depth 0 instead of silently dropping the row.
    seen = {r["name"] for r in ordered}
    for r in rows:
        if r["name"] not in seen:
            r["depth"] = 0
            ordered.append(r)

    return ordered


@frappe.whitelist()
def get_assessment_groups():
    """Tree doctype -- returns the full hierarchy flattened into display
    order (see _flatten_tree), not the standard page/page_size shape used
    by flat-list doctypes. A tree's parent/child relationships don't
    survive being cut into arbitrary pages, and Assessment Group is a
    small, bounded list (exam periods/terms), so returning everything at
    once mirrors what the real Desk tree view effectively shows too."""
    rows = frappe.get_all(
        "Assessment Group",
        fields=["name", "assessment_group_name", "parent_assessment_group", "is_group"],
    )
    ordered = _flatten_tree(rows)
    return {"rows": ordered, "count": len(ordered)}


@frappe.whitelist()
def get_assessment_group(name):
    if not name:
        frappe.throw(_("Assessment Group name is required"))

    doc = frappe.get_doc("Assessment Group", name)
    data = doc.as_dict()
    data["has_children"] = (
        frappe.db.count("Assessment Group", {"parent_assessment_group": name}) > 0
    )
    return data


@frappe.whitelist()
def create_assessment_group(data):
    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc({
        "doctype": "Assessment Group",
        "assessment_group_name": data.get("assessment_group_name"),
        "parent_assessment_group": data.get("parent_assessment_group"),
        "is_group": data.get("is_group") or 0,
    })

    # Nested-set placement (lft/rgt) and leaf/group validation run
    # automatically via NestedSet.on_update() -- see frappe.utils.nestedset.
    doc.insert()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def update_assessment_group(name, data):
    if not name:
        frappe.throw(_("Assessment Group name is required"))

    if isinstance(data, str):
        data = json.loads(data)

    doc = frappe.get_doc("Assessment Group", name)

    # assessment_group_name drives the docname (autoname:
    # field:assessment_group_name) -- changing it post-creation would
    # desync name vs the field, so the frontend locks it when editing.
    # Parent and Is Group remain editable.
    for field in ("parent_assessment_group", "is_group"):
        if field in data:
            doc.set(field, data[field])

    doc.save()
    frappe.db.commit()

    return doc.as_dict()


@frappe.whitelist()
def delete_assessment_group(name):
    if not name:
        frappe.throw(_("Assessment Group name is required"))

    # NestedSet.on_trash() throws NestedSetChildExistsError if this node
    # still has children -- let that propagate, don't duplicate the check.
    frappe.delete_doc("Assessment Group", name)
    frappe.db.commit()

    return {"message": "Assessment Group deleted"}


@frappe.whitelist()
def get_connections(assessment_group):
    """Mirrors assessment_group_dashboard.py's get_data(): fieldname
    'assessment_group', transactions group 'Assessment' -> Assessment Plan,
    Assessment Result."""
    if not assessment_group:
        frappe.throw(_("Assessment Group name is required"))

    return {
        "assessment_plans": frappe.db.count(
            "Assessment Plan", {"assessment_group": assessment_group}
        ),
        "assessment_results": frappe.db.count(
            "Assessment Result", {"assessment_group": assessment_group}
        ),
    }
