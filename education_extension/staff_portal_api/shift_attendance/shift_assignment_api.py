from ._api import expose
expose(globals(),"Shift Assignment",["employee","shift_type","shift_location","status","start_date","end_date"],["name","employee","employee_name","shift_type","shift_location","start_date","end_date","status","docstatus"],["name","employee","employee_name","shift_type"],submittable=True,filter_fields=["employee","shift_type","status","company"])
