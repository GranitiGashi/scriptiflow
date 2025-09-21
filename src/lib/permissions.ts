export type Tier = 'basic' | 'pro' | 'premium';

export function getUserTier(): Tier | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem('user');
		if (!raw) return null;
		const user = JSON.parse(raw);
		const tier = user?.permissions?.tier as string | undefined;
		if (tier === 'basic' || tier === 'pro' || tier === 'premium') return tier;
		return null;
	} catch {
		return null;
	}
}

export function isAdmin(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const raw = localStorage.getItem('user');
		if (!raw) return false;
		const user = JSON.parse(raw);
		return user?.role === 'admin';
	} catch {
		return false;
	}
}

export function hasTierOrAbove(required: Tier): boolean {
	const order: Record<Tier, number> = { basic: 1, pro: 2, premium: 3 };
	if (isAdmin()) return true;
	const tier = getUserTier();
	if (!tier) return false;
	return order[tier] >= order[required];
}
