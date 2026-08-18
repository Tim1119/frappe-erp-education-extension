from ._api import expose
expose(globals(),"Promotional Scheme",["name","apply_on","company","currency","selling","buying","valid_from","valid_upto","disable","price_or_product_discount"],["name","apply_on","company","valid_from","valid_upto","disable"],["name","company"],filter_fields=["company","disable"])
