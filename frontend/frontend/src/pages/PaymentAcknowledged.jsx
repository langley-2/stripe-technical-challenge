import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentAcknowledged() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paymentIntentId) return;

    let attempts = 0;

    const poll = setInterval(() => {
      attempts++;

      fetch(`/api/check-payment-intent-status/${paymentIntentId}`)
        .then((r) => r.json())
        .then((data) => {
          setStatus(data.status);
          if (data.status === "succeeded" || attempts >= 3) {
            setLoading(false);
            clearInterval(poll);
          }
        });

      if (attempts >= 3) {
        clearInterval(poll);
        setLoading(false);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-400 text-sm">Confirming your payment...</p>
          <p className="text-gray-400 text-sm">{`payment intent: ${paymentIntentId}, redirect status: ${redirectStatus}`}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          {status === "succeeded" ? (
            <>
              <span className="text-5xl mb-4 block">✅</span>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                Payment confirmed
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">
                You're all set
              </h1>
              <p className="text-lg text-gray-400">Your order is confirmed.</p>
            </>
          ) : (
            <>
              <span className="text-5xl mb-4 block">❌</span>
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
                Payment failed
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-1">
                Something went wrong
              </h1>
              <p className="text-lg text-gray-400">
                Your payment could not be confirmed.
              </p>
            </>
          )}
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-3.5 rounded-full transition-colors duration-200"
        >
          Back to shop
        </button>
      </div>
    </div>
  );
}
