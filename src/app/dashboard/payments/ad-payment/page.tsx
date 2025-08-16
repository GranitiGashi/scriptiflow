'use client';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../../lib/stripe';
import StripeCheckoutForm from '../../../../components/StripeCheckoutForm';

export default function AdPayment() {
	return (
		<Elements stripe={stripePromise}>
			<div className="p-10">
				<h1 className="text-2xl font-bold mb-4">Fund Your Ad</h1>
				<StripeCheckoutForm />
			</div>
		</Elements>
	);
}


