from ._api import expose
expose(globals(),"Pricing Rule",["naming_series","title","disable","apply_on","price_or_product_discount","company","currency","selling","buying","valid_from","valid_upto","min_qty","max_qty","min_amt","max_amt","rate_or_discount","rate","discount_percentage","discount_amount","for_price_list"],["name","title","apply_on","price_or_product_discount","company","valid_from","valid_upto","disable"],["name","title","company"],{
    "items":["item_code","uom"],
    "item_groups":["item_group","uom"],
    "brands":["brand","uom"],
},filter_fields=["company","disable"])
