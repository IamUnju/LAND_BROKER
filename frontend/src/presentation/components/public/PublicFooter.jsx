import { Link } from "react-router-dom";

export default function PublicFooter({ onSelectQuickFilter }) {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
        <div>
          <p className="text-lg font-bold text-gray-900">BrokerSaaS</p>
          <p className="mt-2 text-sm text-gray-600">Smart property discovery for renters, buyers, brokers, and owners.</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">Marketplace</p>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <Link to="/marketplace" className="block hover:text-gray-900">Browse Listings</Link>
            <Link to="/register" className="block hover:text-gray-900">Create Account</Link>
            <Link to="/login" className="block hover:text-gray-900">Log In</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">Popular Categories</p>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            {onSelectQuickFilter ? (
              <>
                <button onClick={() => onSelectQuickFilter({ bedrooms: 1 })} className="block hover:text-gray-900">1 Bedroom</button>
                <button onClick={() => onSelectQuickFilter({ bedrooms: 2 })} className="block hover:text-gray-900">2 Bedrooms</button>
                <button onClick={() => onSelectQuickFilter({ is_furnished: true })} className="block hover:text-gray-900">Furnished</button>
              </>
            ) : (
              <>
                <Link to="/marketplace" className="block hover:text-gray-900">1 Bedroom</Link>
                <Link to="/marketplace" className="block hover:text-gray-900">2 Bedrooms</Link>
                <Link to="/marketplace" className="block hover:text-gray-900">Furnished</Link>
              </>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">Support</p>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p>help@brokersaas.com</p>
            <p>+255 74 345 2348</p>
            <p>Mon - Fri, 8:00 AM - 6:00 PM</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-gray-500 sm:flex-row lg:px-6">
          <p>© {new Date().getFullYear()} BrokerSaaS. All rights reserved.</p>
          <p>Built for modern property management.</p>
        </div>
      </div>
    </footer>
  );
}
