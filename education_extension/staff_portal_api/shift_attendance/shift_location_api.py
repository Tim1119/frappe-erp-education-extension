from ._api import expose
expose(globals(),"Shift Location",["location_name","checkin_radius","latitude","longitude","geolocation"],["name","location_name","checkin_radius","latitude","longitude"],["name","location_name"],connections={"shift_assignments":("Shift Assignment","shift_location")})
