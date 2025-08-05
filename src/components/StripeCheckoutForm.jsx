// components/StripeCheckoutForm.jsx
import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import CardInput from './CardInput';

export default function StripeCheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement('card') },
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        window.location.href = '/success';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter ad budget (€)"
        className="w-full border p-2 rounded"
        required
      />

      <CardInput />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing…' : 'Pay & Launch Ad'}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
