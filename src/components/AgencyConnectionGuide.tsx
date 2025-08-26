'use client';

import { useState } from 'react';

interface AgencyConnectionGuideProps {
  onClose?: () => void;
}

export default function AgencyConnectionGuide({ onClose }: AgencyConnectionGuideProps) {
  const [step, setStep] = useState(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Agency Model Setup</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Connect Facebook</span>
              <span>Page Access</span>
              <span>Ready to Run Ads</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 1: Connect Your Facebook Page</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900">How Our Agency Model Works</h4>
                    <p className="text-blue-800 text-sm mt-1">
                      You connect your Facebook page to our platform. We'll run ads using our professional ad accounts, 
                      but the ads will appear as coming from your page. You pay us once for everything (ad spend + service fee).
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-700">When you connect Facebook, we'll get access to:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                  <li>Your Facebook pages (to run ads from them)</li>
                  <li>Post and content management permissions</li>
                  <li>Basic Instagram access (if connected)</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-amber-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-amber-900">Important Note</h4>
                    <p className="text-amber-800 text-sm mt-1">
                      We do NOT get access to your personal ad accounts or billing information. 
                      We only need access to your Facebook pages to run ads on your behalf.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                Continue to Step 2
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Grant Page Access</h3>
              <p className="text-gray-700">
                After connecting Facebook, you'll need to make sure our agency has the right permissions to run ads from your page.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">What Happens Next:</h4>
                <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
                  <li>Click "Connect Facebook" below</li>
                  <li>Sign in to your Facebook account</li>
                  <li>Select which pages to give us access to</li>
                  <li>Grant the requested permissions</li>
                  <li>Return to our platform</li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Ready to Run Ads!</h3>
              <div className="text-center">
                <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-medium text-gray-900 mb-2">All Set!</h4>
                <p className="text-gray-600 mb-4">
                  Once you've connected Facebook, you can create ad campaigns. We'll handle all the technical details 
                  and billing with Facebook while you focus on your business.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Agency Benefits:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ Professional ad account management</li>
                  <li>✓ One simple payment to us</li>
                  <li>✓ Expert campaign optimization</li>
                  <li>✓ Detailed performance reporting</li>
                  <li>✓ No need to manage Facebook billing</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Got It!
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
