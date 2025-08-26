'use client';

import { useState } from 'react';

interface AgencyPaymentFormProps {
  adBudget: number;
  setAdBudget: (budget: number) => void;
  serviceFee: number;
  setServiceFee: (fee: number) => void;
  campaignDuration: number;
  setCampaignDuration: (days: number) => void;
}

export default function AgencyPaymentForm({
  adBudget,
  setAdBudget,
  serviceFee,
  setServiceFee,
  campaignDuration,
  setCampaignDuration
}: AgencyPaymentFormProps) {
  const dailyBudget = adBudget / campaignDuration;
  const totalCost = adBudget + serviceFee;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Agency Pricing</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Ad Budget (€)
          </label>
          <input
            type="number"
            value={adBudget}
            onChange={(e) => setAdBudget(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="10"
          />
          <p className="text-xs text-gray-500 mt-1">
            Total amount that will be spent on Facebook ads
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Duration (days)
          </label>
          <select
            value={campaignDuration}
            onChange={(e) => setCampaignDuration(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Fee (€)
          </label>
          <input
            type="number"
            value={serviceFee}
            onChange={(e) => setServiceFee(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="5"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your fee for managing the ad campaign
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-blue-900">Campaign Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Daily Budget:</span>
              <span className="font-medium ml-2">€{dailyBudget.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-blue-700">Duration:</span>
              <span className="font-medium ml-2">{campaignDuration} days</span>
            </div>
            <div>
              <span className="text-blue-700">Ad Spend:</span>
              <span className="font-medium ml-2">€{adBudget.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-blue-700">Service Fee:</span>
              <span className="font-medium ml-2">€{serviceFee.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-blue-200 pt-2 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-blue-900">Total Cost:</span>
              <span className="font-bold text-xl text-blue-900">€{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h5 className="font-medium text-amber-800">Agency Model</h5>
              <p className="text-sm text-amber-700 mt-1">
                You will pay Facebook directly for the ad spend (€{adBudget.toFixed(2)}) and keep the service fee (€{serviceFee.toFixed(2)}). 
                The client pays you the total amount upfront.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
