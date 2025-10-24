"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect logic
    const redirectUser = () => {
      try {
        // Check if user is already logged in
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userStr = localStorage.getItem('user');
        const expiresAt = localStorage.getItem('expires_at');

        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(userStr);
          
          // Check if token is expired (with 5 min buffer)
          if (expiresAt) {
            const expirationTime = parseInt(expiresAt) * 1000;
            const now = Date.now();
            const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
            
            if (expirationTime - now > bufferTime) {
              // Valid session - redirect to dashboard
              const dest = user.role === 'admin' ? '/dashboard/admin' : '/dashboard';
              router.replace(dest);
              return;
            }
          } else {
            // No expiration time, assume valid
            const dest = user.role === 'admin' ? '/dashboard/admin' : '/dashboard';
            router.replace(dest);
            return;
          }
        }
        
        // No valid session - redirect to login
        router.replace('/login');
      } catch (err) {
        console.error('Session check error:', err);
        localStorage.clear();
        router.replace('/login');
      }
    };

    // Run immediately
    redirectUser();
  }, [router]);

  // Return nothing while redirecting
  return null;
}