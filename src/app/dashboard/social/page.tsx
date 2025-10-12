'use client';

import Link from 'next/link';

export default function SocialHubPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Social Hub</h1>
        <p className="text-sm text-gray-600 mb-6">Manage social workflows: pick cars, configure autopost, and monitor results.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/inventory" className="block rounded-lg border bg-white hover:shadow-md transition">
            <div className="p-4">
              <div className="text-lg font-semibold">Inventory</div>
              <div className="text-sm text-gray-600 mt-1">Select vehicles, preview social posts, choose images and captions.</div>
            </div>
          </Link>

          <Link href="/dashboard/integrations/autopost" className="block rounded-lg border bg-white hover:shadow-md transition">
            <div className="p-4">
              <div className="text-lg font-semibold">Autopost</div>
              <div className="text-sm text-gray-600 mt-1">Detect new listings and automatically create social posts.</div>
            </div>
          </Link>

          <Link href="/dashboard/social-posts" className="block rounded-lg border bg-white hover:shadow-md transition">
            <div className="p-4">
              <div className="text-lg font-semibold">Posts</div>
              <div className="text-sm text-gray-600 mt-1">See queued, posting, success, and failed posts with error reasons.</div>
            </div>
          </Link>
        </div>

        <div className="mt-6">
          <div className="inline-flex bg-white rounded-lg border overflow-hidden">
            <Link href="/dashboard/inventory" className="px-4 py-2 text-sm hover:bg-gray-100">Inventory</Link>
            <Link href="/dashboard/integrations/autopost" className="px-4 py-2 text-sm hover:bg-gray-100">Autopost</Link>
            <Link href="/dashboard/social-posts" className="px-4 py-2 text-sm hover:bg-gray-100">Posts</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


