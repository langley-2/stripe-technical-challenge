# Interview Rebuild: Recommendations

## TL;DR

Go with **FastAPI + React (Vite)**. It's the right call — but keep it deliberately simple. The win isn't just a modern stack; it's a clean separation that makes every likely follow-up change a 10-minute job.

---

## Why FastAPI + React is the right call

### Backend: FastAPI over Flask

| | Flask (current) | FastAPI |
|---|---|---|
| Request/response validation | Manual | Pydantic — automatic |
| API docs | None | Auto Swagger UI at `/docs` |
| Async support | Bolted on | Native |
| Adding a new field | Edit dict, update template | Edit one Pydantic model |

The key benefit for follow-up interviews: **Pydantic models are a single source of truth**. If they ask you to add a `discount` field, you add it to one model and it propagates to validation, serialization, and docs automatically.

### Frontend: React (Vite) over Jinja2 templates

Stripe's official `@stripe/react-stripe-js` library wraps Elements in React components. It's significantly cleaner than the vanilla JS approach — less boilerplate, handles loading states, and is well-documented. Vite gives you a fast dev server with no configuration overhead.

---

## Recommended structure

```
stripe_interview/
├── backend/
│   ├── main.py          # FastAPI app — all routes here, keep it one file
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.tsx       # Book list
    │   │   ├── Checkout.tsx   # Stripe Elements form
    │   │   └── Success.tsx    # Confirmation (pi_ ID + amount)
    │   ├── App.tsx            # React Router setup
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts         # Proxy /api → :8000 (eliminates CORS)
```

### Key decision: Vite proxy to kill CORS

In `vite.config.ts`, proxy `/api` to your FastAPI server. This means no CORS headers to configure, no env vars for API URLs, and the frontend just calls `/api/...` as if it were local. This removes an entire class of friction during a live interview.

---

## Backend: 3 endpoints, one file

```python
# Keep all backend logic in main.py — no need for routers or services at this scale

GET  /api/items              # Returns the book list
GET  /api/items/{id}         # Returns one book (for checkout page)
POST /api/create-payment-intent  # Creates PaymentIntent, returns client_secret
```

Use a **Pydantic model for items** so adding fields is trivial:

```python
class Item(BaseModel):
    id: int
    name: str
    price: int  # cents
    description: str
    image: str
```

---

## Frontend: minimal state, no Redux

Three pages, three components. Use `useState` + `useEffect` — nothing else. No context, no Redux, no Zustand. The state story is: pick a book → pass its ID to checkout → display the result. That's two URL params and one API call.

```
Home → /checkout/2 → /success?pi=pi_xxx&amount=1999
```

Pass data via URL params/query string between pages. This is simpler than shared state and survives a page refresh.

---

## Stripe integration

```tsx
// In Checkout.tsx
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// 1. On page load: POST /api/create-payment-intent → get client_secret
// 2. Wrap form in <Elements stripe={stripePromise} options={{ clientSecret }}>
// 3. Use <PaymentElement /> — handles card, Apple Pay, etc. automatically
// 4. On submit: stripe.confirmPayment() → redirects to /success
```

Use `PaymentElement` (not the older `CardElement`). It's the current Stripe recommendation — handles 3DS, Apple Pay, and Link automatically with zero extra code.

---

## What makes this easy to modify

| Likely follow-up ask | Where the change lives |
|---|---|
| Add a coupon/discount field | Add field to `Item` model + one line in payment intent creation |
| Add a new book | Add one dict to the items list |
| Show order history | New endpoint + new page component |
| Add webhooks | New FastAPI route, no frontend changes |
| Change currency | One constant in `main.py` |

---

## What to avoid

- **Don't add a database.** A hardcoded dict is fine. Adding SQLite or SQLAlchemy just creates migration noise during a follow-up.
- **Don't use Redux or Zustand.** Three pages don't need a state manager.
- **Don't split into multiple backend files.** One `main.py` is easier to navigate live.
- **Don't use the older `CardElement`.** Stripe's docs now push `PaymentElement` — use it.

---

## Dependency list (keep it short)

**Backend:**
```
fastapi
uvicorn
stripe
python-dotenv
pydantic  # bundled with FastAPI
```

**Frontend:**
```
react, react-dom, react-router-dom
@stripe/stripe-js, @stripe/react-stripe-js
typescript, vite
```

No UI library needed — plain CSS or inline styles are fine for 3 pages. Bootstrap is optional but not worth adding friction.
