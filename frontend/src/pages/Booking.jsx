import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { format, addDays } from 'date-fns';

const Booking = () => {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, slot: null });
  
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  const nextDays = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(new Date(), i);
    return format(d, 'yyyy-MM-dd');
  });

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    fetchBarbers();
  }, [userInfo, navigate]);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchSlots();
    } else {
      setSlots([]);
    }
  }, [selectedBarber, selectedDate]);

  const fetchBarbers = async () => {
    try {
      const { data } = await api.get('/barbers');
      setBarbers(data);
    } catch (error) {
      // Error handled silently
    }
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/slots?barberId=${selectedBarber}&date=${selectedDate}`);
      setSlots(data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookClick = (slot) => {
    setConfirmModal({ show: true, slot });
  };

  const executePayment = async (slot) => {
    setConfirmModal({ show: false, slot: null });
    setMsg({ type: '', text: '' });
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setMsg({ type: 'error', text: 'Razorpay SDK failed to load. Please check your connection.' });
      return;
    }

    try {
      // 1. Generate Order ID from Backend
      const { data: order } = await api.post('/payment/order');

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: "Trimly Bookings",
        description: `Booking Token for ${format(new Date(selectedDate), 'MMM do')} at ${slot.time}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify signature
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // 4. Create appointment
            await api.post('/appointments', { 
              slotId: slot._id,
              barberId: selectedBarber,
              date: selectedDate,
              time: slot.time
            });
            
            setMsg({ type: 'success', text: 'Payment successful & Appointment booked!' });
            fetchSlots();
          } catch (verifyError) {
            setMsg({ type: 'error', text: verifyError.response?.data?.message || 'Payment verification failed' });
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },
        theme: {
          color: "#D4AF37" // Trimly Gold
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              }
            },
            sequence: ["block.upi"],
            preferences: {
              show_default_blocks: true
            }
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        setMsg({ type: 'error', text: response.error.description || 'Payment Failed' });
      });

      paymentObject.open();

    } catch (error) {
      setMsg({ type: 'error', text: error.response?.data?.message || 'Failed to initialize payment instance' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8">Book an Appointment</h2>

      {msg.text && (
        <div className={`p-4 mb-6 rounded-lg border ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="glass-card">
          <label className="block text-gray-400 text-sm font-medium mb-2">Select Barber</label>
          <select 
            className="glass-input cursor-pointer text-gray-300"
            value={selectedBarber}
            onChange={(e) => setSelectedBarber(e.target.value)}
          >
            <option value="" className="text-black">Choose a Professional...</option>
            {barbers.map(b => (
              <option key={b._id} value={b._id} className="text-black">{b.name} - {b.specialty}</option>
            ))}
          </select>
        </div>

        <div className="glass-card">
          <label className="block text-gray-400 text-sm font-medium mb-2">Select Date</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {nextDays.map(dateStr => (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg border transition ${selectedDate === dateStr ? 'bg-primary text-black border-primary font-medium shadow-[0_0_10px_rgba(207,181,59,0.3)]' : 'border-white/10 hover:border-white/30 text-gray-300'}`}
              >
                <div className="text-xs opacity-80">{format(new Date(dateStr), 'EEE')}</div>
                <div className="text-lg">{format(new Date(dateStr), 'dd')}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="text-xl font-semibold mb-6">Available Time Slots</h3>
        
        {!selectedBarber ? (
          <p className="text-gray-500 text-center py-8">Please select a barber to view their availability.</p>
        ) : loading ? (
          <p className="text-gray-400 text-center py-8">Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No slots available for this date.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {slots.map(slot => (
              <button
                key={slot._id}
                disabled={slot.isBooked}
                onClick={() => handleBookClick(slot)}
                className={`py-3 rounded-lg border font-medium transition ${
                  slot.isBooked 
                    ? 'bg-red-950/20 border-red-900/30 text-red-900/50 cursor-not-allowed' 
                    : 'bg-white/5 border-white/10 hover:border-primary text-white hover:text-primary hover:shadow-[0_0_15px_rgba(207,181,59,0.2)]'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full relative">
            <h3 className="text-xl font-bold mb-4">Confirm Appointment</h3>
            <p className="text-gray-300 mb-6">
              You are about to secure an appointment for <strong>{format(new Date(selectedDate), 'MMM do, yyyy')}</strong> at <strong>{confirmModal.slot?.time}</strong>.
              <br /><br />
              A token amount of <strong>₹50</strong> is required to lock in this slot.
            </p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setConfirmModal({ show: false, slot: null })}
                className="px-6 py-2 rounded-lg border border-white/20 hover:border-white/40 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => executePayment(confirmModal.slot)}
                className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(207,181,59,0.4)] transition"
              >
                Pay ₹50 & Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
