import os
import stripe

from dotenv import load_dotenv
from flask import Flask, request, render_template

load_dotenv()

app = Flask(__name__,
  static_url_path='',
  template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "views"),
  static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "public"))

# add variables from .env 
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def get_item(item_id):
  items = {
        '1': {'title': 'The Art of Doing Science and Engineering', 'amount': 2300},
        '2': {'title': 'The Making of Prince of Persia: Journals 1985-1993', 'amount': 2500},
        '3': {'title': 'Working in Public: The Making and Maintenance of Open Source', 'amount': 2800},
    }
  return items.get(item_id)

# Home route
@app.route('/', methods=['GET'])
def index():
  return render_template('index.html')

# Checkout route
@app.route('/checkout', methods=['GET'])
def checkout():
  # Just hardcoding amounts here to avoid using a database
  item = request.args.get('item')
  title = None
  amount = None
  error = None

  if get_item(item) != None:
    item = get_item(item)
    title = item['title']
    amount = item['amount']
  else:
    # Included in layout view, feel free to assign error
    error = 'No item selected'

  return render_template('checkout.html', title=title, amount=amount, error=error, publishable_key=os.getenv("STRIPE_PUBLISHABLE_KEY"))

# Payment intent route 
@app.route('/create-payment-intent', methods=["POST"])
def create_payment_intent():
  item = request.get_json()['item']
  if get_item(item) != None:
    item = get_item(item)
    payment_intent = stripe.PaymentIntent.create(amount=item['amount'], currency="usd")
    return {"clientSecret": payment_intent.client_secret}
  else:
    return {"400": "item not found"}


# Success route
@app.route('/success', methods=['GET'])
def success():
  payment_intent_id = request.args.get('payment_intent')
  payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
  return render_template('success.html', amount=payment_intent.amount, payment_intent_id=payment_intent.id)



if __name__ == '__main__':
  app.run(port=5000, host='0.0.0.0', debug=True)