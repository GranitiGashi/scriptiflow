import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ScriptiFlow — Automate Your Car Dealership with AI",
  description:
    "Mobile.de integration, AI-powered Facebook & Instagram ads, social media autoposting, email automation & analytics for car dealerships. Start your free trial today.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'ScriptiFlow — Automate Your Car Dealership with AI',
    description: "Mobile.de integration, AI-powered Facebook & Instagram ads, social media autoposting, email automation & analytics for car dealerships. Start your free trial today.",
    url: '/',
    siteName: 'ScriptiFlow',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'ScriptiFlow — Car Dealership Automation Platform' },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScriptiFlow — Automate Your Car Dealership with AI',
    description: "Mobile.de integration, AI-powered Facebook & Instagram ads, social media autoposting, email automation & analytics for car dealerships.",
    images: ['/og-image.png'],
  },
  keywords: [
    'car dealership automation',
    'mobile.de integration',
    'auto dealer social media automation',
    'Facebook Instagram ads car dealership',
    'AI powered car dealership marketing',
    'automated email campaigns car dealers',
    'dealership analytics dashboard',
    'social media autoposting cars',
    'car inventory automation',
    'automotive marketing platform',
    'dealership lead generation',
    'car sales automation',
    'auto dealer CRM integration',
    'stripe payments car dealership'
  ],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AnalyticsProvider>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'ScriptiFlow',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any',
              offers: { 
                '@type': 'Offer', 
                price: '299', 
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock'
              },
              description:
                'Mobile.de integration, AI-powered Facebook & Instagram ads, social media autoposting, email automation & analytics for car dealerships.',
              url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
              featureList: [
                'Mobile.de Integration',
                'AI-Powered Social Media Ads',
                'Automated Email Campaigns',
                'Social Media Autoposting',
                'Advanced Analytics Dashboard',
                'Stripe Payment Integration'
              ],
            }),
          }}
        />
        {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
