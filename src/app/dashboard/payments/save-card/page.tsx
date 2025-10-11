'use client';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../../lib/stripe';
import SaveCardForm from '../../../../components/SaveCardForm';
import { hasTierOrAbove, getUserTier } from '@/lib/permissions';

export default function SaveCardPage() {
	const allowed = hasTierOrAbove('pro');
	const tier = getUserTier();
  return (
      <div className="p-10">
				<h1 className="text-2xl font-bold mb-4">Save a Payment Method</h1>
				{allowed ? (
					<Elements stripe={stripePromise}>
						<SaveCardForm />
					</Elements>
				) : (
					<div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
						Stripe ist im {tier ?? 'Basic'}-Paket gesperrt. Bitte upgraden, um fortzufahren.
					</div>
				)}
      </div>
	);
}


