from ._api import expose
expose(globals(), "Appointment Letter Template", ["template_name","introduction","closing_notes"], ["name","template_name","introduction","modified"], ["name","template_name","introduction"], {"terms":["title","description"]}, connections={"appointment_letters":("Appointment Letter","appointment_letter_template")})
