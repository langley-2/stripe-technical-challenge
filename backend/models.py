from pydantic import BaseModel

# including a models file and Item class in the case of future attributes being needed. 
class Item(BaseModel):
    item_id: str
    title: str
    amount: int

class PaymentIntentRequest(BaseModel):
    item_id: str
