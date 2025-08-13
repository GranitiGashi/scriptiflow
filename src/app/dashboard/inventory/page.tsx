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
  const [total, setTotal] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileDeConnected, setMobileDeConnected] = useState<boolean>(false);
  const router = useRouter();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'http://localhost:8080';

  useEffect(() => {
    async function checkMobileDeConnection() {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const res = await fetch(`${baseDomain}/api/connect-mobile-de`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-refresh-token': `${refreshToken}`,
          },
        });
        if (res.ok) {
          setMobileDeConnected(true);
        } else {
          setMobileDeConnected(false);
          setError('Please connect your mobile.de account to view inventory.');
          router.push('/connect');
        }
      } catch (err: any) {
        console.error('❌ Failed to check mobile.de connection', err);
        setError(err.message || 'Failed to check mobile.de connection.');
        router.push('/connect');
      }
    }

    async function fetchCars() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }
        const res = await fetch(`https://services.mobile.de/search-api/search`, {
          headers: {
            'Accept': 'application/json',
            'username': 'dlr_edonitgashi',
            'password': 'xz5rp4EHkeRd',
            'x-refresh-token': `${refreshToken}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.error.includes('No mobile.de credentials found')) {
            setError('Please connect your mobile.de account to view inventory.');
            router.push('/connect');
            return;
          }
          throw new Error(`Failed to fetch cars: ${errorData.error || res.statusText}`);
        }
        const data = await res.json();
        setCars(data.cars);
        setTotal(data.total);
        setPageSize(data.pageSize);
        setCurrentPage(data.currentPage);
        setMaxPages(data.maxPages);
      } catch (err: any) {
        console.error('❌ Failed to fetch cars', err);
        setError(err.message || 'Failed to load car inventory. Please try again.');
      } finally {
        setLoading(false);
      }
    }


        fetchCars();

  }, [currentPage, pageSize, baseDomain, router, mobileDeConnected]);

  const handleBoostPost = (car: Car) => {
    // Placeholder for creating ads on Facebook/Instagram
    alert(`Boost post for ${car.make} ${car.model} (ID: ${car.id}) not implemented yet.`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= maxPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Car Inventory</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl shadow-sm p-6 bg-gray-100 animate-pulse">
                <div className="w-full h-48 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center text-gray-600">No cars found in your inventory.</div>
        ) : (
          <>
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
                      <FaCar className="text-gray-400 text-4xl" />
                    </div>
                  )}
                  <h2 className="text-xl font-semibold text-gray-800">{car.make} {car.model}</h2>
                  <p className="text-sm text-gray-600">{car.modelDescription}</p>
                  <p className="text-lg font-medium text-gray-700 mt-2">
                    {car.price} {car.currency}
                  </p>
                  <p className="text-sm text-gray-600">Mileage: {car.mileage} km</p>
                  <p className="text-sm text-gray-600">First Registration: {car.firstRegistration}</p>
                  <p className="text-sm text-gray-600">Fuel: {car.fuel}</p>
                  <p className="text-sm text-gray-600">Power: {car.power} kW</p>
                  <p className="text-sm text-gray-600">Gearbox: {car.gearbox}</p>
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
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700 font-medium py-2">
                Page {currentPage} of {maxPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === maxPages}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}