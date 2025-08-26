'use client';

import { CardElement } from '@stripe/react-stripe-js';
import { useMemo } from 'react';
import type { StripeCardElementOptions } from '@stripe/stripe-js';

interface CardInputProps {
	className?: string;
}

export default function CardInput({ className }: CardInputProps) {
	const options = useMemo<StripeCardElementOptions>(() => ({
		style: {
			base: {
				fontSize: '16px',
				color: '#1f2937',
				fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				'::placeholder': { 
					color: '#9ca3af' 
				},
				iconColor: '#6b7280',
			},
			invalid: {
				color: '#dc2626',
				iconColor: '#dc2626',
			},
			complete: {
				color: '#059669',
				iconColor: '#059669',
			},
		},
		hidePostalCode: true,
	}), []);

	return (
		<div className={`border border-gray-300 rounded-lg p-4 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all ${className || ''}`}>
			<CardElement options={options} />
		</div>
	);
}


