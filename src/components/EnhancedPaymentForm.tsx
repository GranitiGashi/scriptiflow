'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import CardInput from './CardInput';

interface SavedCard {
	payment_method_id: string;
	brand: string;
	last4: string;
	exp_month: number;
	exp_year: number;
}

interface EnhancedPaymentFormProps {
	amount: string;
	onSuccess?: (result: any) => void;
	onError?: (error: string) => void;
	showSaveOption?: boolean;
	currency?: string;
	description?: string;
}

export default function EnhancedPaymentForm({
	amount,
	onSuccess,
	onError,
	showSaveOption = true,
	currency = 'eur',
	description = 'Payment'
}: EnhancedPaymentFormProps) {
	const stripe: Stripe | null = useStripe();
	const elements = useElements();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
	const [selectedCard, setSelectedCard] = useState<string>('');
	const [useNewCard, setUseNewCard] = useState<boolean>(false);
	const [loadingSavedCards, setLoadingSavedCards] = useState<boolean>(true);

	const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

	useEffect(() => {
		loadSavedCards();
	}, []);

	const loadSavedCards = async () => {
		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
			if (!token) {
				setLoadingSavedCards(false);
				return;
			}

			const res = await fetch(`${baseDomain}/api/payment-method`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json'
				}
			});

			if (res.ok) {
				const data = await res.json();
				setSavedCards(data.cards || []);
				if (data.cards && data.cards.length > 0) {
					setSelectedCard(data.cards[0].payment_method_id);
				} else {
					setUseNewCard(true);
				}
			}
		} catch (err) {
			console.error('Failed to load saved cards:', err);
		} finally {
			setLoadingSavedCards(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
			if (!token) {
				throw new Error('Please log in to continue');
			}

			if (useNewCard || !selectedCard) {
				// Use new card payment
				await handleNewCardPayment(token);
			} else {
				// Use saved card payment
				await handleSavedCardPayment(token);
			}
		} catch (err: any) {
			const errorMsg = err.message || 'Payment failed';
			setError(errorMsg);
			if (onError) onError(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const handleNewCardPayment = async (token: string) => {
		const res = await fetch(`${baseDomain}/api/create-payment-intent`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({ 
				amount: parseInt(amount) * 100, // Convert to cents
				currency,
				description 
			}),
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			throw new Error((errData as any).error || 'Failed to create payment intent');
		}

		const { client_secret } = await res.json();

		if (!stripe || !elements) throw new Error('Stripe.js has not loaded yet');
		const cardElement: StripeCardElement | null = elements.getElement(CardElement);
		if (!cardElement) throw new Error('Card element not found');

		const result = await stripe.confirmCardPayment(client_secret, {
			payment_method: { card: cardElement },
		});

		if (result.error) {
			// Handle specific Stripe error types with helpful messages
			let errorMessage = result.error.message || 'Payment failed';
			
			if (result.error.code === 'expired_card') {
				errorMessage = 'Your card is expired. Please check the expiry date and try again.';
			} else if (result.error.code === 'card_declined') {
				errorMessage = 'Your card was declined. Please try a different card or contact your bank.';
			} else if (result.error.code === 'incorrect_cvc') {
				errorMessage = 'The security code (CVC) is incorrect. Please check and try again.';
			} else if (result.error.code === 'invalid_expiry_month' || result.error.code === 'invalid_expiry_year') {
				errorMessage = 'The expiry date is invalid. Please enter it in MM/YY format (e.g., 04/29).';
			} else if (result.error.code === 'processing_error') {
				errorMessage = 'There was a processing error. Please try again in a moment.';
			} else if (result.error.code === 'incomplete_number') {
				errorMessage = 'The card number is incomplete. Please enter the full card number.';
			} else if (result.error.code === 'incomplete_cvc') {
				errorMessage = 'The security code (CVC) is incomplete. Please enter all digits.';
			} else if (result.error.code === 'incomplete_expiry') {
				errorMessage = 'The expiry date is incomplete. Please enter both month and year.';
			}
			
			throw new Error(errorMessage);
		} else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
			if (onSuccess) onSuccess(result.paymentIntent);
		}
	};

	const handleSavedCardPayment = async (token: string) => {
		const res = await fetch(`${baseDomain}/api/payment/charge-saved-card`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				payment_method_id: selectedCard,
				amount: parseInt(amount) * 100, // Convert to cents
				currency,
				description
			}),
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			throw new Error((errData as any).error || 'Failed to charge saved card');
		}

		const result = await res.json();
		if (onSuccess) onSuccess(result);
	};

	if (loadingSavedCards) {
		return (
			<div className="space-y-4 max-w-md mx-auto">
				<div className="animate-pulse">
					<div className="h-4 bg-gray-200 rounded mb-2"></div>
					<div className="h-10 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
			<div className="mb-4">
				<h3 className="text-lg font-semibold mb-2">Payment Method</h3>
				
				{savedCards.length > 0 && (
					<div className="space-y-2 mb-4">
						<label className="flex items-center space-x-2">
							<input
								type="radio"
								name="paymentMethod"
								checked={!useNewCard}
								onChange={() => setUseNewCard(false)}
								className="form-radio"
							/>
							<span>Use saved card</span>
						</label>
						
						{!useNewCard && (
							<select
								value={selectedCard}
								onChange={(e) => setSelectedCard(e.target.value)}
								className="w-full border p-2 rounded ml-6"
							>
								{savedCards.map((card) => (
									<option key={card.payment_method_id} value={card.payment_method_id}>
										**** **** **** {card.last4} ({card.brand.toUpperCase()}) {card.exp_month}/{card.exp_year}
									</option>
								))}
							</select>
						)}
					</div>
				)}
				
				<label className="flex items-center space-x-2">
					<input
						type="radio"
						name="paymentMethod"
						checked={useNewCard}
						onChange={() => setUseNewCard(true)}
						className="form-radio"
					/>
					<span>Use new card</span>
				</label>
			</div>

			{useNewCard && (
				<div className="space-y-4">
					{process.env.NODE_ENV === 'development' && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
							<p className="text-blue-800"><strong>Test Card:</strong> 4242 4242 4242 4242</p>
							<p className="text-blue-700">Use any future expiry date and any 3-digit CVC</p>
						</div>
					)}
					<CardInput />
					{showSaveOption && (
						<label className="flex items-center space-x-2">
							<input type="checkbox" className="form-checkbox" />
							<span className="text-sm">Save this card for future use</span>
						</label>
					)}
				</div>
			)}

			<div className="bg-gray-50 p-4 rounded">
				<div className="flex justify-between items-center">
					<span className="font-semibold">Total:</span>
					<span className="font-bold text-lg">€{amount}</span>
				</div>
				{description && (
					<p className="text-sm text-gray-600 mt-1">{description}</p>
				)}
			</div>

			<button
				type="submit"
				className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				disabled={!stripe || loading || (!useNewCard && !selectedCard)}
			>
				{loading ? 'Processing...' : `Pay €${amount}`}
			</button>

			{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
		</form>
	);
}
