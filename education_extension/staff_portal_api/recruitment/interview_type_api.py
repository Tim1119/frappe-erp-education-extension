from ._api import expose
expose(globals(), "Interview Type", ["description"], ["name","description","modified"], ["name","description"], connections={"interview_rounds":("Interview Round","interview_type")})
