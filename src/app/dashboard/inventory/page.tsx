'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCar } from 'react-icons/fa';

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
}

export default function InventoryPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileDeConnected, setMobileDeConnected] = useState(false);
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  // Check if mobile.de account is connected
  useEffect(() => {
    async function checkConnection() {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!token) throw new Error('No access token found. Please log in.');

        const res = await fetch(`${baseDomain}/api/connect-mobile-de`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'x-refresh-token': refreshToken || '',
          },
        });

        if (!res.ok) throw new Error('Please connect your mobile.de account.');
        setMobileDeConnected(true);
      } catch (err: any) {
        setError(err.message);
        router.push('/connect');
      }
    }

    checkConnection();
  }, [baseDomain, router]);

  // Fetch cars after confirming connection
  useEffect(() => {
    if (!mobileDeConnected) return;

    async function fetchCars() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!token) throw new Error('No access token found. Please log in.');

        const res = await fetch(`${baseDomain}/api/get-user-cars`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'x-refresh-token': refreshToken || '',
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch cars.');
        }

        const data = await res.json();

        // Map API response to Car[]
        const rawCars = data['search-result']?.ads?.ad || [];
        const mappedCars: Car[] = rawCars.map((c: any) => ({
          id: c['@key'],
          make: c.vehicle.make['@key'],
          model: c.vehicle.model['@key'],
          modelDescription: c.vehicle['model-description']?.['@value'] || '',
          price: c.price['consumer-price-amount']?.['@value'] || '',
          currency: c.price['@currency'] || 'EUR',
          image:
            c.images?.image?.representation?.[0]?.['@url'] || null,
          mileage: c.vehicle.specifics.mileage?.['@value'] || '',
          firstRegistration: c.vehicle.specifics['first-registration']?.['@value'] || '',
          fuel: c.vehicle.specifics.fuel?.['@key'] || '',
          power: c.vehicle.specifics.power?.['@value'] || '',
          gearbox: c.vehicle.specifics.gearbox?.['@key'] || '',
          url: c['detail-page']?.['@url'] || '#',
        }));

        setCars(mappedCars);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, [mobileDeConnected, baseDomain]);

  const handleBoostPost = (car: Car) => {
    alert(`Boost post for ${car.make} ${car.model} not implemented yet.`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Car Inventory
        </h1>

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
                    onClick={() => handleBoostPost(car)}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded"
                  >
                    Boost Post
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
