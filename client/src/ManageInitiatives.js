import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NaviBar from "./NaviBar";
import {
  Plus, Pencil, Trash2, X, Users, Tag,
  Calendar, MapPin, FileImage, CheckCircle2,
  AlertCircle, FolderOpen,
} from "lucide-react";
import "./ManageInitiatives.css";

function ManageInitiatives() {
  const [initiatives,      setInitiatives]      = useState([]);
  const [title,            setTitle]            = useState("");
  const [category,         setCategory]         = useState("");
  const [date,             setDate]             = useState("");
  const [location,         setLocation]         = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [impact,           setImpact]           = useState(0);
  const [photos,           setPhotos]           = useState([]);
  const [editingId,        setEditingId]        = useState(null);
  const [message,          setMessage]          = useState("");
  const [msgType,          setMsgType]          = useState("success");
  const fileInputRef = useRef();

  useEffect(() => { fetchInitiatives(); }, []);

  const fetchInitiatives = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/initiatives");
      setInitiatives(res.data);
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setTitle(""); setCategory(""); setDate(""); setLocation("");
    setShortDescription(""); setImpact(0); setPhotos([]);
    setEditingId(null); setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title",            title);
    fd.append("category",         category);
    fd.append("date",             date);
    fd.append("location",         location);
    fd.append("short_description",shortDescription);
    fd.append("impact_metrics",   JSON.stringify({ people_helped: impact }));
    for (let i = 0; i < photos.length; i++) fd.append("photos", photos[i]);

    try {
      await axios({
        method: editingId ? "PUT" : "POST",
        url: `http://localhost:5000/api/initiatives${editingId ? `/${editingId}` : ""}`,
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(editingId ? "Initiative updated successfully." : "Initiative added successfully.");
      setMsgType("success");
      resetForm();
      fetchInitiatives();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save initiative.");
      setMsgType("error");
    }
  };

  const handleEdit = (ini) => {
    setTitle(ini.title);
    setCategory(ini.category);
    setDate(ini.date ? ini.date.substring(0, 10) : "");
    setLocation(ini.location);
    setShortDescription(ini.short_description);
    setImpact(ini.impact_metrics?.people_helped || 0);
    setEditingId(ini._id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/initiatives/${id}`);
      fetchInitiatives();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="manage-initiatives-page">
      <NaviBar />

      <div className="manage-initiatives-container">

        {/* ── Heading ── */}
        <div className="page-eyebrow">
          <Users size={12} />
          Admin · Initiatives
        </div>
        <h2>
          {editingId ? "Edit Initiative" : "Add Initiative"}
        </h2>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="initiative-form">

          <div className="form-field">
            <label className="form-label">Title *</label>
            <input
              type="text"
              placeholder="e.g. Clean Coast Drive"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Category *</label>
              <input
                type="text"
                placeholder="e.g. Environment"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Location *</label>
            <input
              type="text"
              placeholder="e.g. Airoli Beach, Navi Mumbai"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Short Description *</label>
            <textarea
              placeholder="Describe the initiative in a few sentences…"
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">People Helped</label>
              <input
                type="number"
                placeholder="0"
                value={impact}
                onChange={e => setImpact(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Photos</label>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                onChange={e => setPhotos(e.target.files)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">
              {editingId
                ? <><Pencil size={15} /> Update Initiative</>
                : <><Plus size={15} /> Add Initiative</>
              }
            </button>
            {editingId && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                <X size={13} /> Cancel
              </button>
            )}
          </div>
        </form>

        {/* ── Status message ── */}
        {message && (
          <p className={`message ${msgType === "error" ? "error" : ""}`}>
            {message}
          </p>
        )}

        {/* ── List ── */}
        <h3>Existing Initiatives</h3>

        {initiatives.length === 0 ? (
          <div className="no-initiatives">
            <div className="no-initiatives-icon"><FolderOpen size={26} /></div>
            <p>No initiatives yet — add your first above.</p>
          </div>
        ) : (
          <ul className="initiative-list">
            {initiatives.map((ini) => (
              <li key={ini._id} className="initiative-item">

                <div className="initiative-info">
                  <h4>{ini.title}</h4>
                  <p>{ini.short_description}</p>
                  <div className="initiative-details">
                    {/* AI tags */}
                    {ini.tags && ini.tags.length > 0 && (
                      <span className="ai-tag">
                        <Tag size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        {ini.tags.join(", ")}
                      </span>
                    )}
                    <span>{ini.category}</span>
                    <span>
                      {new Date(ini.date).toLocaleDateString(undefined, {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </span>
                    <span>{ini.location}</span>
                    <span>{ini.impact_metrics?.people_helped || 0} helped</span>
                  </div>
                </div>

                <div className="initiative-actions">
                  <button
                    className="edit-initiative-btn"
                    onClick={() => handleEdit(ini)}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    className="delete-initiative-btn"
                    onClick={() => handleDelete(ini._id)}
                  >
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

export default ManageInitiatives;
