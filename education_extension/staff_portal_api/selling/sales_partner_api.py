from ._api import expose
expose(globals(), "Sales Partner", ["partner_name", "partner_type", "territory", "commission_rate", "show_in_website", "partner_website"], ["name", "partner_name", "partner_type", "territory", "commission_rate"], ["name", "partner_name", "territory"], filter_fields=["territory"])
