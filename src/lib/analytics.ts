"use client";

// NOTE: Avoid bundling posthog in the common client chunk by loading it lazily
// only when analytics is enabled and the app runs in the browser.

type AnalyticsInitOptions = {
  apiKey?: string;
  apiHost?: string;
  enable?: boolean;
};

let initialized = false;
let posthogInstance: any = null;

async function ensurePosthog(): Promise<any> {
  if (posthogInstance) return posthogInstance;
  const mod: any = await import('posthog-js');
  posthogInstance = mod?.default ?? mod;
  return posthogInstance;
}

export async function initAnalytics(options?: AnalyticsInitOptions): Promise<void> {
  if (initialized) return;
  const apiKey = options?.apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = options?.apiHost || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';
  const enable = options?.enable ?? (!!apiKey && typeof window !== 'undefined');

  if (!enable) return;

  try {
    const posthog = await ensurePosthog();
    posthog.init(apiKey as string, {
      api_host: apiHost,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: { password: true },
      },
    });
    initialized = true;
  } catch (e) {
    // ignore init errors
  }
}

export async function identifyUser(userId?: string | null, properties?: Record<string, unknown>) {
  if (!initialized || !userId) return;
  try {
    const posthog = await ensurePosthog();
    posthog.identify(userId, properties);
  } catch {}
}

export async function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  try {
    const posthog = await ensurePosthog();
    posthog.capture(event, properties);
  } catch {}
}

export async function trackPageView(path?: string) {
  if (!initialized) return;
  try {
    const posthog = await ensurePosthog();
    posthog.capture('$pageview', path ? { $current_url: path } : undefined);
  } catch {}
}

export function getPostHog() {
  return posthogInstance;
}