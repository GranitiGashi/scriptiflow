'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout'; // adjust path if needed

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
