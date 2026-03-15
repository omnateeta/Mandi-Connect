import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, AlertCircle, Smartphone, Download, Share2, Copy, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const QRPayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQR();
  }, [orderId]);

  const generateQR = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/payments/generate-qr/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('QR Response:', response.data);
      
      if (response.data.success) {
        console.log('Setting QR Data:', response.data.data);
        setQrData(response.data.data);
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyUPI = () => {
    const upiText = `${qrData?.payment?.upiDetails?.vpa || qrData?.upiDetails?.vpa}`;
    navigator.clipboard.writeText(upiText);
    setCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/payments/verify/${qrData.payment.id}`, {
        status: 'completed',
        referenceId: `MANUAL_${Date.now()}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPaymentVerified(true);
        toast.success('Payment verified successfully!');
        
        setTimeout(() => {
          navigate('/retailer/orders');
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (paymentVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment of ₹{qrData?.payment.amount} has been verified
          </p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800">
              Transaction ID: <span className="font-mono font-bold">{qrData?.payment.transactionId}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/retailer/orders')}
            className="btn-primary w-full bg-gradient-to-r from-green-600 to-emerald-600"
          >
            View Orders
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Scan & Pay</h1>
          <p className="text-gray-600">Complete your payment securely using UPI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl p-6"
          >
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Scan QR Code</h3>
              <p className="text-sm text-gray-600">Use any UPI app to scan</p>
            </div>

            {/* QR Code Image */}
            <div className="bg-white p-4 rounded-2xl border-2 border-green-200 mb-4">
              <img 
                src={qrData?.qrCode} 
                alt="Payment QR Code" 
                className="w-full h-auto"
              />
            </div>

            {/* Amount Display */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-white text-center mb-4">
              <p className="text-sm opacity-90 mb-1">Pay Amount</p>
              <p className="text-3xl font-bold">₹{qrData?.payment.amount?.toLocaleString('en-IN')}</p>
            </div>

            {/* UPI ID Copy */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-600 mb-2">Or pay manually using UPI ID:</p>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono bg-white px-3 py-2 rounded-lg flex-1 truncate">
                  {qrData?.payment?.upiDetails?.vpa || qrData?.upiDetails?.vpa}
                </code>
                <button
                  onClick={copyUPI}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={verifyPayment}
              className="btn-primary w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              I Have Made The Payment
            </button>
          </motion.div>

          {/* Payment Details Section */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-4"
          >
            {/* Farmer Details */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                Payment Details
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Farmer Name</p>
                  <p className="font-semibold text-gray-800">{qrData?.payment?.upiDetails?.name || qrData?.upiDetails?.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mobile Number</p>
                  <p className="font-semibold text-gray-800">{qrData?.payment?.upiDetails?.mobile || qrData?.upiDetails?.mobile}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Bank</p>
                  <p className="font-semibold text-gray-800">{qrData?.payment?.upiDetails?.bank || qrData?.upiDetails?.bank}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-mono text-xs text-gray-700 break-all">{qrData?.payment?.transactionId || qrData?.transactionId}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                How to Pay
              </h3>
              
              <ol className="space-y-3">
                {qrData?.instructions?.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>

              {/* Supported Apps */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-600 mb-2">Supported UPI Apps:</p>
                <div className="flex flex-wrap gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay'].map((app) => (
                    <span key={app} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-semibold mb-1">Security Notice</p>
                <p className="text-xs text-amber-700">
                  Never share your UPI PIN with anyone. Farmsetu will never ask for your UPI PIN.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;
