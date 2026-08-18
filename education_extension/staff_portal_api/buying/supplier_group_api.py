from ._api import expose
expose(globals(),"Supplier Group",["supplier_group_name","parent_supplier_group","is_group","payment_terms"],["name","parent_supplier_group","is_group"],["name","parent_supplier_group"],filter_fields=["parent_supplier_group"],connections={"suppliers":("Supplier","supplier_group")})
