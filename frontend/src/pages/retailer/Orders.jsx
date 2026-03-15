import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, Star, Navigation, CreditCard, QrCode } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../components/common/LanguageToggle';

const statusConfig = {
  pending: { icon: Clock, color: 'text-harvest-600', bg: 'bg-harvest-100', label: 'Pending' },
  accepted: { icon: CheckCircle, color: 'text-leaf-600', bg: 'bg-leaf-100', label: 'Accepted' },
  preparing: { icon: Package, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Preparing' },
  shipped: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
};

const paymentStatusConfig = {
  paid: { color: 'text-green-600', bg: 'bg-green-100', label: 'Paid' },
  pending: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' },
  failed: { color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/retailers/orders');
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download order details as CSV
  const downloadOrderCSV = (order) => {
    // Only allow download for paid/delivered orders
    if (order.paymentStatus !== 'paid' && order.status !== 'delivered') {
      alert('Please complete payment before downloading invoice');
      return;
    }

    const headers = [
      'Order Number',
      'Date',
      'Farmer Name',
      'Crop Name',
      'Quantity (kg)',
      'Price per Kg',
      'Total Amount',
      'Payment Status',
      'Order Status',
      'Transaction ID'
    ];

    const rows = order.items.map(item => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString(),
      order.farmerId?.farmName || 'N/A',
      item.cropId?.name || 'N/A',
      item.quantity,
      `₹${item.pricePerKg}`,
      `₹${item.total}`,
      order.paymentStatus,
      order.status,
      order.transactionId || 'N/A'
    ]);

    // Add summary row
    rows.push([
      '',
      '',
      '',
      'TOTAL',
      order.items.reduce((sum, item) => sum + item.quantity, 0),
      '',
      `₹${order.totalAmount}`,
      '',
      '',
      ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Order_${order.orderNumber}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-600 mt-1">Track and manage your orders</p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-500">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <StatusIcon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-800">{order.orderNumber}</h3>
                        <span className={`badge ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        From {order.farmerId?.farmName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">₹{order.totalAmount}</p>
                    <p className="text-sm text-gray-500">{order.items.length} items</p>
                    {/* Payment Status Badge */}
                    <div className="mt-2">
                      {(() => {
                        const paymentConfig = paymentStatusConfig[order.paymentStatus || 'pending'];
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paymentConfig.bg} ${paymentConfig.color}`}>
                            <CreditCard className="w-3 h-3" />
                            {paymentConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}kg × ₹{item.pricePerKg}/kg
                        </span>
                        <span className="font-medium text-gray-800">₹{item.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Track Order Button */}
                {['accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery'].includes(order.status) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => navigate(`/retailer/orders/${order._id}/track`)}
                      className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Track Order
                    </button>
                  </div>
                )}

                {/* Pay Now Button for Pending Payments */}
                {(order.paymentStatus === 'pending' || !order.paymentStatus) && order.status !== 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button 
                      onClick={() => navigate(`/retailer/payment/${order._id}`)}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <QrCode className="w-4 h-4" />
                      Pay via QR Code
                    </button>
                  </div>
                )}

                {/* Rate Button for Delivered Orders */}
                {order.status === 'delivered' && !order.ratings?.retailer && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Rate this order
                    </button>
                  </div>
                )}

                {/* Download Invoice Button - For Paid Orders */}
                {(order.paymentStatus === 'paid' || order.status === 'delivered') && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <button 
                      onClick={() => downloadOrderCSV(order)}
                      className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      title="Download order invoice as CSV"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Invoice
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
