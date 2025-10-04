'use client';

import { useEffect, useState } from 'react';
import { 
  FaCar, 
  FaRocket, 
  FaChartLine, 
  FaCreditCard, 
  FaPlus, 
  FaArrowRight,
  FaBullhorn,
  FaEye,
  FaCog,
  FaLink
} from 'react-icons/fa';
import authManager from '@/lib/auth';

type CueAction = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actionUrl: string;
  actionText: string;
  priority: 'high' | 'medium' | 'low';
  category: 'inventory' | 'advertising' | 'payments' | 'connections';
  requiresConnections?: string[]; // Required connection types
  available: boolean;
};

type ConnectionStatus = {
  stripe: boolean;
  mobilede: boolean;
  autoscout24: boolean;
  facebook: boolean;
  instagram: boolean;
  hasPaymentMethod: boolean;
  hasCars: boolean;
};

export default function DashboardCues() {
  const [connections, setConnections] = useState<ConnectionStatus>({
    stripe: false,
    mobilede: false,
    autoscout24: false,
    facebook: false,
    instagram: false,
    hasPaymentMethod: false,
    hasCars: false,
  });
  const [loading, setLoading] = useState(true);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check Stripe connection via API
      let stripeConnected = false;
      try {
        const stripeRes = await authManager.authenticatedFetch(`${baseDomain}/api/stripe/status`, {
          headers: { Accept: 'application/json' }
        });
        if (stripeRes.ok) {
          const stripeData = await stripeRes.json();
          stripeConnected = !!stripeData.connected;
        }
      } catch (e) {
        // ignore; leave as false
      }

      // Get user ID from localStorage
      const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = userString ? JSON.parse(userString) : null;
      const userId = user?.id;

      // Check if user has saved payment method
      let hasPaymentMethod = false;
      try {
        const pmRes = await authManager.authenticatedFetch(`${baseDomain}/api/payment-method`, {
          headers: { Accept: 'application/json' }
        });
        hasPaymentMethod = pmRes.ok || stripeConnected;
      } catch (e) {
        // Payment method not found is expected for new users
      }

      let socialConnections = { facebook: false, instagram: false };
      let mobiledeConnected = false;
      let as24Connected = false;
      let hasCars = false;

      if (userId) {
        // Check social connections
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
        } catch (e) {
          console.log('Social connections check failed:', e);
        }

        // Check mobile.de connection
        try {
          const mobileRes = await authManager.authenticatedFetch(
            `${baseDomain}/api/connect-mobile-de`, 
            { headers: { Accept: 'application/json' } }
          );
          mobiledeConnected = mobileRes.ok;
        } catch (e) {
          console.log('Mobile.de connection check failed:', e);
        }

        // Check AutoScout24 connection
        try {
          const as24Res = await authManager.authenticatedFetch(
            `${baseDomain}/api/autoscout24/connect`,
            { headers: { Accept: 'application/json' } }
          );
          as24Connected = as24Res.ok;
        } catch (e) {
          console.log('AutoScout24 connection check failed:', e);
        }

        // Check if user has cars (mobile.de inventory)
        if (mobiledeConnected || as24Connected) {
          try {
            // Prefer mobile.de endpoint if connected; otherwise use AutoScout24 remote listings
            const url = mobiledeConnected
              ? `${baseDomain}/api/get-user-cars`
              : `${baseDomain}/api/autoscout24/remote-listings`;
            const carsRes = await authManager.authenticatedFetch(url, {
              headers: { Accept: 'application/json' }
            });
            if (carsRes.ok) {
              const carsData = await carsRes.json();
              let count = 0;
              if (mobiledeConnected) {
                const rawCars = carsData?.['search-result']?.ads?.ad || [];
                count = Array.isArray(rawCars) ? rawCars.length : 0;
              } else {
                count = Array.isArray(carsData) ? carsData.length : (Array.isArray(carsData?.items) ? carsData.items.length : 0);
              }
              hasCars = count > 0;
            }
          } catch (e) {
            console.log('Cars check failed:', e);
          }
        }
      }

      setConnections({
        stripe: stripeConnected,
        mobilede: mobiledeConnected,
        autoscout24: as24Connected,
        facebook: socialConnections.facebook,
        instagram: socialConnections.instagram,
        hasPaymentMethod,
        hasCars,
      });
    } catch (error) {
      console.error('Error checking system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const allCues: CueAction[] = [
    // High Priority Actions
    {
      id: 'connect-mobilede',
      title: connections.mobilede ? 'Cars Imported' : 'Import Your Cars',
      description: connections.mobilede ? 'Your mobile.de account is connected.' : 'Connect your mobile.de account to start managing your inventory',
      icon: <FaCar className="text-green-600" />,
      actionUrl: '/dashboard/social-media',
      actionText: connections.mobilede ? 'View Inventory' : 'Connect mobile.de',
      priority: 'high',
      category: 'connections',
      available: !connections.mobilede,
    },
    {
      id: 'connect-payment',
      title: connections.hasPaymentMethod ? 'Payments Connected' : 'Add Payment Method',
      description: connections.hasPaymentMethod ? 'You can now run and manage campaigns.' : 'Set up payments to run advertising campaigns',
      icon: <FaCreditCard className="text-purple-600" />,
      actionUrl: '/dashboard/payments/save-card',
      actionText: connections.hasPaymentMethod ? 'Manage Payment' : 'Setup Payments',
      priority: 'high',
      category: 'payments',
      available: !connections.hasPaymentMethod,
    },
    {
      id: 'connect-social',
      title: (connections.facebook && connections.instagram) ? 'Social Connected' : 'Connect Social Media',
      description: (connections.facebook && connections.instagram) ? 'Facebook & Instagram connected.' : 'Link Facebook & Instagram to create and manage ads',
      icon: <FaLink className="text-blue-600" />,
      actionUrl: '/dashboard/social-media',
      actionText: (connections.facebook && connections.instagram) ? 'Manage Accounts' : 'Connect Accounts',
      priority: 'high',
      category: 'connections',
      available: !(connections.facebook && connections.instagram),
    },

    // Medium Priority Actions
    {
      id: 'view-inventory',
      title: 'Manage Car Inventory',
      description: 'View and manage your imported car listings',
      icon: <FaEye className="text-gray-600" />,
      actionUrl: '/dashboard/inventory',
      actionText: 'View Inventory',
      priority: 'medium',
      category: 'inventory',
      requiresConnections: ['mobilede'],
      available: connections.mobilede && connections.hasCars,
    },
    {
      id: 'boost-car',
      title: 'Boost a Car Ad',
      description: 'Create targeted advertising campaigns for your cars',
      icon: <FaRocket className="text-orange-600" />,
      actionUrl: '/dashboard/inventory',
      actionText: 'Start Boosting',
      priority: 'medium',
      category: 'advertising',
      requiresConnections: ['mobilede', 'facebook', 'payments'],
      available: connections.mobilede && connections.hasCars && connections.facebook && connections.hasPaymentMethod,
    },
    {
      id: 'view-campaigns',
      title: 'Track Ad Performance',
      description: 'Monitor your advertising campaigns and see results',
      icon: <FaChartLine className="text-green-600" />,
      actionUrl: '/dashboard/social-media',
      actionText: 'View Analytics',
      priority: 'medium',
      category: 'advertising',
      requiresConnections: ['facebook'],
      available: connections.facebook,
    },

    // Low Priority Actions
    {
      id: 'manage-settings',
      title: 'Account Settings',
      description: 'Manage your account preferences and connections',
      icon: <FaCog className="text-gray-600" />,
      actionUrl: '/dashboard/social-media',
      actionText: 'Manage Settings',
      priority: 'low',
      category: 'connections',
      available: true,
    },
  ];

  // Filter and sort cues
  const availableCues = allCues
    .filter(cue => cue.available)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 6); // Show max 6 cues

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (availableCues.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="text-center py-8">
          <FaRocket className="text-4xl text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            You're all set up! 🎉
          </h3>
          <p className="text-gray-600 mb-4">
            All your accounts are connected and ready to go.
          </p>
          <a
            href="/dashboard/inventory"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Your Cars
            <FaArrowRight className="ml-2" />
          </a>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string, priority: string) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (category === 'advertising') return 'border-l-orange-500 bg-orange-50';
    if (category === 'payments') return 'border-l-purple-500 bg-purple-50';
    if (category === 'connections') return 'border-l-blue-500 bg-blue-50';
    return 'border-l-gray-500 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          What You Can Do
        </h3>
        <FaBullhorn className="text-blue-500 text-xl" />
      </div>

      {/* Quick status overview */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${connections.mobilede ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <span className="text-sm text-gray-700">mobile.de</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${connections.mobilede ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{connections.mobilede ? 'Connected' : 'Not connected'}</span>
        </div>
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${(connections.facebook && connections.instagram) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <span className="text-sm text-gray-700">Facebook & Instagram</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${(connections.facebook && connections.instagram) ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{(connections.facebook && connections.instagram) ? 'Connected' : 'Not connected'}</span>
        </div>
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${connections.hasPaymentMethod ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <span className="text-sm text-gray-700">Payments</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${connections.hasPaymentMethod ? 'bg-green-100 text-green-800' : 'bg-gray-2 00 text-gray-700'}`}>{connections.hasPaymentMethod ? 'Connected' : 'Not connected'}</span>
        </div>
        <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${connections.hasCars ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <span className="text-sm text-gray-700">Inventory</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${connections.hasCars ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{connections.hasCars ? 'Imported' : 'No cars'}</span>
        </div>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableCues.map((cue) => (
          <div
            key={cue.id}
            className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${getCategoryColor(cue.category, cue.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-2xl">{cue.icon}</div>
              {cue.priority === 'high' && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  Recommended
                </span>
              )}
            </div>
            
            <h4 className="font-medium text-gray-900 mb-2">{cue.title}</h4>
            <p className="text-sm text-gray-600 mb-4">{cue.description}</p>
            
            <a
              href={cue.actionUrl}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {cue.actionText}
              <FaArrowRight className="ml-1 text-xs" />
            </a>
          </div>
        ))}
      </div>

      {availableCues.some(cue => cue.priority === 'high') && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>💡 Quick Tip:</strong> Complete the recommended actions above to unlock all features and start boosting your car sales!
          </p>
        </div>
      )}
    </div>
  );
}
