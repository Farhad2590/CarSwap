import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WithdrawalRequests = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:9000/withdrawals/pending');
      // Filter to only show pending withdrawals (additional safeguard)
      const pendingWithdrawals = response.data.filter(w => w.status === 'pending');
      setWithdrawals(pendingWithdrawals);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch withdrawal requests');
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    try {
      await axios.put(`http://localhost:9000/withdrawals/${withdrawalId}/approve`, { adminNotes });
      setSuccess('Withdrawal approved successfully');
      setAdminNotes('');
      setTimeout(() => fetchWithdrawals(), 500); // Small delay before refresh
    } catch (err) {
      if (err.response?.data?.error === "Withdrawal is not in pending state") {
        setError('This withdrawal is no longer pending. Please refresh the page.');
        fetchWithdrawals(); // Refresh the list
      } else {
        setError(err.response?.data?.error || 'Failed to approve withdrawal');
      }
    }
  };

  const handleReject = async (withdrawalId) => {
    try {
      await axios.put(`http://localhost:9000/withdrawals/${withdrawalId}/reject`, { adminNotes });
      setSuccess('Withdrawal rejected successfully');
      setAdminNotes('');
      setTimeout(() => fetchWithdrawals(), 500); // Small delay before refresh
    } catch (err) {
      if (err.response?.data?.error === "Withdrawal is not in pending state") {
        setError('This withdrawal is no longer pending. Please refresh the page.');
        fetchWithdrawals(); // Refresh the list
      } else {
        setError(err.response?.data?.error || 'Failed to reject withdrawal');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: colors.primary, marginBottom: '20px' }}>Withdrawal Requests</h2>
      
      {error && (
        <div style={{ 
          color: colors.danger, 
          backgroundColor: '#fee2e2', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: colors.success, 
          backgroundColor: '#d1fae5', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p>No pending withdrawal requests</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ backgroundColor: colors.primary, color: 'white' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Method</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Account</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px 15px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} style={{ 
                  borderBottom: `1px solid ${colors.light}`,
                  ':hover': { backgroundColor: colors.light }
                }}>
                  <td style={{ padding: '12px 15px' }}>{withdrawal.ownerEmail}</td>
                  <td style={{ padding: '12px 15px' }}>${withdrawal.amount.toFixed(2)}</td>
                  <td style={{ padding: '12px 15px', textTransform: 'capitalize' }}>
                    {withdrawal.paymentMethod}
                  </td>
                  <td style={{ padding: '12px 15px' }}>{withdrawal.accountNumber}</td>
                  <td style={{ padding: '12px 15px' }}>
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 15px', textTransform: 'capitalize' }}>
                    {withdrawal.status}
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleApprove(withdrawal._id)}
                        style={{
                          backgroundColor: colors.success,
                          color: 'white',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(withdrawal._id)}
                        style={{
                          backgroundColor: colors.danger,
                          color: 'white',
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              color: colors.text,
              fontWeight: '500'
            }}>
              Admin Notes (for all actions)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: `1px solid ${colors.textLight}`,
                fontSize: '16px',
                minHeight: '80px'
              }}
              placeholder="Enter notes for the withdrawal action"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;