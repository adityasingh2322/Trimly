import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
// Placeholder Pages
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen relative w-full overflow-hidden flex flex-col">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-background -z-10"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
        
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 max-w-7xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        <footer className="py-6 text-center text-gray-500 text-sm border-t border-white/5 mt-auto">
          &copy; {new Date().getFullYear()} Trimly. All rights reserved. Built with elegance.
        </footer>
      </div>
    </Router>
  );
}

export default App;
