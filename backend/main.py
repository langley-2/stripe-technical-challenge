from fastapi import FastAPI, HTTPException
import uvicorn
import stripe 
import os
from models import Item, PaymentIntentRequest
from dotenv import load_dotenv


app = FastAPI()
load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

items = {
        '1': {'title': 'The Art of Doing Science and Engineering', 'amount': 2300},
        '2': {'title': 'The Making of Prince of Persia: Journals 1985-1993', 'amount': 2500},
        '3': {'title': 'Working in Public: The Making and Maintenance of Open Source', 'amount': 2800},
    }

def get_item(item_id):
  if item_id in items.keys():
    return items.get(item_id)
  else:
     raise HTTPException(status_code=404)


@app.get("/api/items")
async def get_items():
    return items

@app.get("/api/items/{item_id}")
async def get_item_by_id(item_id: str):  
    return get_item(item_id)

@app.post("/api/create-payment-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    try:
        payment_intent = stripe.PaymentIntent.create(
        amount=get_item(request.item_id)['amount'],
        currency="usd",
        automatic_payment_methods={"enabled": True},)

        return {"id" : payment_intent.id, "client_secret" : payment_intent.client_secret}
    
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ideally these calls should be authenticated for each user 
# or perhaps session - i.e. create a payment intent and store 
# it in DB alongside session ID. Use this to look up whether an 
# intent belongs to a session in the below call
@app.get("/api/check-payment-intent-status/{payment_intent_id}")
async def check_payment_intent_status(payment_intent_id: str):  
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return { "status": payment_intent.status }
    except stripe.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)