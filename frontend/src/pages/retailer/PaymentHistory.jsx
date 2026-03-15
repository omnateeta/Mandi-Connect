import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, Download, Filter } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/payments/retailer/my-payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPayments(response.data.data.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Completed' },
      pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Failed' },
      processing: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Processing' },
    };
    
    const statusConfig = config[status] || config.pending;
    const StatusIcon = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
        <StatusIcon className="w-4 h-4" />
        {statusConfig.label}
      </span>
    );
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.paymentStatus === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment History</h1>
          <p className="text-gray-600 mt-1">View all your transactions</p>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['all', 'completed', 'pending', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {payments.filter(p => p.paymentStatus === 'completed').length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-600">
            {payments.filter(p => p.paymentStatus === 'pending').length}
          </p>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No payments found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You haven't made any payments yet" 
              : `No ${filter} payments`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Transaction ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Farmer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Method</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {payment.transactionId}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-800">{payment.farmerId?.farmName || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-800">₹{payment.amount.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600 capitalize">{payment.paymentMethod}</span>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(payment.paymentStatus)}
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                    {payment.paidAt && (
                      <p className="text-xs text-gray-400">
                        at {new Date(payment.paidAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
