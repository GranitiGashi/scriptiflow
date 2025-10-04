'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { hasTierOrAbove, getUserTier } from '@/lib/permissions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCar } from 'react-icons/fa';
import authManager from '@/lib/auth';

interface Car {
  id: string;
  url: string;
  make: string;
  model: string;
  modelDescription: string;
  price: string;
  currency: string;
  image: string | null;
  mileage: string;
  firstRegistration: string;
  fuel: string;
  power: string;
  gearbox: string;
  dealerCity?: string | null;
  dealerZip?: string | null;
  dealerLat?: number | null;
  dealerLon?: number | null;
}

export default function InventoryPage() {
  const allowed = hasTierOrAbove('pro');
  const tier = getUserTier();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileDeConnected, setMobileDeConnected] = useState(false);
  const [as24Connected, setAs24Connected] = useState(false);
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  // Check if mobile.de account is connected
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await authManager.authenticatedFetch(`${baseDomain}/api/connect-mobile-de`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) throw new Error('Please connect your mobile.de account.');
        setMobileDeConnected(true);
        // Also check AutoScout24; if mobile.de not connected, try AS24 instead
        try {
          const as24 = await authManager.authenticatedFetch(`${baseDomain}/api/autoscout24/connect`, { headers: { Accept: 'application/json' } });
          if (as24.ok) setAs24Connected(true);
        } catch (_) {}
      } catch (err: any) {
        console.error('Connection check failed:', err);
        // If mobile.de not connected, try AS24 before redirecting
        try {
          const as24 = await authManager.authenticatedFetch(`${baseDomain}/api/autoscout24/connect`, { headers: { Accept: 'application/json' } });
          if (as24.ok) {
            setAs24Connected(true);
            setError(null);
            return;
          }
        } catch (_) {}
        setError(err.message);
        if (err.message.includes('No valid access token')) {
          setError('Session expired. Please log in again.');
        } else {
          router.push('/connect');
        }
      }
    }

    checkConnection();
  }, [baseDomain, router]);

  // Fetch cars after confirming connection
  useEffect(() => {
    if (!mobileDeConnected && !as24Connected) return;

    async function fetchCars() {
      setLoading(true);
      setError(null);
      try {
        const url = mobileDeConnected
          ? `${baseDomain}/api/get-user-cars`
          : `${baseDomain}/api/autoscout24/remote-listings`;
        const res = await authManager.authenticatedFetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch cars.');
        }

        const data = await res.json();

        // Support both legacy (XML-like JSON) and new JSON formats
        let rawCars: any[] = [];
        if (mobileDeConnected) {
          rawCars = Array.isArray(data?.['search-result']?.ads?.ad)
            ? data['search-result'].ads.ad
            : Array.isArray(data?.ads)
            ? data.ads
            : Array.isArray(data)
            ? data
            : [];
        } else {
          rawCars = Array.isArray(data)
            ? data
            : (Array.isArray(data?.items) ? data.items : []);
        }

        const mappedCars: Car[] = rawCars.map((c: any) => {
          const id = c['@key'] || c.mobileAdId || c.id || c.listingId || '';
          const make = c?.vehicle?.make?.['@key'] || c?.vehicle?.make || c?.make || '';
          const model = c?.vehicle?.model?.['@key'] || c?.vehicle?.model || c?.model || '';
          const modelDescription = c?.vehicle?.['model-description']?.['@value'] || c?.modelDescription || '';

          const priceVal = (c?.price?.['consumer-price-amount']?.['@value']
            || c?.price?.consumerPrice?.amount
            || c?.price?.amount
            || c?.price)
            || '';
          const currency = (c?.price?.['@currency']
            || c?.price?.consumerPrice?.currency
            || c?.currency)
            || 'EUR';

          let image: string | null = null;
          if (mobileDeConnected) {
            if (Array.isArray(c?.images) && c.images.length > 0) {
              const i0 = c.images[0];
              image = i0?.xxxl || i0?.xxl || i0?.xl || i0?.l || i0?.m || i0?.s || null;
            } else if (c?.images?.image?.representation?.[0]?.['@url']) {
              image = c.images.image.representation[0]['@url'];
            }
          } else {
            // AutoScout24: try common fields
            const imgs = Array.isArray(c?.images) ? c.images : (Array.isArray(c?.media) ? c.media : []);
            if (imgs.length) {
              const i0 = imgs[0];
              image = i0?.url || i0?.href || i0?.source || null;
            }
          }

          const mileage = c?.vehicle?.specifics?.mileage?.['@value'] || c?.mileage?.value || c?.mileage || '';
          const firstRegistration = c?.vehicle?.specifics?.['first-registration']?.['@value'] || c?.firstRegistration || '';
          const fuel = c?.vehicle?.specifics?.fuel?.['@key'] || c?.fuel || '';
          const power = c?.vehicle?.specifics?.power?.['@value'] || c?.power || '';
          const gearbox = c?.vehicle?.specifics?.gearbox?.['@key'] || c?.gearbox || '';
          const url = c?.['detail-page']?.['@url'] || c?.detailPageUrl || c?.publicUrl || '#';

          const dealerCity = c?.seller?.address?.city?.['@value']
            || c?.seller?.address?.city
            || c?.seller?.geoData?.city
            || null;
          const dealerZip = c?.seller?.address?.['postal-code']?.['@value']
            || c?.seller?.address?.zipcode
            || c?.seller?.geoData?.zipcode
            || null;

          const latRaw = c?.seller?.location?.coordinates?.latitude?.['@value']
            || c?.seller?.location?.latitude?.['@value']
            || c?.seller?.location?.latitude
            || c?.seller?.geoData?.lat;
          const lonRaw = c?.seller?.location?.coordinates?.longitude?.['@value']
            || c?.seller?.location?.longitude?.['@value']
            || c?.seller?.location?.longitude
            || c?.seller?.geoData?.lon;
          const latNum = typeof latRaw === 'string' ? parseFloat(latRaw) : (typeof latRaw === 'number' ? latRaw : null);
          const lonNum = typeof lonRaw === 'string' ? parseFloat(lonRaw) : (typeof lonRaw === 'number' ? lonRaw : null);

          return {
            id: String(id),
            url,
            make,
            model,
            modelDescription,
            price: String(priceVal),
            currency,
            image,
            mileage: String(mileage),
            firstRegistration: String(firstRegistration),
            fuel: String(fuel),
            power: String(power),
            gearbox: String(gearbox),
            dealerCity,
            dealerZip,
            dealerLat: Number.isFinite(latNum as number) ? (latNum as number) : null,
            dealerLon: Number.isFinite(lonNum as number) ? (lonNum as number) : null,
          };
        });

        setCars(mappedCars);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, [mobileDeConnected, baseDomain, allowed]);

  const handleBoostPost = (car: Car) => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selected_car_for_boost', JSON.stringify(car));
      }
      router.push('/dashboard/inventory/boost');
    } catch (e) {
      alert('Failed to start boost flow.');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Car Inventory
        </h1>

        {!allowed && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-center max-w-2xl mx-auto">
            Boost ist im {tier ?? 'Basic'}-Paket gesperrt. Sie können Ihre Fahrzeuge ansehen.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl shadow-sm p-6 bg-gray-100 animate-pulse"
              >
                <div className="w-full h-48 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {!loading && cars.length === 0 && !error && (
          <div className="text-center text-gray-600">
            No cars found in your inventory.
          </div>
        )}

        {!loading && cars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {cars.map((car) => (
              <div
                key={car.id}
                className="rounded-xl shadow-lg p-6 bg-white transition-all duration-300 transform hover:scale-105"
              >
                {car.image ? (
                  <img
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                    {/* <FaCar className="text-gray-400 text-4xl" /> */}
                  </div>
                )}
                <h2 className="text-xl font-semibold text-gray-800">
                  {car.make} {car.model}
                </h2>
                <p className="text-sm text-gray-600">{car.modelDescription}</p>
                <p className="text-lg font-medium text-gray-700 mt-2">
                  {car.price} {car.currency}
                </p>
                {/* <p className="text-sm text-gray-600">Mileage: {car.mileage} km</p>
                <p className="text-sm text-gray-600">
                  First Registration: {car.firstRegistration}
                </p> */}
                {/* <p className="text-sm text-gray-600">Fuel: {car.fuel}</p>
                <p className="text-sm text-gray-600">Power: {car.power} kW</p>
                <p className="text-sm text-gray-600">Gearbox: {car.gearbox}</p> */}
                <div className="flex space-x-2 mt-4">
                  <a
                    href={car.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded text-center"
                  >
                    View Details
                  </a>
                  <button
                    onClick={() => allowed ? handleBoostPost(car) : undefined}
                    className={`text-white text-sm font-medium py-2 px-4 rounded ${allowed ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed flex items-center gap-2'}`}
                    title={allowed ? 'Boost diesen Beitrag' : 'Upgrade erforderlich: Boost nur ab Pro'}
                  >
                    {allowed ? 'Boost Post' : 'Boost (gesperrt)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
