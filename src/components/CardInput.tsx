'use client';

import { CardElement } from '@stripe/react-stripe-js';
import { useMemo } from 'react';
import type { StripeCardElementOptions } from '@stripe/stripe-js';

export default function CardInput() {
	const options = useMemo<StripeCardElementOptions>(() => ({
		style: {
			base: {
				fontSize: '16px',
				color: '#424770',
				'::placeholder': { color: '#aab7c4' },
			},
			invalid: {
				color: '#9e2146',
			},
		},
	}), []);

	return <CardElement options={options} />;
}


