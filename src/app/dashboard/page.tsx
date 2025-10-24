'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import authManager from '@/lib/auth';

interface UserApp {
  id: string;
  name: string;
  icon_url: string | null;
  external_url: string;
  background_color: string;
  text_color: string;
  is_admin_created?: boolean;
  is_locked?: boolean;
}

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [apps, setApps] = useState<UserApp[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [cars, setCars] = useState<any[]>([]);

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    if (storedRole === 'admin') {
      window.location.href = '/dashboard/admin';
    }

    try {
      const currentUser = authManager.getCurrentUser();
      setUser(currentUser);
      
      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    } catch {}

    // Fetch user apps, today's events, and cars
    fetchUserApps();
    fetchTodayEvents();
    fetchCars();
  }, []);

  const fetchUserApps = async () => {
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/user/apps`, {
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setApps(data || []);
      } else {
        console.error('Failed to fetch user apps');
      }
    } catch (error) {
      console.error('Error fetching user apps:', error);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchTodayEvents = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      const res = await authManager.authenticatedFetch(
        `${baseDomain}/api/calendar/events?start_time=${startOfDay.toISOString()}&end_time=${endOfDay.toISOString()}`,
        {
          headers: { Accept: 'application/json' }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setTodayEvents(data || []);
        console.log('Today\'s events fetched:', data);
      } else {
        console.error('Failed to fetch today\'s events');
      }
    } catch (error) {
      console.error('Error fetching today\'s events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await authManager.authenticatedFetch(`${baseDomain}/api/get-user-cars`, {
        headers: { Accept: 'application/json' }
      });
      
      if (res.ok) {
        const data = await res.json();
        const rawCars = Array.isArray(data?.['search-result']?.ads?.ad)
          ? data['search-result'].ads.ad
          : Array.isArray(data?.ads)
          ? data.ads
          : Array.isArray(data)
          ? data
          : [];
        
        const mapped = rawCars.map((c: any) => {
          const id = c['@key'] || c.mobileAdId || c.id || '';
          const make = c?.vehicle?.make?.['@key'] || c?.vehicle?.make || c?.make || '';
          const model = c?.vehicle?.model?.['@key'] || c?.vehicle?.model || c?.model || '';
          const modelDescription = c?.vehicle?.['model-description']?.['@value'] || c?.modelDescription || '';
          const title = [make, model, modelDescription].filter(Boolean).join(' ').trim() || 'Car';
          
          let image: string | null = null;
          // Use the same image extraction logic as the calendar
          if (Array.isArray(c?.images) && c.images.length > 0) {
            const i0 = c.images[0];
            image = i0?.m || i0?.s || i0?.xl || i0?.xxl || null;
          } else if (c?.images?.image?.representation?.[0]?.['@url']) {
            image = c.images.image.representation[0]['@url'];
          }
          
          // Debug: log the raw car data to see what's available
          console.log('Raw car data:', c);
          console.log('Car mapping:', { id, title, image, images: c?.images });
          return { id, title, image };
        });
        
        setCars(mapped);
        console.log('Cars fetched:', mapped);
        console.log('First car details:', mapped[0]);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const openApp = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
    }
  };

  const fullName = user?.full_name || user?.name || 'User';
  const firstName = fullName.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {greeting}, {firstName}
        </h1>
        <p className="text-gray-500">Here's what's happening with your dealership today</p>
      </div>

      {/* Apps Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Apps</h2>
        </div>
        
        {loadingApps ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-th text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 mb-2">No apps configured</p>
              <p className="text-sm text-gray-400">Contact your administrator to add apps</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-7 gap-2 max-w-5xl">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => openApp(app.external_url)}
                  className="rounded-lg p-2 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
                >
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ 
                      backgroundColor: app.background_color,
                      color: app.text_color
                    }}
                  >
                    {app.icon_url ? (
                      <img 
                        src={app.icon_url} 
                        alt={app.name}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <i className="fas fa-link text-xl"></i>
                    )}
                  </div>
                  <span 
                    className="text-xs font-medium text-center line-clamp-1 text-gray-700"
                  >
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Today's Highlights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Today's Highlights</h2>
            <span className="px-2.5 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full">
              {loadingEvents ? '...' : todayEvents.length}
            </span>
          </div>
          <Link href="/dashboard/calendar" className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1">
            Calendar
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {loadingEvents ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : todayEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-day text-2xl text-gray-400"></i>
              </div>
              <p className="text-gray-500 mb-2">No highlights for today</p>
              <p className="text-sm text-gray-400">Your tasks and events will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event) => {
                // Try to get car data from backend first, then fallback to frontend cars
                const backendCar = event.car;
                const frontendCar = event.car_mobile_de_id ? cars.find(car => car.id === event.car_mobile_de_id) : null;
                const carData = backendCar || frontendCar;
                
                console.log('Event:', event.title, 'Car ID:', event.car_mobile_de_id, 'Backend car:', backendCar, 'Frontend car:', frontendCar, 'Final car data:', carData);
                console.log('All cars:', cars);
                
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">{event.description}</p>
                      )}
                      {carData && (
                        <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                          <a 
                            href={carData.url || `https://suchen.mobile.de/fahrzeuge/details.html?id=${event.car_mobile_de_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors"
                          >
                            {carData.image ? (
                              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={carData.image} 
                                  alt={carData.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log('Image failed to load:', carData.image);
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully:', carData.image);
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                <i className="fas fa-car text-blue-600 text-xs"></i>
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-700 flex-1">
                              {carData.title}
                            </span>
                            <i className="fas fa-external-link-alt text-xs text-gray-400"></i>
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-400">
                          <i className="fas fa-clock mr-1"></i>
                          {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {event.end_time && (
                            <>
                              {' - '}
                              {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </>
                          )}
                        </span>
                        {event.location && (
                          <span className="text-xs text-gray-400">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-car text-green-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Active Listings</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-bullhorn text-blue-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Active Campaigns</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-purple-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Total Contacts</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-orange-600"></i>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Get Started</h2>
          <Link href="/dashboard/settings" className="text-sm font-medium text-gray-900 hover:text-blue-600 flex items-center gap-1">
            View All
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/dashboard/settings#integrations" 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <i className="fas fa-plug text-green-600"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Connect Integrations</h3>
            <p className="text-sm text-gray-500">Connect mobile.de, Facebook, and more to sync your inventory</p>
          </Link>

          <Link 
            href="/dashboard/social" 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <i className="fas fa-bullhorn text-blue-600"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Create Campaign</h3>
            <p className="text-sm text-gray-500">Launch new social media ads for your vehicles</p>
          </Link>

          <Link 
            href="/dashboard/inventory" 
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <i className="fas fa-car text-purple-600"></i>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Manage Inventory</h3>
            <p className="text-sm text-gray-500">View and manage your vehicle listings</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clock text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-500 mb-2">No recent activity</p>
            <p className="text-sm text-gray-400">Your recent actions will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;