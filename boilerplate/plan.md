# Stripe Checkout Implementation Plan

Minimal implementation using the existing Flask boilerplate. No new files, no new dependencies — just filling in the placeholders.

---

## Phase 1 — Backend: Create a PaymentIntent endpoint

**File:** `boilerplate/sa-takehome-project-python/app.py`

**What to add:**

1. Extract the item lookup into a helper function `get_item(item_id)` that returns a dict `{title, amount}` or `None`. Both the existing `/checkout` route and the new payment intent route call this — single source of truth, no duplication.

   ```python
   def get_item(item_id):
       items = {
           '1': {'title': 'The Art of Doing Science and Engineering', 'amount': 2300},
           '2': {'title': 'The Making of Prince of Persia: Journals 1985-1993', 'amount': 2500},
           '3': {'title': 'Working in Public: The Making and Maintenance of Open Source', 'amount': 2800},
       }
       return items.get(item_id)
   ```

2. Update the `/checkout` route to call `get_item(item)` instead of the inline if/elif block.

3. `stripe` and `stripe.api_key` are already imported and set — nothing to add there.

4. Add a single new route: `POST /create-payment-intent`

   - Read the `item` ID from the JSON request body.
   - Call `get_item(item_id)` — return a 400 if not found.
   - Call `stripe.PaymentIntent.create(amount=item['amount'], currency="usd")`.
   - Return `{"clientSecret": payment_intent.client_secret}` as JSON.

5. Pass the Stripe **publishable key** to the checkout template as a Jinja2 variable so the frontend can use it without hardcoding.

> **Why PaymentIntent?** It's the Stripe-recommended server-side primitive. The client secret it returns is safe to send to the browser and is required by the Payment Element.

---

## Phase 2 — Frontend: Mount the Payment Element

**File:** `boilerplate/sa-takehome-project-python/views/checkout.html`

**What to add:**

1. Replace the placeholder `<div>` with a real `<div id="payment-element"></div>`.

2. In a `<script>` block at the bottom of the page:

   a. On page load, call `POST /create-payment-intent` with the item ID (available from the existing `data-` attribute on the page).

   b. Initialise Stripe.js with the publishable key (injected by Jinja2 from Phase 1).

   c. Create a Stripe `Elements` instance using the `clientSecret` returned from the server.

   d. Create a `PaymentElement` and mount it to `#payment-element`.

3. On form submit:

   a. Call `stripe.confirmPayment(...)` with `return_url` pointing to `/success`.

   b. If there's an immediate error (card declined, validation), display it in a `<div id="error-message">` that already exists in the template (or add a small one next to the button).

   - Stripe handles the redirect to `/success` automatically on success; no extra JS is needed.

> **Why PaymentElement?** It's a single component that handles all payment methods, built-in validation, and PCI compliance. It replaces the older CardElement with one line of mount code.

---

## Phase 3 — Success Page: Display Payment Details

**File:** `boilerplate/sa-takehome-project-python/views/success.html`

**What to add:**

After a successful payment, Stripe redirects to `/success?payment_intent=pi_xxx&payment_intent_client_secret=...&redirect_status=succeeded`.

1. In `app.py`, update the `GET /success` route to:

   - Read `payment_intent` from `request.args`.
   - Call `stripe.PaymentIntent.retrieve(payment_intent_id)` to get the confirmed amount and status.
   - Pass `amount` and `payment_intent_id` to the template.

2. In `success.html`, replace the placeholder with Jinja2 variables to display:

   - The amount paid (formatted in dollars — the existing `custom.js` helper already does cent-to-dollar formatting).
   - The Payment Intent ID as a reference number.

> **Why retrieve on the server?** Never trust query-string values for financial display. Fetching the PaymentIntent server-side confirms the actual charged amount directly from Stripe.

---

## Summary of changes

| File | Change |
|------|--------|
| `app.py` | Extract `get_item()` helper; update `/checkout` to use it; add `POST /create-payment-intent`; pass publishable key to checkout template; retrieve PaymentIntent in `/success` |
| `checkout.html` | Replace placeholder div; add `<script>` to fetch client secret, mount PaymentElement, handle submit |
| `success.html` | Replace placeholder with template variables for amount and payment ID |

**No new files. No new dependencies. Stripe.js is already loaded in `main.html`.**
