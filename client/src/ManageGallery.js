import NaviBar from "./NaviBar";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Image as ImageIcon, Video, Pencil, Trash2, X, Upload, FolderOpen } from "lucide-react";
import "./ManageGallery.css";

function ManageGallery() {
  const [type,      setType]      = useState("photo");
  const [file,      setFile]      = useState(null);
  const [videoUrl,  setVideoUrl]  = useState("");
  const [caption,   setCaption]   = useState("");
  const [year,      setYear]      = useState(new Date().getFullYear());
  const [eventType, setEventType] = useState("");
  const [gallery,   setGallery]   = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message,   setMessage]   = useState("");
  const [msgType,   setMsgType]   = useState("success");
  const fileInputRef = useRef();

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gallery");
      setGallery(res.data);
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setType("photo"); setFile(null); setVideoUrl(""); setCaption("");
    setYear(new Date().getFullYear()); setEventType(""); setEditingId(null); setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      if (type === "photo") {
        if (!file && !editingId) { setMessage("Please select an image file."); setMsgType("error"); return; }
        const fd = new FormData();
        if (file) fd.append("file", file);
        fd.append("caption",    caption);
        fd.append("year",       year);
        fd.append("eventType",  eventType);
        await axios({
          method: editingId ? "PUT" : "POST",
          url: `http://localhost:5000/api/gallery/photo${editingId ? `/${editingId}` : ""}`,
          data: fd,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        if (!videoUrl) { setMessage("Please enter a YouTube URL."); setMsgType("error"); return; }
        await axios({
          method: editingId ? "PUT" : "POST",
          url: `http://localhost:5000/api/gallery/video${editingId ? `/${editingId}` : ""}`,
          data: { url: videoUrl, caption, year, eventType },
        });
      }
      setMessage(editingId ? "Gallery item updated." : "Gallery item added successfully.");
      setMsgType("success");
      resetForm();
      fetchGallery();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save gallery item.");
      setMsgType("error");
    }
  };

  const handleEdit = (item) => {
    setType(item.type); setCaption(item.caption);
    setYear(item.year); setEventType(item.eventType);
    setEditingId(item._id); setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/gallery/${id}`);
      fetchGallery();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="manage-gallery-page">
      <NaviBar />
      <div className="manage-gallery-container">

        {/* Heading */}
        <div className="page-eyebrow">
          <ImageIcon size={12} /> Admin · Gallery
        </div>
        <h2>
          {editingId ? "Edit Gallery Item" : "Add Gallery Item"}
        </h2>

        {/* Form */}
        <form onSubmit={handleUpload} className="gallery-form">

          {/* Type toggle */}
          <div>
            <label className="gallery-form-label">Media Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-toggle-btn ${type === 'photo' ? 'active' : ''}`}
                onClick={() => setType('photo')}
              >
                <ImageIcon size={12} style={{ marginRight: 6 }} /> Photo
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === 'video' ? 'active' : ''}`}
                onClick={() => setType('video')}
              >
                <Video size={12} style={{ marginRight: 6 }} /> YouTube Video
              </button>
            </div>
          </div>

          {/* File / URL */}
          <div className="gallery-form-field">
            <label className="gallery-form-label">
              {type === 'photo' ? 'Image File' : 'YouTube URL'}
            </label>
            {type === "photo" ? (
              <input
                type="file"
                className="gallery-input"
                ref={fileInputRef}
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
              />
            ) : (
              <input
                type="text"
                className="gallery-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
              />
            )}
          </div>

          {/* Caption */}
          <div className="gallery-form-field">
            <label className="gallery-form-label">Caption</label>
            <input
              type="text"
              className="gallery-input"
              placeholder="Describe the photo or video…"
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
          </div>

          <div className="gallery-form-row">
            <div className="gallery-form-field">
              <label className="gallery-form-label">Year</label>
              <input
                type="number"
                className="gallery-input"
                placeholder={new Date().getFullYear()}
                value={year}
                onChange={e => setYear(Number(e.target.value))}
              />
            </div>
            <div className="gallery-form-field">
              <label className="gallery-form-label">Event Type</label>
              <input
                type="text"
                className="gallery-input"
                placeholder="e.g. Workshop, Drive"
                value={eventType}
                onChange={e => setEventType(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="gallery-button">
              {editingId
                ? <><Pencil size={15} /> Update Item</>
                : <><Upload size={15} /> Upload</>
              }
            </button>
            {editingId && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                <X size={13} /> Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className={`message ${msgType === "error" ? "error" : ""}`}>{message}</p>}

        {/* List */}
        <h3>Gallery Items</h3>

        {gallery.length === 0 ? (
          <div className="no-gallery">
            <div className="no-gallery-icon"><FolderOpen size={26} /></div>
            <p>No gallery items yet — upload your first above.</p>
          </div>
        ) : (
          <ul className="gallery-list">
            {gallery.map(item => (
              <li key={item._id} className="gallery-item">
                <div className="gallery-info">
                  <h4>
                    <span className={`gallery-type-badge ${item.type}`}>{item.type}</span>
                    {item.caption || "Untitled"}
                  </h4>
                  <div className="gallery-details">
                    <span>{item.year}</span>
                    {item.eventType && <span>{item.eventType}</span>}
                  </div>
                </div>
                <div className="gallery-actions">
                  <button className="edit-gallery-btn" onClick={() => handleEdit(item)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button className="gallery-delete-button" onClick={() => handleDelete(item._id)}>
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

export default ManageGallery;
