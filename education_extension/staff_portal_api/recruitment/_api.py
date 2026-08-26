import frappe

from ._utils import (cancel_doc, create_doc, delete_doc, employee_details, guarded,
    linked_details, list_docs, options, single, submit_doc, update_doc)


def expose(namespace, doctype, fields, list_fields, search_fields, tables=None, submittable=False,
           filter_fields=None, connections=None, child_filter_fields=None):
    tables, filter_fields, connections, child_filter_fields = tables or {}, filter_fields or [], connections or {}, child_filter_fields or {}

    @frappe.whitelist()
    @guarded(f"{doctype} list")
    def get_list(page=1, page_size=20, search=None, **kwargs):
        filters = {field: kwargs.get(field) for field in filter_fields}
        for key, (child_doctype, match_field, result_field) in child_filter_fields.items():
            value = kwargs.get(key)
            if value:
                names = frappe.get_list(child_doctype, filters={match_field: value}, distinct=True, pluck=result_field)
                filters["name"] = ["in", [name for name in names if name]]
        return list_docs(doctype, list_fields, page, page_size, search, search_fields,
            filters)

    @frappe.whitelist()
    @guarded(f"{doctype} get")
    def get_single(name): return single(doctype, name, tables)

    @frappe.whitelist()
    @guarded(f"{doctype} create")
    def create(data): return create_doc(doctype, data, fields, tables)

    @frappe.whitelist()
    @guarded(f"{doctype} update")
    def update(name, data): return update_doc(doctype, name, data, fields, tables)

    @frappe.whitelist()
    @guarded(f"{doctype} delete")
    def delete(name): return delete_doc(doctype, name)

    @frappe.whitelist()
    @guarded(f"{doctype} connections")
    def get_connections(name=None):
        if not name:
            frappe.throw(f"{doctype} document name is required")
        return {key: frappe.db.count(target, {link: name}) for key, (target, link) in connections.items()}

    @frappe.whitelist()
    @guarded(f"{doctype} options")
    def get_lookup_options(doctype, filters=None): return options(doctype, filters)

    @frappe.whitelist()
    @guarded(f"{doctype} employee")
    def get_employee_details(employee): return employee_details(employee)

    @frappe.whitelist()
    @guarded(f"{doctype} linked details")
    def get_linked_details(linked_doctype, name, fields):
        if isinstance(fields, str):
            import json
            fields = json.loads(fields)
        return linked_details(linked_doctype, name, fields)

    values = locals()
    for name in ("get_list", "get_single", "create", "update", "delete", "get_connections",
                 "get_lookup_options", "get_employee_details", "get_linked_details"):
        method = values[name]
        # These functions are created in this factory but exposed from the
        # caller's API module. Register that real module path with Frappe's
        # whitelist; otherwise HTTP requests are rejected as
        # ``recruitment._api.<method> is not whitelisted`` even though direct
        # Python execution succeeds.
        method.__module__ = namespace["__name__"]
        method = frappe.whitelist()(method)
        method.__module__ = namespace["__name__"]
        namespace[name] = method
    if submittable:
        @frappe.whitelist()
        @guarded(f"{doctype} submit")
        def submit(name): return submit_doc(doctype, name)
        @frappe.whitelist()
        @guarded(f"{doctype} cancel")
        def cancel(name): return cancel_doc(doctype, name)
        submit.__module__ = namespace["__name__"]
        cancel.__module__ = namespace["__name__"]
        submit = frappe.whitelist()(submit)
        cancel = frappe.whitelist()(cancel)
        submit.__module__ = namespace["__name__"]
        cancel.__module__ = namespace["__name__"]
        namespace["submit"], namespace["cancel"] = submit, cancel
