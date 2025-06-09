import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../../hooks/useAuth';

const BalanceandWithdrawal = () => {
    const [balance, setBalance] = useState(0);
    const [withdrawals, setWithdrawals] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [activeTab, setActiveTab] = useState('withdrawals');
    const [isLoading, setIsLoading] = useState(false);
    const{user} = useAuth();    

    useEffect(() => {
        fetchBalance();
        fetchWithdrawals();
        fetchPayments();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/users/${user?.email}/balance`);
            setBalance(response.data.balance);
            // console.log(response);
            
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const fetchWithdrawals = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/withdrawals/owner/${user?.email}`);
            setWithdrawals(response.data);
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/subscription-payments/transactions/${user?.email}`);
            setPayments(response.data.transactions.subscriptions);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const handleWithdrawalSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            await axios.post('/withdrawals', {
                email : user?.email,
                amount: parseFloat(withdrawalAmount),
                paymentMethod
            });
            
            // Refresh data
            await fetchBalance();
            await fetchWithdrawals();
            
            // Reset form
            setWithdrawalAmount('');
            setPaymentMethod('bank');
            setIsModalOpen(false);
            
            alert('Withdrawal request submitted successfully!');
        } catch (error) {
            console.error('Error submitting withdrawal:', error);
            alert(error.response?.data?.error || 'Failed to submit withdrawal');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT'
        }).format(amount);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Balance Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Balance</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-3xl font-bold text-indigo-600">
                            {formatCurrency(balance)}
                        </p>
                        <p className="text-gray-600">Available for withdrawal</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                        disabled={balance <= 0}
                    >
                        Request Withdrawal
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('withdrawals')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'withdrawals' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Withdrawal History
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'payments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Payment History
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'withdrawals' ? (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Withdrawal Requests</h3>
                            {withdrawals.length === 0 ? (
                                <p className="text-gray-500">No withdrawal requests found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {withdrawals.map((withdrawal) => (
                                                <tr key={withdrawal._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(withdrawal.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(withdrawal.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {withdrawal.paymentMethod}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {withdrawal.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
                            {payments.length === 0 ? (
                                <p className="text-gray-500">No payment history found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {payments.map((payment) => (
                                                <tr key={payment._id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(payment.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {payment.purpose || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Withdrawal Modal */}
            {isModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Request Withdrawal</h3>
                                <form onSubmit={handleWithdrawalSubmit}>
                                    <div className="mb-4">
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            id="amount"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                                            min="0"
                                            max={balance}
                                            step="0.01"
                                            required
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Available: {formatCurrency(balance)}
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Method
                                        </label>
                                        <select
                                            id="paymentMethod"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            required
                                        >
                                            <option value="bank">Bank Transfer</option>
                                            <option value="bkash">bKash</option>
                                            <option value="nagad">Nagad</option>
                                            <option value="rocket">Rocket</option>
                                        </select>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Processing...' : 'Submit Request'}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceandWithdrawal;