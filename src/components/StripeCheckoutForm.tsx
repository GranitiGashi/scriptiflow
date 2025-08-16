'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import CardInput from './CardInput';

export default function StripeCheckoutForm() {
	const stripe: Stripe | null = useStripe();
	const elements = useElements();
	const [amount, setAmount] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await fetch(`${baseDomain}/api/create-payment-intent`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ amount }),
			});
			const { clientSecret } = await res.json();

			if (!stripe || !elements) throw new Error('Stripe.js has not loaded yet');
			const cardElement: StripeCardElement | null = elements.getElement(CardElement);
			if (!cardElement) throw new Error('Card element not found');

			const result = await stripe.confirmCardPayment(clientSecret, {
				payment_method: { card: cardElement },
			});

			if (result.error) {
				setError(result.error.message || 'Payment failed');
			} else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
				window.location.href = '/dashboard/payments/success';
			}
		} catch (err: any) {
			setError(err.message || 'Something went wrong');
		} finally {
			setLoading(false);
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


