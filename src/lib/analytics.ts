"use client";

import posthog from 'posthog-js';

type AnalyticsInitOptions = {
  apiKey?: string;
  apiHost?: string;
  enable?: boolean;
};

let initialized = false;

export function initAnalytics(options?: AnalyticsInitOptions) {
  if (initialized) return;
  const apiKey = options?.apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = options?.apiHost || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com';
  const enable = options?.enable ?? (!!apiKey && typeof window !== 'undefined');

  if (!enable) return;

  try {
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

export function identifyUser(userId?: string | null, properties?: Record<string, unknown>) {
  if (!initialized || !userId) return;
  try {
    posthog.identify(userId, properties);
  } catch {}
}

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  try {
    posthog.capture(event, properties);
  } catch {}
}

export function trackPageView(path?: string) {
  if (!initialized) return;
  try {
    posthog.capture('$pageview', path ? { $current_url: path } : undefined);
  } catch {}
}

export function getPostHog() {
  return posthog;
}


