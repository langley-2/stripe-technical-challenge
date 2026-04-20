import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";


const stripe_key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(
  stripe_key
);
  function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    async function handleSubmit(e) {
      e.preventDefault();
      await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-acknowledged`,
        },
      });
    }
    return (
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <div className="pt-4">
          <button
            className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-8 py-3 rounded-full transition-colors duration-200"
            type="submit"
          >
            Pay now
          </button>
        </div>
      </form>
    );
  }
export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const bookId = searchParams.get("item_id")

  const [book, setBook] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetch(`/api/items/${bookId}`)
      .then((r) => r.json())
      .then((book) => {
        setBook(book);
        return fetch(`/api/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: bookId }),
        })
          .then((r) => r.json())
          .then((data) => {
            setClientSecret(data.client_secret);
            setLoading(false);
          });
      });
  }, []);

  if (!bookId) {
    navigate("/");
    return null;
  }
  if (loading) {
    return <h2> loading </h2>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-400 hover:text-gray-600 mb-10 transition-colors block"
        >
          ← Back
        </button>

        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
            Checkout
          </p>
          <span className="text-5xl mb-4 block">📖</span>
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">
            {book.title}
          </h2>
          <p className="text-lg text-gray-400">
            ${(book.amount / 100).toFixed(2)}
          </p>
        </div>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        ) : (
          <h1>loading</h1>
        )}
      </div>
    </div>
  );
}
