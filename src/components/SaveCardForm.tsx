'use client';

import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import CardInput from './CardInput';

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
				// Handle specific Stripe error types with helpful messages
				let errorMessage = confirmError.message || 'Card confirmation failed';
				
				if (confirmError.code === 'expired_card') {
					errorMessage = 'Your card is expired. Please check the expiry date and try again.';
				} else if (confirmError.code === 'card_declined') {
					errorMessage = 'Your card was declined. Please try a different card or contact your bank.';
				} else if (confirmError.code === 'incorrect_cvc') {
					errorMessage = 'The security code (CVC) is incorrect. Please check and try again.';
				} else if (confirmError.code === 'invalid_expiry_month' || confirmError.code === 'invalid_expiry_year') {
					errorMessage = 'The expiry date is invalid. Please enter it in MM/YY format (e.g., 04/29).';
				} else if (confirmError.code === 'processing_error') {
					errorMessage = 'There was a processing error. Please try again in a moment.';
				} else if (confirmError.code === 'incomplete_number') {
					errorMessage = 'The card number is incomplete. Please enter the full card number.';
				} else if (confirmError.code === 'incomplete_cvc') {
					errorMessage = 'The security code (CVC) is incomplete. Please enter all digits.';
				} else if (confirmError.code === 'incomplete_expiry') {
					errorMessage = 'The expiry date is incomplete. Please enter both month and year.';
				}
				
				throw new Error(errorMessage);
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
		<div className="max-w-lg mx-auto">
			<div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Save Payment Method</h2>
					<p className="text-gray-600">Securely save your card for faster future payments</p>
				</div>

				{process.env.NODE_ENV === 'development' && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
						<h4 className="font-semibold text-blue-800 mb-2">Test Card Numbers</h4>
						<div className="text-sm text-blue-700 space-y-1">
							<p><strong>Success:</strong> 4242 4242 4242 4242</p>
							<p><strong>Declined:</strong> 4000 0000 0000 0002</p>
							<p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
							<p><strong>CVC:</strong> Any 3 digits (e.g., 123)</p>
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Card Information
						</label>
						<CardInput />
						<p className="text-xs text-gray-500 mt-2">
							Your card information is encrypted and secure
						</p>
					</div>

					<div className="bg-gray-50 rounded-lg p-4">
						<div className="flex items-center space-x-2 text-sm text-gray-600">
							<svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							<span>Your payment information is secured with bank-level encryption</span>
						</div>
					</div>

					<button
						type="submit"
						className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
						disabled={!stripe || loading}
					>
						{loading ? (
							<div className="flex items-center justify-center space-x-2">
								<svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span>Saving Card...</span>
							</div>
						) : (
							<div className="flex items-center justify-center space-x-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
								</svg>
								<span>Save Card Securely</span>
							</div>
						)}
					</button>

					{error && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<div className="flex items-center space-x-2">
								<svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
								<p className="text-red-800 font-medium">{error}</p>
							</div>
						</div>
					)}

					{success && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4">
							<div className="flex items-center space-x-2">
								<svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								<p className="text-green-800 font-medium">{success}</p>
							</div>
						</div>
					)}
				</form>

				<div className="mt-6 pt-6 border-t border-gray-200">
					<div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
						<span>Powered by</span>
						<svg className="h-4" viewBox="0 0 60 25" fill="none">
							<path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 01-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04.68-.06.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 013.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.45.94.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 01-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-8.64.54c0 .8.53 1.19 1.17 1.19.55 0 1.15-.26 1.77-.69V18.4c-.98.68-2.28.89-3.14.89-2.59 0-4.1-1.69-4.1-4.2 0-2.82 2.94-4.34 6.27-4.34V9.32c0-.8-.84-1.19-1.77-1.19-.77 0-1.58.16-2.13.54L2.8 5.69A8.95 8.95 0 018.95 4.3c2.64 0 4.2 1.57 4.2 4.69v10.01H9.4l-.09-.8c-.58.17-1.24.6-1.24.6z" fill="#6772e5"/>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
}


