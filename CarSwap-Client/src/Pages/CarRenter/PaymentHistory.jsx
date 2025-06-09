import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentHistory = () => {
  const [activeTab, setActiveTab] = useState('booking');
  const [bookingPayments, setBookingPayments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState({
    booking: true,
    history: true
  });
  const [error, setError] = useState({
    booking: null,
    history: null
  });

  const userEmail = 'farhadhossen9036@gmail.com';

  useEffect(() => {
    // Fetch booking payments
    axios.get(`http://localhost:9000/booking-payments/user/${userEmail}`)
      .then(response => {
        setBookingPayments(response.data.payments || []);
        setLoading(prev => ({ ...prev, booking: false }));
      })
      .catch(err => {
        setError(prev => ({ ...prev, booking: err.message }));
        setLoading(prev => ({ ...prev, booking: false }));
      });

    // Fetch payment history
    axios.get(`http://localhost:9000/payments/history/${userEmail}`)
      .then(response => {
        setPaymentHistory(response.data.payments || []);
        setLoading(prev => ({ ...prev, history: false }));
      })
      .catch(err => {
        setError(prev => ({ ...prev, history: err.message }));
        setLoading(prev => ({ ...prev, history: false }));
      });
  }, [userEmail]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="payment-history-container">
      <h2>Payment History</h2>
      
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'booking' ? 'active' : ''}`}
          onClick={() => setActiveTab('booking')}
        >
          Booking Payments
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'booking' ? (
          <div>
            {loading.booking ? (
              <p>Loading booking payments...</p>
            ) : error.booking ? (
              <p className="error">Error: {error.booking}</p>
            ) : bookingPayments.length === 0 ? (
              <p>No booking payments found</p>
            ) : (
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Type</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingPayments.map(payment => (
                    <tr key={payment._id}>
                      <td>{payment.bookingId}</td>
                      <td>৳{payment.amount}</td>
                      <td className={`status ${payment.status}`}>{payment.status}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{payment.type}</td>
                      <td>{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div>
            {loading.history ? (
              <p>Loading payment history...</p>
            ) : error.history ? (
              <p className="error">Error: {error.history}</p>
            ) : paymentHistory.length === 0 ? (
              <p>No payment history found</p>
            ) : (
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map(payment => (
                    <tr key={payment._id}>
                      <td>{payment.transactionId}</td>
                      <td>৳{payment.amount}</td>
                      <td>{payment.purpose}</td>
                      <td className={`status ${payment.status}`}>{payment.status}</td>
                      <td>{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .payment-history-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        h2 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        
        .tab-button {
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          border-bottom: 3px solid transparent;
        }
        
        .tab-button.active {
          color: #2c3e50;
          border-bottom: 3px solid #2c3e50;
          font-weight: bold;
        }
        
        .payment-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .payment-table th, .payment-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .payment-table th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        
        .payment-table tr:hover {
          background-color: #f5f5f5;
        }
        
        .status {
          text-transform: capitalize;
          font-weight: bold;
        }
        
        .status.completed, .status.success {
          color: #28a745;
        }
        
        .status.pending {
          color: #ffc107;
        }
        
        .status.failed {
          color: #dc3545;
        }
        
        .error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
};

export default PaymentHistory;