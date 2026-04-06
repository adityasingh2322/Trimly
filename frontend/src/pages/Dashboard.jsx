import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import { XCircle, Calendar, Clock, Scissors, ChevronRight, User, Edit } from 'lucide-react';

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', password: '' });
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  const { userInfo, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (userInfo.isAdmin) {
      navigate('/admin/dashboard');
    } else {
      fetchMyData();
    }
  }, [userInfo, navigate]);

  if (!userInfo || userInfo.isAdmin) {
    return null; // Prevent UI flash before redirect
  }

  const openEditModal = () => {
    setProfileData({ name: userInfo.name, email: userInfo.email, password: '' });
    setUpdateMsg({ type: '', text: '' });
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg({ type: '', text: '' });
    try {
      const { data } = await api.put('/auth/profile', profileData);
      login(data); // update context and localstorage
      setUpdateMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setIsEditModalOpen(false), 1500);
    } catch (error) {
      setUpdateMsg({ type: 'error', text: error.response?.data?.message || 'Error updating profile' });
    }
  };

  const fetchMyData = async () => {
    try {
      const { data } = await api.get('/appointments/myappointments');
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error.response?.data || error.message);
      // Error handled silently on UI
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/appointments/${id}/cancel`);
        fetchMyData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error cancellation');
      }
    }
  };

  const activeAppointments = appointments.filter(app => app.status === 'Booked');
  const pastAppointments = appointments.filter(app => app.status !== 'Booked');

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-white bg-clip-text text-transparent">
            Welcome back, {userInfo?.name?.split(' ')[0] || 'Guest'}
          </h2>
          <p className="text-gray-400">Manage your appointments and stay looking sharp.</p>
        </div>
        <Link to="/booking" className="btn-primary flex items-center gap-2 w-fit">
          <Calendar size={18} /> New Booking
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card flex flex-col items-center justify-center p-6 text-center group hover:border-primary/50 transition duration-300">
                <div className="bg-primary/10 text-primary p-3 rounded-full mb-3 group-hover:scale-110 transition duration-300">
                  <Calendar size={24} />
                </div>
                <h3 className="text-3xl font-bold">{activeAppointments.length}</h3>
                <p className="text-sm text-gray-400">Upcoming</p>
              </div>
              <div className="glass-card flex flex-col items-center justify-center p-6 text-center group hover:border-white/30 transition duration-300">
                <div className="bg-white/5 text-gray-300 p-3 rounded-full mb-3 group-hover:scale-110 transition duration-300">
                  <Scissors size={24} />
                </div>
                <h3 className="text-3xl font-bold">{pastAppointments.length}</h3>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>

            {/* User Profile Summary */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <User size={20} className="text-primary" /> Profile Info
                </h3>
                <button 
                  onClick={openEditModal}
                  className="text-gray-400 hover:text-primary transition p-2 bg-white/5 rounded-full hover:bg-white/10"
                  title="Edit Profile"
                >
                  <Edit size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-200">{userInfo?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-200">{userInfo?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Appointments List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Clock size={24} className="text-primary" /> Your Schedule
            </h3>
            
            {appointments.length === 0 ? (
              <div className="glass-card flex flex-col items-center justify-center py-16 text-center border-dashed border-white/20">
                <Calendar size={48} className="text-white/10 mb-4" />
                <h4 className="text-xl font-bold mb-2">No Appointments Found</h4>
                <p className="text-gray-400 mb-6 max-w-sm">
                  You haven't booked any grooming sessions yet. Secure your spot today!
                </p>
                <Link to="/booking" className="btn-primary">Book an Appointment</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map(app => (
                  <div key={app._id} className="glass-card relative overflow-hidden group hover:shadow-[0_0_20px_rgba(207,181,59,0.1)] transition duration-300">
                    <div className="absolute top-0 right-0 p-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        app.status === 'Booked' ? 'bg-primary/10 text-primary border-primary/20' : 
                        app.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-col h-full justify-between">
                      <div className="mb-4 pr-16">
                        <h4 className="text-lg font-bold text-white mb-1">
                          {format(new Date(app.slot?.date || new Date()), 'MMM do, yyyy')}
                        </h4>
                        <p className="text-primary font-medium flex items-center gap-1">
                          <Clock size={14} /> {app.slot?.time || 'N/A'}
                        </p>
                        {app.status === 'Booked' && app.appointmentCode && (
                          <div className="mt-3 bg-black/30 w-fit px-3 py-1 rounded border border-white/5">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Check-in Code</p>
                            <p className="font-mono text-xl text-white tracking-widest">{app.appointmentCode}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                        <div className="flex items-center gap-3">
                          {app.barber?.image ? (
                            <img src={app.barber.image} alt={app.barber.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-primary">
                              {app.barber?.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Professional</p>
                            <p className="font-semibold text-sm">{app.barber?.name || 'Unknown'}</p>
                          </div>
                        </div>

                        {app.status === 'Booked' && (
                          <button 
                            onClick={() => handleCancel(app._id)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-red-500/10 transition"
                            title="Cancel Appointment"
                          >
                            <XCircle size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full relative border border-white/20 shadow-2xl p-6">
            <h3 className="text-2xl font-bold mb-6 text-white text-center">Edit Profile</h3>
            
            {updateMsg.text && (
              <div className={`p-3 mb-6 rounded-lg border text-center text-sm ${updateMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {updateMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input 
                  type="text" required className="glass-input w-full" 
                  value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" required className="glass-input w-full" 
                  value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password <span className="opacity-50">(optional)</span></label>
                <input 
                  type="password" placeholder="Leave blank to keep current" className="glass-input w-full" 
                  value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 transition font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-black font-bold py-2 rounded-lg hover:brightness-110 transition shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
