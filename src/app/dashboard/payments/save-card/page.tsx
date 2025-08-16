'use client';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../../lib/stripe';
import SaveCardForm from '../../../../components/SaveCardForm';

export default function SaveCardPage() {
	return (
		<Elements stripe={stripePromise}>
			<div className="p-10">
				<h1 className="text-2xl font-bold mb-4">Save a Payment Method</h1>
				<SaveCardForm />
			</div>
		</Elements>
	);
}


