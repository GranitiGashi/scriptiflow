'use client';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../../lib/stripe';
import SaveCardForm from '../../../components/SaveCardForm';
import { useRouter } from 'next/navigation';

export default function StripeConnectPage() {
	const router = useRouter();

	return (
		<Elements stripe={stripePromise}>
			<div className="min-h-screen flex items-center justify-center bg-black p-4">
				<div className="w-full max-w-lg bg-black/60 border border-purple-500/30 rounded-xl shadow-lg p-6 text-white">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-2xl font-bold">Connect Stripe</h1>
						<div className="flex items-center space-x-2 text-green-500">
							<span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
							<span className="text-sm">Secure • PCI compliant</span>
						</div>
					</div>
					<p className="text-gray-300 mb-6">Add a card to securely save your payment method for future charges.</p>
					<div className="border border-purple-500/30 rounded-lg p-4 mb-4 bg-gray-900/40">
						<SaveCardForm onSuccess={() => {
							try { localStorage.setItem('stripe_connected', 'true'); } catch {}
							router.replace('/dashboard/social-media?connected=stripe');
						}} />
					</div>
					<p className="text-xs text-gray-400">We never see your full card details. All payments are processed by Stripe.</p>
				</div>
			</div>
		</Elements>
	);
}


