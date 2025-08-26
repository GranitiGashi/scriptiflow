'use client';
import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../../lib/stripe';
import EnhancedPaymentForm from '../../../../components/EnhancedPaymentForm';

export default function AdPayment() {
	const [amount, setAmount] = useState<string>('');
	const [paymentMethod, setPaymentMethod] = useState<string>('stripe');
	const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

	const handlePaymentSuccess = (result: any) => {
		console.log('Payment successful:', result);
		setPaymentSuccess(true);
		// Redirect or update UI as needed
		setTimeout(() => {
			window.location.href = '/dashboard/payments/success';
		}, 2000);
	};

	const handlePaymentError = (error: string) => {
		console.error('Payment failed:', error);
	};

	if (paymentSuccess) {
		return (
			<div className="p-10 text-center">
				<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
					<h2 className="text-xl font-bold">Payment Successful!</h2>
					<p>Your ad campaign funding has been processed successfully.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-10 max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">Fund Your Ad Campaign</h1>
			
			<div className="grid md:grid-cols-2 gap-8">
				<div>
					<div className="mb-6">
						<label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
							Ad Budget Amount (€)
						</label>
						<input
							type="number"
							id="amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="Enter amount"
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							min="1"
							step="0.01"
							required
						/>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-3">
							Payment Platform
						</label>
						<div className="space-y-2">
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="paymentMethod"
									value="stripe"
									checked={paymentMethod === 'stripe'}
									onChange={(e) => setPaymentMethod(e.target.value)}
									className="form-radio text-blue-600"
								/>
								<span>Credit/Debit Card (Stripe)</span>
							</label>
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="paymentMethod"
									value="paypal"
									checked={paymentMethod === 'paypal'}
									onChange={(e) => setPaymentMethod(e.target.value)}
									className="form-radio text-blue-600"
								/>
								<span>PayPal</span>
							</label>
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="paymentMethod"
									value="apple_pay"
									checked={paymentMethod === 'apple_pay'}
									onChange={(e) => setPaymentMethod(e.target.value)}
									className="form-radio text-blue-600"
								/>
								<span>Apple Pay</span>
							</label>
							<label className="flex items-center space-x-2">
								<input
									type="radio"
									name="paymentMethod"
									value="google_pay"
									checked={paymentMethod === 'google_pay'}
									onChange={(e) => setPaymentMethod(e.target.value)}
									className="form-radio text-blue-600"
								/>
								<span>Google Pay</span>
							</label>
						</div>
					</div>
				</div>

				<div>
					{paymentMethod === 'stripe' && amount && (
						<Elements stripe={stripePromise}>
							<EnhancedPaymentForm
								amount={amount}
								onSuccess={handlePaymentSuccess}
								onError={handlePaymentError}
								description="Ad Campaign Funding"
								showSaveOption={true}
							/>
						</Elements>
					)}

					{paymentMethod === 'paypal' && amount && (
						<div className="bg-gray-50 p-6 rounded-lg">
							<h3 className="text-lg font-semibold mb-4">PayPal Payment</h3>
							<p className="text-gray-600 mb-4">
								You will be redirected to PayPal to complete your payment of €{amount}.
							</p>
							<button
								className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
								onClick={() => {
									// Implement PayPal integration
									alert('PayPal integration coming soon!');
								}}
							>
								Pay with PayPal
							</button>
						</div>
					)}

					{(paymentMethod === 'apple_pay' || paymentMethod === 'google_pay') && amount && (
						<div className="bg-gray-50 p-6 rounded-lg">
							<h3 className="text-lg font-semibold mb-4">
								{paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'}
							</h3>
							<p className="text-gray-600 mb-4">
								{paymentMethod === 'apple_pay' ? 'Apple Pay' : 'Google Pay'} integration coming soon!
								For now, please use the Credit/Debit Card option.
							</p>
							<button
								className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold cursor-not-allowed"
								disabled
							>
								Coming Soon
							</button>
						</div>
					)}

					{!amount && (
						<div className="bg-gray-50 p-6 rounded-lg">
							<p className="text-gray-500 text-center">
								Please enter an amount to continue with payment.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}


