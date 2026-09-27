import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Trash2, Edit3, MessageSquare, Save, X, Calendar } from 'lucide-react';
import NaviBar from './NaviBar';
import './ManageEvents.css'; // Reuse existing container CSS for UI consistency

function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints');
      setComplaints(res.data);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleUpdateStatus = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}/status`, { status: editStatus });
      toast.success('Status updated successfully');
      setEditingId(null);
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/complaints/${id}`);
      toast.success('Complaint deleted successfully');
      fetchComplaints();
    } catch (err) {
      toast.error('Failed to delete complaint');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Resolved') return '#10b981'; // green
    if (status === 'In Progress') return '#f59e0b'; // yellow
    return '#3b82f6'; // blue (Pending)
  };

  return (
    <div className="manage-events-page">
      <NaviBar />
      <div className="manage-events-container">
        <div className="page-eyebrow"><MessageSquare size={12} /> Admin · Complaints</div>
        <h1 className="page-title">Manage Complaints</h1>
        <p className="page-subtitle">Track, update and resolve incoming support tickets from the public here.</p>
        
        {complaints.length === 0 ? (
          <div className="no-events" style={{ textAlign:'center', marginTop: '40px', padding: '40px' }}>
             <p style={{ color: '#888' }}>No complaints found.</p>
          </div>
        ) : (
          <ul className="events-list">
            <AnimatePresence>
              {complaints.map(comp => (
                <motion.li 
                  key={comp._id} 
                  className="event-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="event-info">
                    <h4>#{comp.trackingId}</h4>
                    <p style={{ marginTop: '5px', marginBottom: '10px' }}>{comp.subject}</p>
                    <div className="event-details">
                      <span>{new Date(comp.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span>{comp.name}</span>
                      <span>{comp.email}</span>
                      <span style={{ 
                        background: comp.status === 'Resolved' ? 'rgba(16, 185, 129, 0.1)' : comp.status === 'In Progress' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: comp.status === 'Resolved' ? '#10b981' : comp.status === 'In Progress' ? '#f59e0b' : '#3b82f6',
                        fontWeight: 'bold',
                        border: 'none'
                      }}>
                        Status: {comp.status}
                      </span>
                    </div>
                    {comp.description && (
                      <div className="event-feedbacks" style={{ marginTop: '15px', fontSize: '0.9rem', background: 'var(--bg-card)', padding: '12px', borderRadius: '4px', fontStyle: 'italic', color: '#aaa' }}>
                        "{comp.description}"
                      </div>
                    )}
                  </div>
                  <div className="event-actions">
                    {editingId === comp._id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)', outline: 'none' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <button className="edit-event-btn" onClick={() => handleUpdateStatus(comp._id)} style={{ width: '100%', justifyContent: 'center' }}>
                          <Save size={12} /> Save
                        </button>
                        <button className="delete-event-btn" onClick={() => setEditingId(null)} style={{ width: '100%', justifyContent: 'center' }}>
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button className="edit-event-btn" onClick={() => { setEditingId(comp._id); setEditStatus(comp.status); }}>
                          <Edit3 size={12} /> Edit Status
                        </button>
                        <button className="delete-event-btn" onClick={() => handleDelete(comp._id)}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

export default ManageComplaints;
