import frappe

from education_extension.staff_portal_api.hr.performance import api_call, common_options, payload

DOCTYPE = "Energy Point Settings"
FIELDS = ["enabled", "point_allocation_periodicity"]

@frappe.whitelist()
def get_energy_point_settings():
    def run():
        doc = frappe.get_single(DOCTYPE); doc.check_permission("read"); result = doc.as_dict(); result["can_edit"] = bool(doc.has_permission("write")); return result
    return api_call("Energy Point Settings API", run)
@frappe.whitelist()
def update_energy_point_settings(data):
    def run():
        values = payload(data); doc = frappe.get_single(DOCTYPE); doc.check_permission("write")
        for field in FIELDS:
            if field in values: doc.set(field, values.get(field))
        if "review_levels" in values:
            doc.set("review_levels", [])
            for row in values.get("review_levels") or []: doc.append("review_levels", {field: row.get(field) for field in ["level_name", "role", "review_points"]})
        doc.save(); frappe.db.commit(); return doc.as_dict()
    return api_call("Energy Point Settings API", run)
@frappe.whitelist()
def get_options():
    def run():
        options = common_options()
        options["users"] = frappe.get_list(
            "User", fields=["name", "full_name"], filters={"enabled": 1},
            order_by="full_name", limit_page_length=1000,
        )
        return options
    return api_call("Energy Point Settings API", run)

@frappe.whitelist()
def give_review_points(user, points):
    def run():
        from frappe.social.doctype.energy_point_log.energy_point_log import add_review_points
        add_review_points(user, points)
        frappe.db.commit()
        return {"message": "Review points added"}
    return api_call("Energy Point Settings Review Points", run)
