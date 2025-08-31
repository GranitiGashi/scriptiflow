'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaCircle, FaStripe, FaCar, FaFacebook, FaInstagram, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Progress } from '@/components/ui/progress';
import authManager from '@/lib/auth';

type SetupStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  actionUrl: string;
  actionText: string;
};

type ConnectionStatus = {
  stripe: boolean;
  mobilede: boolean;
  facebook: boolean;
  instagram: boolean;
};

export default function AccountSetupProgress() {
  const [connections, setConnections] = useState<ConnectionStatus>({
    stripe: false,
    mobilede: false,
    facebook: false,
    instagram: false,
  });
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      // Check Stripe connection via API
      let stripeConnected = false;
      try {
        const stripeRes = await authManager.authenticatedFetch(
          `${baseDomain}/api/stripe/status`,
          { headers: { Accept: 'application/json' } }
        );
        if (stripeRes.ok) {
          const stripeData = await stripeRes.json();
          stripeConnected = !!stripeData.connected;
        }
      } catch (e) {
        console.log('Stripe status check failed:', e);
      }

      // Get user ID from localStorage
      const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id;

      let socialConnections = { facebook: false, instagram: false };
      let mobiledeConnected = false;

      if (userId) {
        // Check social connections (Facebook, Instagram)
        try {
          const socialRes = await authManager.authenticatedFetch(
            `${baseDomain}/api/social-accounts?user_id=${encodeURIComponent(userId)}`,
            { headers: { Accept: 'application/json' } }
          );
          
          if (socialRes.ok) {
            const socialData = await socialRes.json();
            socialConnections = {
              facebook: !!socialData.facebook_id,
              instagram: !!socialData.instagram_id,
            };
          }
        } catch (err) {
          console.log('Social connections check failed:', err);
        }

        // Check mobile.de connection
        try {
          const mobileRes = await authManager.authenticatedFetch(
            `${baseDomain}/api/connect-mobile-de`,
            { headers: { Accept: 'application/json' } }
          );
          mobiledeConnected = mobileRes.ok;
        } catch (err) {
          console.log('Mobile.de connection check failed:', err);
        }
      }

      setConnections({
        stripe: stripeConnected,
        mobilede: mobiledeConnected,
        facebook: socialConnections.facebook,
        instagram: socialConnections.instagram,
      });
    } catch (error) {
      console.error('Error checking connection status:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps: SetupStep[] = [
    {
      id: 'stripe',
      title: 'Connect Payment Method',
      description: 'Add a payment method to enable advertising campaigns',
      icon: <FaStripe className="text-purple-600" />,
      completed: connections.stripe,
      actionUrl: '/stripe/connect',
      actionText: 'Connect Stripe',
    },
    {
      id: 'mobilede',
      title: 'Connect mobile.de',
      description: 'Import your car listings from mobile.de',
      icon: <FaCar className="text-green-600" />,
      completed: connections.mobilede,
      actionUrl: '/dashboard/social-media',
      actionText: 'Connect mobile.de',
    },
    {
      id: 'social',
      title: 'Connect Social Media',
      description: 'Connect Facebook & Instagram for advertising',
      icon: (
        <div className="flex space-x-1">
          <FaFacebook className="text-blue-600" />
          <FaInstagram className="text-pink-500" />
        </div>
      ),
      completed: connections.facebook && connections.instagram,
      actionUrl: '/dashboard/social-media',
      actionText: 'Connect Social Media',
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  useEffect(() => {
    // Auto-collapse when everything is completed; expand otherwise
    setCollapsed(completedSteps === steps.length);
  }, [completedSteps, steps.length]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Always show the setup card, even when fully completed (shows 100%)

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Finish Setting Up Your Account
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {completedSteps} of {steps.length} completed
          </span>
          {completedSteps === steps.length && (
            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="flex items-center px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {collapsed ? (
                <>
                  <FaChevronDown className="mr-1" /> Show
                </>
              ) : (
                <>
                  <FaChevronUp className="mr-1" /> Hide
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                step.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              } transition-colors`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <FaCheckCircle className="text-green-500 text-xl" />
                  ) : (
                    <FaCircle className="text-gray-400 text-xl" />
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{step.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>

              {!step.completed && (
                <a
                  href={step.actionUrl}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {step.actionText}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {completedSteps > 0 && completedSteps < steps.length && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Great progress!</strong> You're {steps.length - completedSteps} step{steps.length - completedSteps !== 1 ? 's' : ''} away from unlocking all features.
          </p>
        </div>
      )}
    </div>
  );
}
