import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  
  const [appointments, setAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [barberData, setBarberData] = useState({ name: '', specialty: '', experience: '' });
  
  // Modal State
  const [completeModal, setCompleteModal] = useState({ isOpen: false, appointmentId: null, hasCode: false, codeInput: '', error: '' });

  // Manage Slots State
  const [manageSlots, setManageSlots] = useState([]);
  const [manageBarberId, setManageBarberId] = useState('');
  const [manageDate, setManageDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (!userInfo.isAdmin) {
      navigate('/dashboard');
    } else {
      fetchAdminData();
    }
  }, [userInfo, navigate]);

  if (!userInfo || !userInfo.isAdmin) {
    return null; // Prevent UI from flashing before redirect
  }

  useEffect(() => {
    if (manageBarberId && manageDate) {
      fetchManageSlots();
    } else {
      setManageSlots([]);
    }
  }, [manageBarberId, manageDate]);

  const fetchManageSlots = async () => {
    try {
      const { data } = await api.get('/slots', {
        params: { barberId: manageBarberId, date: manageDate }
      });
      setManageSlots(data);
    } catch (error) {
      // Error handled silently
    }
  };

  const handleToggleSlot = async (time) => {
    try {
      await api.post('/slots/toggle-availability', {
        barberId: manageBarberId,
        date: manageDate,
        time
      });
      fetchManageSlots();
    } catch (error) {
      alert(error.response?.data?.message || 'Error toggling slot availability');
    }
  };

  const fetchAdminData = async () => {
    try {
      const [appRes, barbRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/barbers')
      ]);
      setAppointments(appRes.data);
      setBarbers(barbRes.data);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const createBarberSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/barbers', barberData);
      alert('Barber created successfully');
      setBarberData({ name: '', specialty: '', experience: '' });
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating barber');
    }
  };

  const handleCompleteClick = (id, hasCode) => {
    setCompleteModal({ isOpen: true, appointmentId: id, hasCode, codeInput: '', error: '' });
  };

  const confirmComplete = async () => {
    const { appointmentId, hasCode, codeInput } = completeModal;
    
    if (hasCode && (!codeInput || codeInput.length !== 4)) {
      setCompleteModal(prev => ({ ...prev, error: 'Please enter a valid 4-digit check-in code.' }));
      return;
    }

    try {
      await api.put(`/appointments/${appointmentId}/complete`, { appointmentCode: codeInput });
      fetchAdminData();
      setCompleteModal({ isOpen: false, appointmentId: null, hasCode: false, codeInput: '', error: '' });
    } catch (error) {
      setCompleteModal(prev => ({ ...prev, error: error.response?.data?.message || 'Failed to complete appointment' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 text-primary">Admin Control Panel</h2>
      
      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-3 mb-8 border-b border-white/10 pb-4 scrollbar-hide">
        {['bookings', 'add-barber', 'manage-schedule'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
               activeTab === tab 
                 ? 'bg-primary text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                 : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
             }`}
           >
             {tab === 'bookings' && 'All Bookings'}
             {tab === 'add-barber' && 'Add Professional'}
             {tab === 'manage-schedule' && 'Manage Schedule'}
           </button>
        ))}
      </div>
      
      <div className="w-full">
        
        {/* Add Barber Form */}
        {activeTab === 'add-barber' && (
          <div className="glass-card animate-fadeIn max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-6">Add New Barber</h3>
            <form onSubmit={createBarberSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input 
                  type="text" required className="glass-input" placeholder="John Doe"
                  value={barberData.name} onChange={e => setBarberData({...barberData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Specialty</label>
                <input 
                  type="text" required className="glass-input" placeholder="Skin Fades, Classic Cuts"
                  value={barberData.specialty} onChange={e => setBarberData({...barberData, specialty: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Experience (Years)</label>
                <input 
                  type="text" className="glass-input" placeholder="5 years"
                  value={barberData.experience} onChange={e => setBarberData({...barberData, experience: e.target.value})}
                />
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Create Barber</button>
            </form>
          </div>
        )}

        {/* All Bookings Panel */}
        {activeTab === 'bookings' && (
        <div className="glass-card animate-fadeIn">
          <h3 className="text-xl font-semibold mb-6">All Bookings</h3>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b border-white/10 text-gray-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Barber</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {appointments.map(app => (
                    <tr key={app._id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{format(new Date(app.slot?.date || new Date()), 'MMM dd, yyyy')}</div>
                        <div className="text-primary">{app.slot?.time || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white">{app.user?.name || 'Deleted User'}</div>
                        <div className="text-xs text-gray-500">{app.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{app.barber?.name || 'Unknown Barber'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          app.status === 'Booked' ? 'bg-primary/20 text-primary' : 
                          app.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' : 
                          'bg-green-500/20 text-green-500'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.status === 'Booked' && (
                          <button 
                            onClick={() => handleCompleteClick(app._id, !!app.appointmentCode)}
                            className="bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/50 px-3 py-1 rounded text-sm transition"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {appointments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">No appointments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

      {/* Schedule Manager Component */}
      {activeTab === 'manage-schedule' && (
      <div className="glass-card animate-fadeIn mt-8">
        <h3 className="text-xl font-semibold mb-6">Manage Schedule Availability</h3>
        <p className="text-sm text-gray-400 mb-6 -mt-4">Block out slots to prevent users from booking them.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Select Professional</label>
            <select 
              className="glass-input text-gray-300 cursor-pointer"
              value={manageBarberId}
              onChange={e => setManageBarberId(e.target.value)}
            >
              <option value="" className="text-black">Choose a barber...</option>
              {barbers.map(b => <option key={b._id} value={b._id} className="text-black">{b.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Date</label>
            <input 
              type="date" 
              className="glass-input text-gray-300"
              value={manageDate}
              onChange={e => setManageDate(e.target.value)}
            />
          </div>
        </div>

        {manageBarberId ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {manageSlots.map(slot => (
              <button
                 key={slot._id}
                 onClick={() => handleToggleSlot(slot.time)}
                 className={`py-3 px-2 rounded-lg border text-sm font-bold transition flex items-center justify-center ${
                   slot.isBooked 
                     ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' 
                     : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20'
                 }`}
                 title={slot.isBooked ? "Currently Unavailable (Click to free)" : "Currently Free (Click to block)"}
              >
                {slot.time}
              </button>
            ))}
            {manageSlots.length === 0 && <p className="col-span-full text-gray-500">No slots available to manage.</p>}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-gray-400">Please select a professional to view and manage their schedule.</p>
          </div>
        )}
      </div>
      )}

      </div>

      {completeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-sm w-full relative border border-white/20 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{completeModal.hasCode ? 'Enter Check-in Code' : 'Complete Legacy Appointment'}</h3>
            
            {completeModal.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-3 rounded mb-4 text-center">
                {completeModal.error}
              </div>
            )}
            
            {completeModal.hasCode ? (
              <>
                <p className="text-sm text-gray-300 mb-6">Ask the customer for their 4-digit check-in code to complete this appointment.</p>
                <input 
                  type="text" 
                  className={`glass-input w-full text-center text-3xl tracking-[0.5em] font-mono mb-6 py-4 ${completeModal.error ? 'border-red-500/50 focus:border-red-500' : ''}`} 
                  placeholder="XXXX"
                  maxLength={4}
                  value={completeModal.codeInput}
                  onChange={e => setCompleteModal({...completeModal, codeInput: e.target.value.replace(/\D/g, ''), error: ''})}
                  autoFocus
                />
              </>
            ) : (
              <p className="text-sm text-gray-300 mb-6">This is an older appointment without a generated code. Are you sure you want to mark it as completed?</p>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setCompleteModal({ isOpen: false, appointmentId: null, hasCode: false, codeInput: '', error: '' })}
                className="flex-1 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={confirmComplete}
                className="flex-1 bg-primary text-black font-semibold py-2 rounded-lg hover:brightness-110 transition shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
