'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

type Props = {
  userId?: string;
  configId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export default function WhatsAppEmbeddedSignup({ userId, configId, onSuccess, onError }: Props) {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Listen for WA_EMBEDDED_SIGNUP message event
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('WA_EMBEDDED_SIGNUP event:', data);
          if (data.event === 'FINISH') {
            onSuccess?.();
          } else if (data.event === 'ERROR') {
            onError?.(data.error_message || 'Embedded signup error');
          }
        }
      } catch {
        // non-JSON event, ignore
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onError]);

  const launchSignup = () => {
    if (!sdkReady || !(window as any).FB) {
      alert('Facebook SDK not ready yet. Please wait a moment and try again.');
      return;
    }
    const state = userId ? JSON.stringify({ user_id: userId }) : undefined;
    (window as any).FB.login(
      (response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code;
          console.log('Embedded signup code:', code);
          // The backend callback will be invoked via redirect_uri
          // No further client action needed unless you handle it manually
        } else {
          console.log('Embedded signup cancelled:', response);
          onError?.('Signup cancelled or failed');
        }
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          ...(state ? { sessionInfoVersion: 2 } : {}),
        },
      }
    );
  };

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          (window as any).fbAsyncInit = function () {
            (window as any).FB.init({
              appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
              autoLogAppEvents: true,
              xfbml: true,
              version: 'v19.0',
            });
            console.log('FB SDK initialized');
            setSdkReady(true);
          };
          // Trigger init if FB is already available
          if ((window as any).FB) {
            (window as any).fbAsyncInit();
          }
        }}
      />
      <button
        onClick={launchSignup}
        disabled={!sdkReady}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
      >
        {sdkReady ? 'Connect WhatsApp (Embedded)' : 'Loading...'}
      </button>
    </>
  );
}

