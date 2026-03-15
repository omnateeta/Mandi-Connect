import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, Sprout, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import api from '../../services/api';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const total = useSelector((state) => state.cart.totalPrice);

  const handleRemoveItem = (id) => {
    dispatch(removeFromCart(id));
    toast.success('Item removed from cart');
  };

  const handleUpdateQuantity = (id, delta) => {
    // Find current quantity
    const item = cartItems.find(item => item.id === id);
    if (item) {
      dispatch(updateQuantity({ id, quantity: item.quantity + delta }));
    }
  };

  const handleCheckout = async () => {
    try {
      // Create order from cart items
      const orderItems = cartItems.map(item => ({
        cropId: item.cropId,
        quantity: item.quantity
      }));

      const response = await api.post('/orders', {
        items: orderItems,
        deliveryAddress: 'Delivery address will be collected at checkout',
        deliveryType: 'farmer_delivery'
      });

      toast.success('Order placed successfully!');
      dispatch(clearCart());
      navigate('/retailer/orders');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-24 h-24 bg-leaf-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-leaf-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some fresh produce to get started</p>
        <Link to="/retailer/marketplace" className="btn-primary inline-flex items-center gap-2">
          Browse Marketplace
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600 mt-1">{cartItems.length} items in cart</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/retailer/marketplace" className="text-leaf-600 font-medium hover:text-leaf-700">
            Continue Shopping
          </Link>
          {cartItems.length > 0 && (
            <button
              onClick={() => dispatch(clearCart())}
              className="text-red-600 font-medium hover:text-red-700 text-sm"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="card p-4 flex gap-4"
            >
              {/* Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sprout className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.farmName}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <p className="font-bold text-lg text-gray-800">₹{item.price * item.quantity}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-leaf-600">Free</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Platform Fee</span>
                <span>₹{Math.round(total * 0.02)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-gray-800">₹{Math.round(total * 1.02)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secure checkout powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
