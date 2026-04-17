# Stripe Integrated Web Applications

## Solution Overview 

This repository contains two example applications - the original updated sample application, and an additional simple application written with a React front end and a python FastAPI backend. **Although the completed sample code IS included, this readme will focus on the updated version.**

### `boilerplate/sa-takehome-project-python`

This directory contains the provided Flask application. This application was extended to include a `/create-payment-intent` endpoint in the `app.py` utilising Stripe libraries, and a `payment-form` and `payment-element` component for the html to display Stripe payment elements to the user. 

### `/frontend` and `/backend` 

As an addition the example application was re-written here using more familiar frameworks. 

**These directories are the focus of the readme moving forward.**


## Architecture

Component Model

![component model](/images/component.png)

(Rough) Sequence Diagram

![sequence diagram](/images/sequence.png)


### Structure

**/front end**

The front end is a simple ReactJS application that presents 3 page views;
1. A home page that displays a list of books
2. A checkout view that presents the book data (title and price) alongside a Stripe React checkout element
3. A Payment confirmed page that presents the intent-id while loading, and a success message once a payment is confirmed. 

**/backend**

The backend is a FastAPI application that presents four simple endpoints; 
1. `GET /api/items` - returns a dict of items (books) for sale.
2. `GET /api/items/{item_id}` - accepts a path param item id, and returns a single instance of the item - including ID, title, amount.
3. `POST /api/create-payment-intent` - accepts an item_id as a JSON body, and returns a stripe payment intent ID and client secret. 
4. `GET /api/check-payment-intent-status/{intent_id}` - accepts a payment intent id as a path param and returns the status of the payment. 

*For further information, see the API docs or included [Postman collection.](/backend/stripe_checkout.postman_collection.json)*


## How to Build and Run

**Prerequisites:** 
- Python >3.12 (tested on 3.14), pip >24.0
- Node >=20.0, npm >10.9 or newer
- Stripe developer account (with test mode keys)

**Run the back end:** 

1. Change directory to backend `cd backend`
2. Copy the .env.sample into .env (`cp .env.sample .env`) and add your Stripe secret key as `STRIPE_SECRET_KEY="sk_test_..."`
3. Create a python venv 
``` 
python3 -m venv .venv
source .venv/bin/activate
``` 
4. Install requirements `pip install -r requirements.txt`
5. Start the backend `python3 main.py`
6. The terminal should provide the running information. Check `http://localhost:8000/docs` to confirm. 



**Run the front end** 
1. open a new terminal instance (do not terminate the existing back end session)
2. Change directory to frontend `cd frontend/frontend` (from root)
3. Copy the .env.sample into .env (`cp .env.sample .env`) and add your Stripe Publishable key as `VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."`
4. install dependencies with `npm install`
5. run the front end using `npm run dev`
6. the front end should be served on `http://localhost:5173/` as a simple book store.  


This sample app is configured to use a proxy to avoid CORS issues; this can be configured in `vite.config.js`.

## Challenges, Approach and Reflections

My approach was iterative. 

I started by integrating Stripe into the provided repository. This was challenging as i hadnt worked with Flask and Jinja in a while. 

From there, i started creating a similar application using more familiar frameworks.

The backend was reacreated in FastAPI. I have done personal projects in the past using Stripe libraries end to end (create product, update product, get product, custom product search, creating checkout links, creating payment intents etc) so this was a little bit easier. I did choose to use automatic_payment_methods to show the most relevant payment methods, but in this case its just cards used for testing.  

Once i had made the backend i started on some simple front end pages. I used Claude Code to generate the tailwind CSS classes for styling. 




## Extensions and Enhancements

- Currently, the API endpoints in the backend are unauthenticated, and not tied to a session. Ideally, we could map a users session_id to their payment_intent_id in a database and check that in the backend such that payment_intent statuses remain session bound.
- Currently, the front end and back end poll for a successful payment. The poll occurs 3 times to prevent infinite polling. A better configuration would be to use Stripe webhooks to send events for successful payments 
- The items are hardcoded in the backend. A better approach would be to store products in stripe, or in a database.
- Proxy configuration could be updated for deployment - using CORS on the backend for deployment on localhost and publicly. 
- PaymentIntent is created on the page load for the checkout. This is standard it might create some dangling intents in Stripe if a user doesnt check out. We could add code to clean these up or perform analytics if a user doesnt purchase or the purchase fails. There is also no retry flow currently for failed payments. 
- The Python backend does have models for Item, which is unused. I added SOME models for basic extensibility.
- The structure of the codebase could be improved - for example, breaking API endpoints into separate files, adding authentication handling structures, database interfaces and classes - i traded simplicy for extensible structure with some minor exceptions like adding some Models. 