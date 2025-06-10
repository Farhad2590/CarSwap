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
    const [accountNumber, setAccountNumber] = useState('');
    const [activeTab, setActiveTab] = useState('withdrawals');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const {user} = useAuth();    

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

    useEffect(() => {
        fetchBalance();
        fetchWithdrawals();
        fetchPayments();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await axios.get(`http://localhost:9000/users/${user?.email}/balance`);
            setBalance(response.data.balance);
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
        setError('');
        setSuccess('');
        
        try {
            if (!accountNumber) {
                throw new Error('Please enter your account number');
            }

            await axios.post('http://localhost:9000/withdrawals', {
                ownerEmail: user?.email,
                amount: parseFloat(withdrawalAmount),
                paymentMethod,
                accountNumber
            });
            
            // Refresh data
            await fetchBalance();
            await fetchWithdrawals();
            
            // Reset form
            setWithdrawalAmount('');
            setAccountNumber('');
            setPaymentMethod('bank');
            setIsModalOpen(false);
            
            setSuccess('Withdrawal request submitted successfully!');
        } catch (error) {
            console.error('Error submitting withdrawal:', error);
            setError(error.response?.data?.error || error.message || 'Failed to submit withdrawal');
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
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Balance Card */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '24px', 
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    color: colors.text,
                    marginBottom: '16px'
                }}>
                    Your Balance
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: colors.primary,
                            marginBottom: '4px'
                        }}>
                            {formatCurrency(balance)}
                        </p>
                        <p style={{ 
                            color: colors.textLight,
                            fontSize: '0.875rem'
                        }}>
                            Available for withdrawal
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            backgroundColor: balance <= 0 ? colors.textLight : colors.primary,
                            color: 'white',
                            fontWeight: '500',
                            padding: '10px 24px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: balance <= 0 ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            ':hover': {
                                backgroundColor: balance <= 0 ? colors.textLight : colors.secondary
                            }
                        }}
                        disabled={balance <= 0}
                    >
                        Request Withdrawal
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ borderBottom: `1px solid ${colors.light}` }}>
                    <nav style={{ display: 'flex' }}>
                        <button
                            onClick={() => setActiveTab('withdrawals')}
                            style={{
                                padding: '16px 24px',
                                borderBottom: `2px solid ${activeTab === 'withdrawals' ? colors.primary : 'transparent'}`,
                                color: activeTab === 'withdrawals' ? colors.primary : colors.textLight,
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                ':hover': {
                                    color: activeTab === 'withdrawals' ? colors.primary : colors.text
                                }
                            }}
                        >
                            Withdrawal History
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            style={{
                                padding: '16px 24px',
                                borderBottom: `2px solid ${activeTab === 'payments' ? colors.primary : 'transparent'}`,
                                color: activeTab === 'payments' ? colors.primary : colors.textLight,
                                fontWeight: '500',
                                fontSize: '0.875rem',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                ':hover': {
                                    color: activeTab === 'payments' ? colors.primary : colors.text
                                }
                            }}
                        >
                            Payment History
                        </button>
                    </nav>
                </div>

                <div style={{ padding: '24px' }}>
                    {activeTab === 'withdrawals' ? (
                        <div>
                            <h3 style={{ 
                                fontSize: '1.125rem', 
                                fontWeight: '500', 
                                color: colors.text,
                                marginBottom: '16px'
                            }}>
                                Withdrawal Requests
                            </h3>
                            {withdrawals.length === 0 ? (
                                <p style={{ color: colors.textLight }}>No withdrawal requests found</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ 
                                        width: '100%', 
                                        borderCollapse: 'collapse',
                                        minWidth: '600px'
                                    }}>
                                        <thead style={{ backgroundColor: colors.light }}>
                                            <tr>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Date
                                                </th>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Amount
                                                </th>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Method
                                                </th>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Account
                                                </th>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {withdrawals.map((withdrawal) => (
                                                <tr key={withdrawal._id} style={{ 
                                                    borderBottom: `1px solid ${colors.light}`,
                                                    ':hover': {
                                                        backgroundColor: colors.light
                                                    }
                                                }}>
                                                    <td style={{ 
                                                        padding: '16px', 
                                                        fontSize: '0.875rem',
                                                        color: colors.text
                                                    }}>
                                                        {formatDate(withdrawal.createdAt)}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '16px', 
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        color: colors.text
                                                    }}>
                                                        {formatCurrency(withdrawal.amount)}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '16px', 
                                                        fontSize: '0.875rem',
                                                        color: colors.text,
                                                        textTransform: 'capitalize'
                                                    }}>
                                                        {withdrawal.paymentMethod}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '16px', 
                                                        fontSize: '0.875rem',
                                                        color: colors.text
                                                    }}>
                                                        {withdrawal.accountNumber || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ 
                                                            padding: '4px 8px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            borderRadius: '9999px',
                                                            backgroundColor: 
                                                                withdrawal.status === 'completed' ? '#d1fae5' :
                                                                withdrawal.status === 'pending' ? '#fef3c7' :
                                                                '#fee2e2',
                                                            color: 
                                                                withdrawal.status === 'completed' ? colors.success :
                                                                withdrawal.status === 'pending' ? colors.warning :
                                                                colors.danger
                                                        }}>
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
                            <h3 style={{ 
                                fontSize: '1.125rem', 
                                fontWeight: '500', 
                                color: colors.text,
                                marginBottom: '16px'
                            }}>
                                Payment History
                            </h3>
                            {payments.length === 0 ? (
                                <p style={{ color: colors.textLight }}>No payment history found</p>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ 
                                        width: '100%', 
                                        borderCollapse: 'collapse',
                                        minWidth: '600px'
                                    }}>
                                        <thead style={{ backgroundColor: colors.light }}>
                                            <tr>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Date
                                                </th>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Amount
                                                </th>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Purpose
                                                </th>
                                                <th style={{ 
                                                    padding: '12px 16px', 
                                                    textAlign: 'left', 
                                                    fontSize: '0.75rem',
                                                    fontWeight: '500',
                                                    color: colors.textLight,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments.map((payment) => (
                                                <tr key={payment._id} style={{ 
                                                    borderBottom: `1px solid ${colors.light}`,
                                                    ':hover': {
                                                        backgroundColor: colors.light
                                                    }
                                                }}>
                                                    <td style={{ 
                                                        padding: '16px', 
                                                        fontSize: '0.875rem',
                                                        color: colors.text
                                                    }}>
                                                        {formatDate(payment.createdAt)}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '16px', 
                                                        fontSize: '0.875rem',
                                                        fontWeight: '500',
                                                        color: colors.text
                                                    }}>
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td style={{ 
                                                        padding: '16px', 
                                                        fontSize: '0.875rem',
                                                        color: colors.text
                                                    }}>
                                                        {payment.purpose || 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ 
                                                            padding: '4px 8px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600',
                                                            borderRadius: '9999px',
                                                            backgroundColor: 
                                                                payment.status === 'completed' ? '#d1fae5' :
                                                                '#fef3c7',
                                                            color: 
                                                                payment.status === 'completed' ? colors.success :
                                                                colors.warning
                                                        }}>
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
                <div style={{
                    position: 'fixed',
                    zIndex: '50',
                    inset: '0',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            position: 'fixed',
                            inset: '0',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            transitionProperty: 'opacity',
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            transitionDuration: '150ms'
                        }}></div>
                        <div style={{
                            position: 'relative',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            width: '100%',
                            maxWidth: '32rem',
                            margin: '0 auto',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                            transform: 'translateY(0)',
                            transitionProperty: 'transform',
                            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            transitionDuration: '150ms'
                        }}>
                            <div style={{ padding: '24px' }}>
                                <h3 style={{ 
                                    fontSize: '1.125rem', 
                                    fontWeight: '500', 
                                    color: colors.text,
                                    marginBottom: '16px'
                                }}>
                                    Request Withdrawal
                                </h3>
                                
                                {error && (
                                    <div style={{ 
                                        color: colors.danger, 
                                        backgroundColor: '#fee2e2', 
                                        padding: '12px', 
                                        borderRadius: '4px',
                                        marginBottom: '16px',
                                        fontSize: '0.875rem'
                                    }}>
                                        {error}
                                    </div>
                                )}
                                
                                {success && (
                                    <div style={{ 
                                        color: colors.success, 
                                        backgroundColor: '#d1fae5', 
                                        padding: '12px', 
                                        borderRadius: '4px',
                                        marginBottom: '16px',
                                        fontSize: '0.875rem'
                                    }}>
                                        {success}
                                    </div>
                                )}

                                <form onSubmit={handleWithdrawalSubmit}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label htmlFor="amount" style={{ 
                                            display: 'block', 
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: colors.text,
                                            marginBottom: '4px'
                                        }}>
                                            Amount
                                        </label>
                                        <input
                                            type="number"
                                            id="amount"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                border: `1px solid ${colors.textLight}`,
                                                fontSize: '0.875rem',
                                                ':focus': {
                                                    outline: 'none',
                                                    borderColor: colors.primary,
                                                    boxShadow: `0 0 0 2px ${colors.light}`
                                                }
                                            }}
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                                            min="0"
                                            max={balance}
                                            step="0.01"
                                            required
                                        />
                                        <p style={{ 
                                            marginTop: '4px',
                                            fontSize: '0.75rem',
                                            color: colors.textLight
                                        }}>
                                            Available: {formatCurrency(balance)}
                                        </p>
                                    </div>
                                    
                                    <div style={{ marginBottom: '16px' }}>
                                        <label htmlFor="paymentMethod" style={{ 
                                            display: 'block', 
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: colors.text,
                                            marginBottom: '4px'
                                        }}>
                                            Payment Method
                                        </label>
                                        <select
                                            id="paymentMethod"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                border: `1px solid ${colors.textLight}`,
                                                fontSize: '0.875rem',
                                                backgroundColor: 'white',
                                                ':focus': {
                                                    outline: 'none',
                                                    borderColor: colors.primary,
                                                    boxShadow: `0 0 0 2px ${colors.light}`
                                                }
                                            }}
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
                                    
                                    <div style={{ marginBottom: '24px' }}>
                                        <label htmlFor="accountNumber" style={{ 
                                            display: 'block', 
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: colors.text,
                                            marginBottom: '4px'
                                        }}>
                                            {paymentMethod === 'bank' ? 'Bank Account Number' : 
                                             paymentMethod === 'bkash' ? 'bKash Number' :
                                             paymentMethod === 'nagad' ? 'Nagad Number' : 'Rocket Number'}
                                        </label>
                                        <input
                                            type="text"
                                            id="accountNumber"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                border: `1px solid ${colors.textLight}`,
                                                fontSize: '0.875rem',
                                                ':focus': {
                                                    outline: 'none',
                                                    borderColor: colors.primary,
                                                    boxShadow: `0 0 0 2px ${colors.light}`
                                                }
                                            }}
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            placeholder={
                                                paymentMethod === 'bank' ? 'Enter bank account number' : 
                                                paymentMethod === 'bkash' ? 'Enter bKash number' :
                                                paymentMethod === 'nagad' ? 'Enter Nagad number' : 'Enter Rocket number'
                                            }
                                            required
                                        />
                                    </div>

                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'flex-end',
                                        gap: '12px'
                                    }}>
                                        <button
                                            type="button"
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                border: `1px solid ${colors.textLight}`,
                                                backgroundColor: 'white',
                                                color: colors.text,
                                                fontWeight: '500',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                ':hover': {
                                                    backgroundColor: colors.light
                                                }
                                            }}
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setError('');
                                                setSuccess('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '4px',
                                                border: 'none',
                                                backgroundColor: colors.primary,
                                                color: 'white',
                                                fontWeight: '500',
                                                fontSize: '0.875rem',
                                                cursor: 'pointer',
                                                ':hover': {
                                                    backgroundColor: colors.secondary
                                                },
                                                ':disabled': {
                                                    backgroundColor: colors.textLight,
                                                    cursor: 'not-allowed'
                                                }
                                            }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Processing...' : 'Submit Request'}
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