import React from 'react';
import DashboardLayout from '../../components/DashboardLayout'

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
            <p className="text-green-500">
              <i className="fas fa-arrow-up mr-1"></i>12% this month
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">$12,345</p>
            <p className="text-green-500">
              <i className="fas fa-arrow-up mr-1"></i>8% this month
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            <p className="text-3xl font-bold text-blue-600">456</p>
            <p className="text-red-500">
              <i className="fas fa-arrow-down mr-1"></i>5% this month
            </p>
          </div>
        </div>

        {/* Charts or Other Content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">User Activity</h3>
          <div className="h-64">
            {/* Add Chart.js or other chart library here */}
            <p className="text-gray-500">Chart placeholder</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;