import React from 'react';
import { CreditCard } from 'lucide-react';

const DashboardPayments: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h1>
      
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-medium text-gray-900 mb-2">No Payment Methods Added</h2>
        <p className="text-gray-600 mb-6">Add your first payment method to start making purchases</p>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add Payment Method
        </button>
      </div>
    </div>
  );
};

export default DashboardPayments;
