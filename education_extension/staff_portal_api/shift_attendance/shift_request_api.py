from ._api import expose
expose(globals(),"Shift Request",["shift_type","employee","company","approver","from_date","to_date","status"],["name","employee","employee_name","shift_type","company","from_date","to_date","approver","status","docstatus"],["name","employee","employee_name","shift_type"],submittable=True,filter_fields=["employee","shift_type","company","status"])
