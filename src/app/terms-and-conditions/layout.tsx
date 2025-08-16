'use client';

import React from 'react';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';

export default function PublicTermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationBar />
      {children}
      <Footer />
    </div>
  );
}


