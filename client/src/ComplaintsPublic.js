import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import './App.css'; // global styles
import { Search, Send, Clock, User, Mail, Tag, AlignLeft } from 'lucide-react';

function ComplaintsPublic() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', description: '' });
  const [trackId, setTrackId] = useState('');
  const [trackedStatus, setTrackedStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [latestTrackingId, setLatestTrackingId] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLatestTrackingId('');
    try {
      const res = await axios.post('http://localhost:5000/api/complaints', formData);
      toast.success(`Complaint submitted! Your Tracking ID: ${res.data.trackingId}`);
      setLatestTrackingId(res.data.trackingId);
      setFormData({ name: '', email: '', subject: '', description: '' });
    } catch (err) {
      toast.error('Failed to submit complaint. Try again later.');
    }
    setIsSubmitting(false);
  };

  const handleTrackStatus = async (e) => {
    e.preventDefault();
    if (!trackId) return toast.warn('Please enter a tracking ID!');
    
    setIsTracking(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/complaints/track/${trackId}`);
      setTrackedStatus(res.data);
      toast.success('Found your complaint!');
    } catch (err) {
      setTrackedStatus(null);
      toast.error('Complaint not found! Check your tracking ID.');
    }
    setIsTracking(false);
  };

  return (
    <div className="home-container">
      <Navbar />
      <div className="main-content" style={{ padding: '60px 20px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: '800', background: 'linear-gradient(90deg, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Support & Complaints
          </h1>
          <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '10px' }}>
            We're here to help! Submit your issue or track an existing one below.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '1100px', width: '100%' }}>
          {/* LEFT: SUBMIT COMPLAINT FORM */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ flex: '1 1 500px', background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          >
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}><Send size={24} color="#3b82f6"/> Submit a Complaint</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', top: '12px', left: '15px', color: '#888' }}/>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', top: '12px', left: '15px', color: '#888' }}/>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <Tag size={18} style={{ position: 'absolute', top: '12px', left: '15px', color: '#888' }}/>
                <input required type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Subject of the issue" style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: '#fff', fontSize: '1rem', outline: 'none' }} />
              </div>
              <div style={{ position: 'relative' }}>
                <AlignLeft size={18} style={{ position: 'absolute', top: '14px', left: '15px', color: '#888' }}/>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the issue in detail..." rows="5" style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: '#fff', fontSize: '1rem', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(90deg, #3b82f6, #9333ea)', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'box-shadow 0.3s', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </motion.button>

              <AnimatePresence>
                {latestTrackingId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '10px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', textAlign: 'center' }}
                  >
                    <strong>Success!</strong> Your Tracking ID is: 
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', letterSpacing: '2px', margin: '5px 0' }}>{latestTrackingId}</div>
                    <span style={{ fontSize: '0.85rem' }}>Please copy this ID. You can use it in the tracker on the right.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* RIGHT: TRACK COMPLAINT */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '30px' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}><Search size={24} color="#9333ea"/> Track Your Ticket</h2>
              <form onSubmit={handleTrackStatus} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input required type="text" value={trackId} onChange={(e) => setTrackId(e.target.value)} placeholder="Enter Tracking ID (e.g. LKS-X7H9A)" style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', color: '#fff', fontSize: '1rem', outline: 'none' }} />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isTracking}
                  style={{ background: 'transparent', border: '2px solid #9333ea', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  {isTracking ? 'Searching...' : 'Check Status'}
                </motion.button>
              </form>
              
              {/* DISPLAY TRACKED STATUS */}
              {trackedStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '30px', background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${trackedStatus.status === 'Resolved' ? '#10b981' : trackedStatus.status === 'In Progress' ? '#f59e0b' : '#3b82f6'}` }}
                >
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{trackedStatus.subject}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#ccc', fontStyle: 'italic' }}>Submitted by {trackedStatus.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={18} color="#aaa" />
                    <strong style={{ color: '#fff' }}>Status:</strong> 
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold',
                      background: trackedStatus.status === 'Resolved' ? 'rgba(16, 185, 129, 0.2)' : trackedStatus.status === 'In Progress' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: trackedStatus.status === 'Resolved' ? '#10b981' : trackedStatus.status === 'In Progress' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {trackedStatus.status}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Informational Widget */}
            <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))', padding: '30px', borderRadius: '16px', border: '1px solid rgba(147, 51, 234, 0.2)', flex: 1 }}>
              <h3 style={{ marginBottom: '15px' }}>Response Timeline</h3>
              <ul style={{ paddingLeft: '20px', color: '#ccc', lineHeight: '1.8' }}>
                <li><strong>Pending:</strong> We've received your ticket and are reviewing it (24 hrs).</li>
                <li><strong>In Progress:</strong> A team member is actively working on the resolution.</li>
                <li><strong>Resolved:</strong> The issue has been completely fixed or answered.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintsPublic;
