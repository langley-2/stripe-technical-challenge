from pydantic import BaseModel

class Item(BaseModel):
    item_id: str
    name: str
    description: str | None = None
    price: int
    tax: float | None = None

class PaymentIntentRequest(BaseModel):
    item_id: str
