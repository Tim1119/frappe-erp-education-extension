from ._api import expose
expose(globals(),"Shift Schedule",["shift_type","frequency"],["name","shift_type","frequency","docstatus"],["name","shift_type"],{"repeat_on_days":["day"]},True,connections={"schedule_assignments":("Shift Schedule Assignment","shift_schedule")})
