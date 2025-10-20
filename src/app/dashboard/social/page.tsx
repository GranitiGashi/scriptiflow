'use client';

import Link from 'next/link';

export default function SocialHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Social Hub</h1>
          <p className="text-base text-gray-600">Manage social workflows: pick cars, configure autopost, and monitor results.</p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/inventory" className="block">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inventory</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Select vehicles, preview social posts, choose images and captions.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/integrations/autopost" className="block">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Autopost</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                Detect new listings and automatically create social posts.
              </p>
            </div>
          </Link>

          <Link href="/dashboard/social-posts" className="block">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all h-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Posts</h3>
              <p className="text-base text-gray-600 leading-relaxed">
                See queued, posting, success, and failed posts with error reasons.
              </p>
            </div>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm inline-flex overflow-hidden">
          <Link 
            href="/dashboard/inventory" 
            className="px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            Inventory
          </Link>
          <Link 
            href="/dashboard/integrations/autopost" 
            className="px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            Autopost
          </Link>
          <Link 
            href="/dashboard/social-posts" 
            className="px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Posts
          </Link>
        </div>
      </div>
    </div>
  );
}


