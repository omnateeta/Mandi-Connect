import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, XCircle, Truck, Navigation, Edit } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../components/common/LanguageToggle';
import UpdateOrderModal from '../../components/farmer/UpdateOrderModal';

const statusConfig = {
  pending: { icon: Clock, color: 'text-harvest-600', bg: 'bg-harvest-100', label: 'Pending' },
  accepted: { icon: CheckCircle, color: 'text-leaf-600', bg: 'bg-leaf-100', label: 'Accepted' },
  preparing: { icon: Package, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Preparing' },
  shipped: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/farmers/orders');
      setOrders(response.data.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Download order details as CSV
  const downloadOrderCSV = (order) => {
    // Only allow download for paid/delivered orders
    if (order.paymentStatus !== 'paid' && order.status !== 'delivered') {
      alert('Payment must be completed before downloading invoice');
      return;
    }

    const headers = [
      'Order Number',
      'Date',
      'Retailer Name',
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
      order.retailerId?.businessName || 'N/A',
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

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
        <h1 className="text-2xl font-bold text-gray-800">{t('Orders')}</h1>
        <p className="text-gray-600 mt-1">{t('Manage and track your orders')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'accepted', 'preparing', 'shipped', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === status
                ? 'bg-leaf-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{t('No orders found')}</h3>
          <p className="text-gray-500">
            {filter === 'all' ? t('You have no orders yet') : t('No orders')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
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
                  {/* Order Info */}
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
                        {order.items.length} items • ₹{order.totalAmount}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'accepted')}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'rejected')}
                        className="btn-ghost text-sm py-2 px-4 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {order.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, 'preparing')}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      Start Preparing
                    </button>
                  )}

                  {['accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery'].includes(order.status) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowUpdateModal(true);
                        }}
                        className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Update
                      </button>
                      <button
                        onClick={() => navigate(`/farmer/orders/${order._id}/track`)}
                        className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Track
                      </button>
                    </div>
                  )}

                  {/* Track Order Button - Available for all orders after acceptance */}
                  {['accepted', 'preparing', 'ready_for_pickup', 'picked_up', 'in_transit', 'out_for_delivery'].includes(order.status) && (
                    <button
                      onClick={() => navigate(`/farmer/orders/${order._id}/track`)}
                      className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Track Order
                    </button>
                  )}

                  {/* Download Invoice Button - For Paid Orders */}
                  {(order.paymentStatus === 'paid' || order.status === 'delivered') && (
                    <button 
                      onClick={() => downloadOrderCSV(order)}
                      className="btn-secondary text-sm py-2 px-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 mt-2"
                      title="Download order invoice as CSV"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Invoice
                    </button>
                  )}
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
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Update Order Modal */}
      {showUpdateModal && selectedOrder && (
        <UpdateOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedOrder(null);
          }}
          onUpdate={fetchOrders}
        />
      )}
    </div>
  );
};

export default Orders;
