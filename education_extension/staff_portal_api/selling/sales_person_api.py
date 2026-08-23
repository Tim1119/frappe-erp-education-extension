from ._api import expose
expose(globals(), "Sales Person", ["sales_person_name", "parent_sales_person", "is_group", "employee", "department", "commission_rate", "enabled"], ["name", "sales_person_name", "parent_sales_person", "is_group", "employee", "enabled"], ["name", "sales_person_name", "employee"], filter_fields=["parent_sales_person", "is_group"])
