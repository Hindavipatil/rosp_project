import React, { useState, useEffect, useRef } from 'react';
import NaviBar from './NaviBar';
import { Award, Plus, Pencil, Trash2, X, ExternalLink, FolderOpen } from 'lucide-react';
import "./ManageAchievements.css";

function ManageAchievements() {
  const [title,        setTitle]        = useState('');
  const [year,         setYear]         = useState('');
  const [issuer,       setIssuer]       = useState('');
  const [certificate,  setCertificate]  = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [editingId,    setEditingId]    = useState(null);
  const [message,      setMessage]      = useState('');
  const [msgType,      setMsgType]      = useState('success');
  const certRef = useRef();

  const fetchAchievements = () => {
    fetch('http://localhost:5000/api/achievements')
      .then(r => r.json())
      .then(data => setAchievements(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchAchievements(); }, []);

  const resetForm = () => {
    setTitle(''); setYear(''); setIssuer(''); setCertificate(null);
    setEditingId(null); setMessage('');
    if (certRef.current) certRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !year || !issuer) {
      setMessage("Please fill all required fields."); setMsgType("error"); return;
    }
    const fd = new FormData();
    fd.append('title',  title);
    fd.append('year',   year);
    fd.append('issuer', issuer);
    if (certificate) fd.append('certificate', certificate);

    try {
      const res = await fetch(
        `http://localhost:5000/api/achievements${editingId ? `/${editingId}` : ''}`,
        { method: editingId ? 'PUT' : 'POST', body: fd }
      );
      if (!res.ok) { setMessage('Failed to save achievement.'); setMsgType('error'); return; }
      setMessage(editingId ? 'Achievement updated successfully.' : 'Achievement added successfully.');
      setMsgType('success');
      resetForm();
      fetchAchievements();
    } catch (err) {
      setMessage('Error saving achievement.'); setMsgType('error'); console.error(err);
    }
  };

  const handleEdit = (a) => {
    setTitle(a.title); setYear(a.year); setIssuer(a.issuer);
    setEditingId(a._id); setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/achievements/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAchievements();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="manage-achievements-page">
      <NaviBar />
      <div className="manage-achievements-container">

        {/* Heading */}
        <div className="page-eyebrow"><Award size={12} /> Admin · Achievements</div>
        <h2 className="page-title">
          {editingId ? "Edit Achievement" : "Add Achievement"}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="achieve-form">

          <div className="form-field">
            <label className="form-label">Title *</label>
            <input
              type="text"
              placeholder="e.g. Best Environment Initiative"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Year *</label>
              <input
                type="number"
                placeholder={new Date().getFullYear()}
                value={year}
                onChange={e => setYear(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Issuing Body *</label>
              <input
                type="text"
                placeholder="e.g. Navi Mumbai Municipal Corporation"
                value={issuer}
                onChange={e => setIssuer(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Certificate (image / PDF)</label>
            <input
              type="file"
              ref={certRef}
              accept="image/*,.pdf"
              onChange={e => setCertificate(e.target.files[0])}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="achieve-submit-btn">
              {editingId
                ? <><Pencil size={15} /> Update Achievement</>
                : <><Plus size={15} /> Add Achievement</>
              }
            </button>
            {editingId && (
              <button type="button" className="achieve-cancel-btn" onClick={resetForm}>
                <X size={13} /> Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className={`achieve-message ${msgType === 'error' ? 'error' : ''}`}>{message}</p>
        )}

        {/* List */}
        <h2 className="list-title">Existing Achievements</h2>

        {achievements.length === 0 ? (
          <div className="no-achievements">
            <div className="no-achievements-icon"><FolderOpen size={26} /></div>
            <p>No achievements yet — add your first above.</p>
          </div>
        ) : (
          <ul className="achieve-list">
            {achievements.map(a => (
              <li key={a._id} className="achieve-item">
                <div className="achieve-info">
                  <h4>{a.title}</h4>
                  <div className="achieve-meta">
                    <span>{a.year}</span>
                    <span>{a.issuer}</span>
                    {a.certificate && (
                      <a
                        className="achieve-cert-link"
                        href={`http://localhost:5000/${a.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        View Certificate
                      </a>
                    )}
                  </div>
                </div>
                <div className="achieve-actions">
                  <button className="achieve-edit-btn" onClick={() => handleEdit(a)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button className="achieve-delete-btn" onClick={() => handleDelete(a._id)}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
}

export default ManageAchievements;
