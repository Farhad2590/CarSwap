import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, TrendingUp, Calendar, DollarSign, User, Hash, Clock } from 'lucide-react';
import axios from 'axios';
import useUserData from '../../hooks/useUserData';


const colors = {
  primary: "#0d786d",
  secondary: "#10a599",
  accent: "#076158",
  light: "#edf7f6",
  dark: "#065048",
  text: "#334155",
  textLight: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
};

const Transactions = () => {
  const { userData } = useUserData();
  const [bookingTransactions, setBookingTransactions] = useState([]);
  const [subscriptionTransactions, setSubscriptionTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('booking');
  const [error, setError] = useState(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch booking transactions
        const bookingResponse = await axios.get('http://localhost:9000/booking-payments');
        setBookingTransactions(bookingResponse.data.payments || []);
        
        // Fetch subscription transactions
        const subscriptionResponse = await axios.get('http://localhost:9000/subscription-payments/');
        setSubscriptionTransactions(subscriptionResponse.data.payments || []);
        
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      completed: colors.success,
      distributed: colors.primary,
      pending: colors.warning,
      failed: colors.danger,
    };

    return (
      <span
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{
          backgroundColor: `${statusColors[status]}20`,
          color: statusColors[status],
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    return method === 'cash' ? (
      <DollarSign size={16} style={{ color: colors.warning }} />
    ) : (
      <CreditCard size={16} style={{ color: colors.primary }} />
    );
  };

  const totalBookingAmount = bookingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalSubscriptionAmount = subscriptionTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: colors.light }}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: colors.light }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.primary, color: 'white' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.light }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
            Transactions Dashboard
          </h1>
          <p style={{ color: colors.textLight }}>
            Manage and monitor all booking and subscription payments
          </p>
        </div>

        {/* Admin Balance Card */}
        <div className="mb-8">
          <div 
            className="rounded-lg p-6 shadow-lg"
            style={{ backgroundColor: 'white', border: `1px solid ${colors.primary}20` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Wallet size={24} style={{ color: colors.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                    Admin Balance
                  </h3>
                  <p style={{ color: colors.textLight }}>
                    {userData?.email || 'carswap@gmail.com'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                  {formatCurrency(userData?.balance)}
                </p>
                <div className="flex items-center mt-1" style={{ color: colors.success }}>
                  <TrendingUp size={16} className="mr-1" />
                  <span className="text-sm font-medium">+12.5% this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.textLight }} className="text-sm">Total Booking Payments</p>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {formatCurrency(totalBookingAmount)}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.secondary}10` }}>
                <CreditCard size={24} style={{ color: colors.secondary }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.textLight }} className="text-sm">Total Verification Fees</p>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {formatCurrency(totalSubscriptionAmount)}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.success}10` }}>
                <User size={24} style={{ color: colors.success }} />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: colors.textLight }} className="text-sm">Total Transactions</p>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {bookingTransactions.length + subscriptionTransactions.length}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{ backgroundColor: `${colors.primary}10` }}>
                <Hash size={24} style={{ color: colors.primary }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('booking')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'booking' 
                ? 'text-white' 
                : 'bg-white hover:bg-gray-50'
            }`}
            style={{ 
              backgroundColor: activeTab === 'booking' ? colors.primary : 'white',
              color: activeTab === 'booking' ? 'white' : colors.text 
            }}
          >
            Booking Transactions ({bookingTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'subscription' 
                ? 'text-white' 
                : 'bg-white hover:bg-gray-50'
            }`}
            style={{ 
              backgroundColor: activeTab === 'subscription' ? colors.primary : 'white',
              color: activeTab === 'subscription' ? 'white' : colors.text 
            }}
          >
            Verification Payments ({subscriptionTransactions.length})
          </button>
        </div>

        {/* Booking Transactions Table */}
        {activeTab === 'booking' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: `${colors.primary}20` }}>
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                Booking Transactions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookingTransactions.length > 0 ? (
                    bookingTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium" style={{ color: colors.text }}>
                            {transaction.bookingId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: colors.textLight }}>
                          {transaction.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold" style={{ color: colors.success }}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: transaction.type === 'advance' ? `${colors.primary}20` : `${colors.warning}20`,
                              color: transaction.type === 'advance' ? colors.primary : colors.warning,
                            }}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                            <span className="ml-2" style={{ color: colors.text }}>
                              {transaction.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center" style={{ color: colors.textLight }}>
                            <Clock size={14} className="mr-1" />
                            <span className="text-sm">{formatDate(transaction.createdAt)}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center" style={{ color: colors.textLight }}>
                        No booking transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscription Transactions Table */}
        {activeTab === 'subscription' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: `${colors.primary}20` }}>
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                Verification Payments
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.textLight }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {subscriptionTransactions.length > 0 ? (
                    subscriptionTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm" style={{ color: colors.text }}>
                            {transaction.transactionId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: colors.textLight }}>
                          {transaction.userEmail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold" style={{ color: colors.success }}>
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${colors.accent}20`,
                              color: colors.accent,
                            }}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                            <span className="ml-2" style={{ color: colors.text }}>
                              {transaction.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center" style={{ color: colors.textLight }}>
                            <Clock size={14} className="mr-1" />
                            <span className="text-sm">{formatDate(transaction.createdAt)}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center" style={{ color: colors.textLight }}>
                        No verification payments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;