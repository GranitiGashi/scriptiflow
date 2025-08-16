'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';

type SaveCardFormProps = {
	onSuccess?: () => void;
};

export default function SaveCardForm({ onSuccess }: SaveCardFormProps) {
	const stripe: Stripe | null = useStripe();
	const elements = useElements();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [success, setSuccess] = useState<string>('');

	const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!stripe || !elements) return;
		setLoading(true);

		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
			if (!token) {
				throw new Error('No access token found. Please log in again.');
			}
			const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
			const user = userString ? JSON.parse(userString) : null;
			const email = user?.email || undefined;

			const setupIntentRes = await fetch(`${baseDomain}/api/payment-method/setup-intent`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json'
				}
			});
			if (!setupIntentRes.ok) {
				const errData = await setupIntentRes.json().catch(() => ({}));
				throw new Error((errData as any).error || 'Failed to create SetupIntent');
			}
			const { client_secret } = await setupIntentRes.json();

			const cardElement: StripeCardElement | null = elements.getElement(CardElement);
			if (!cardElement) throw new Error('Card element not found');

			const { setupIntent, error: confirmError } = await stripe.confirmCardSetup(client_secret as string, {
				payment_method: {
					card: cardElement,
					billing_details: { email }
				}
			});
			if (confirmError) {
				throw new Error(confirmError.message || 'Card confirmation failed');
			}

			const saveRes = await fetch(`${baseDomain}/api/payment-method`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ payment_method_id: setupIntent?.payment_method })
			});
			if (!saveRes.ok) {
				const errData = await saveRes.json().catch(() => ({}));
				throw new Error((errData as any).error || 'Failed to save payment method');
			}

			setSuccess('Card saved and set as default.');
			if (onSuccess) onSuccess();
		} catch (err: any) {
			setError(err.message || 'Something went wrong');
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
			<CardElement />
			<button
				type="submit"
				className="bg-black text-white px-4 py-2 rounded"
				disabled={!stripe || loading}
			>
				{loading ? 'Saving…' : 'Save Card'}
			</button>
			{error && <p className="text-red-500 mt-2">{error}</p>}
			{success && <p className="text-green-600 mt-2">{success}</p>}
		</form>
	);
}


