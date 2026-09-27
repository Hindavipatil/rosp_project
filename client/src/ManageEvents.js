import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import NaviBar from "./NaviBar";
import {
  Calendar, Pencil, Trash2, X, Plus, Tag,
  BarChart2, Loader2, FolderOpen, Clock, MapPin,
  Users, TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import "./ManageEvents.css";



/* ── Main component ── */
function ManageEvents() {
  const [events,      setEvents]      = useState([]);
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [date,        setDate]        = useState("");
  const [time,        setTime]        = useState("");
  const [venue,       setVenue]       = useState("");
  const [organizers,  setOrganizers]  = useState("");
  const [status,      setStatus]      = useState("Open");
  const [capacity,    setCapacity]    = useState("");
  const [volunteerCap,setVolCap]      = useState("");
  const [poster,      setPoster]      = useState(null);
  const [editingId,   setEditingId]   = useState(null);
  const [message,     setMessage]     = useState("");
  const [msgType,     setMsgType]     = useState("success");
  const fileInputRef = useRef();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data);
      
      // Admin Full Alerts
      res.data.forEach(async (ev) => {
        const now = new Date();
        if (new Date(ev.date) < now || ev.status?.toLowerCase() === "closed") return;

        const parts = (ev.participants || []).filter(p => p.role === "Participant").length;
        const vols = (ev.participants || []).filter(p => p.role === "Volunteer").length;

        if (ev.capacity > 0 && parts >= ev.capacity) {
          toast.error(`🔴 Participant registration for "${ev.title}" is full. Registration has been automatically stopped.`, { autoClose: false, toastId: `full_parts_${ev._id}` });
        }
        if (ev.volunteerCap !== null && vols >= ev.volunteerCap) {
          toast.error(`🔴 Volunteer registration for "${ev.title}" is full. Registration has been automatically stopped.`, { autoClose: false, toastId: `full_vols_${ev._id}` });
        }
      });
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setDate(""); setTime("");
    setVenue(""); setOrganizers(""); setStatus("Open");
    setCapacity(""); setVolCap(""); setPoster(null); setEditingId(null); setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title",       title);
    fd.append("description", description);
    fd.append("date",        date);
    fd.append("time",        time);
    fd.append("venue",       venue);
    fd.append("organizers",  organizers);
    fd.append("status",      status);
    if (capacity !== "")     fd.append("capacity", capacity);
    if (volunteerCap !== "") fd.append("volunteerCap", volunteerCap);
    if (poster)              fd.append("poster", poster);

    try {
      await axios({
        method: editingId ? "PUT" : "POST",
        url: `http://localhost:5000/api/events${editingId ? `/${editingId}` : ""}`,
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(editingId ? "Event updated successfully." : "Event added successfully.");
      setMsgType("success");
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save event.");
      setMsgType("error");
    }
  };

  const handleEdit = (ev) => {
    setTitle(ev.title); setDescription(ev.description);
    setDate(ev.date ? ev.date.substring(0, 10) : "");
    setTime(ev.time); setVenue(ev.venue); setOrganizers(ev.organizers);
    setStatus(ev.status); setCapacity(ev.capacity || ""); setVolCap(ev.volunteerCap || "");
    setEditingId(ev._id); setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      setMessage("Event deleted successfully.");
      setMsgType("success");
      fetchEvents();
    } catch (err) { 
      console.error(err); 
      setMessage("Failed to delete event.");
      setMsgType("error");
    }
  };

  return (
    <div className="manage-events-page">
      <NaviBar />
      <div className="manage-events-container">

        {/* Heading */}
        <div className="page-eyebrow"><Calendar size={12} /> Admin · Events</div>
        <h2 className="manage-events-title">
          {editingId ? "Edit Event" : "Add Event"}
        </h2>

        {/* Form */}
        <form className="event-form" onSubmit={handleSubmit}>

          <div className="form-field">
            <label className="form-label">Event Title *</label>
            <input type="text" placeholder="e.g. Beach Clean-Up Drive"
              value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="form-field">
            <label className="form-label">Description *</label>
            <textarea placeholder="Describe the event…"
              value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">Time *</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Venue *</label>
              <input type="text" placeholder="e.g. Airoli Beach"
                value={venue} onChange={e => setVenue(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="form-label">Organizers *</label>
              <input type="text" placeholder="e.g. Loksetu Team"
                value={organizers} onChange={e => setOrganizers(e.target.value)} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Max Participants</label>
              <input type="number" min="0" placeholder="Participant Capacity"
                value={capacity} onChange={e => setCapacity(e.target.value)} />
            </div>
            <div className="form-field">
              <label className="form-label">Max Volunteers</label>
              <input type="number" min="0" placeholder="Volunteer Capacity"
                value={volunteerCap} onChange={e => setVolCap(e.target.value)} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Poster Image</label>
            <input type="file" ref={fileInputRef} accept="image/*"
              onChange={e => setPoster(e.target.files[0])} />
          </div>

          <div className="form-actions">
            <button type="submit" className="add-event-btn">
              {editingId ? <><Pencil size={15} /> Update Event</> : <><Plus size={15} /> Add Event</>}
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
        <h3 className="existing-events-title">Existing Events</h3>

        {events.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon"><FolderOpen size={26} /></div>
            <p>No events yet — add your first above.</p>
          </div>
        ) : (
          <ul className="events-list">
            {events.map(ev => (
              <li key={ev._id} className="event-item">
                <div className="event-info">
                  <h4>{ev.title}</h4>
                  <p>{ev.description}</p>
                  <div className="event-details">
                      {ev.category && (
                        <span className="ai-tag">
                          <Tag size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                          {ev.category}
                        </span>
                      )}
                    <span>{new Date(ev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span>{ev.time}</span>
                    <span>{ev.status}</span>
                  </div>
                  {(() => {
                      const parts = (ev.participants || []).filter(p => p.role === "Participant").length;
                      const vols = (ev.participants || []).filter(p => p.role === "Volunteer").length;
                      const cap = ev.capacity || 0;
                      const vCap = ev.volunteerCap || 0;
                      let capStr = "";
                      if (cap > 0) capStr += `Participants: ${parts} / ${cap}`;
                      else capStr += `Participants: ${parts}`;
                      let vStr = "";
                      if (vCap > 0) vStr += `Volunteers: ${vols} / ${vCap}`;
                      else vStr += `Volunteers: ${vols}`;

                      let regStatus = "Open";
                      if ((cap > 0 && parts >= cap) && (vCap > 0 && vols >= vCap)) {
                        regStatus = "Full";
                      } else if ((cap > 0 && parts >= cap) || (vCap > 0 && vols >= vCap)) {
                        regStatus = "Almost Full / Partially Full";
                      } else if ((cap > 0 && cap - parts <= 3) || (vCap > 0 && vCap - vols <= 3)) {
                        regStatus = "Almost Full";
                      }

                      return (
                        <div style={{fontWeight: "500", marginTop: "10px", padding: "10px", background: "var(--bg-card)", borderRadius: "4px", fontSize: "0.9rem", color: "var(--text-tertiary)"}}>
                          <div style={{display: "flex", gap: "15px", marginBottom: "5px"}}>
                            <div><Users size={12} style={{marginRight: 4}}/>{capStr}</div>
                            <div><Users size={12} style={{marginRight: 4}}/>{vStr}</div>
                          </div>
                          <div>Status: <strong style={{color: regStatus.includes("Full") && !regStatus.includes("Partially") && !regStatus.includes("Almost") ? "var(--accent-red)" : (regStatus.includes("Almost") || regStatus.includes("Partially") ? "var(--accent-amber)" : "var(--accent-green)")}}>{regStatus}</strong></div>
                        </div>
                      )
                  })()}
                  {ev.feedbacks && ev.feedbacks.length > 0 && (
                    <div className="event-feedbacks" style={{ marginTop: '10px', fontSize: '0.85rem', background: 'var(--bg-card)', padding: '10px', borderRadius: '4px' }}>
                      <strong style={{ display: 'block', marginBottom: '5px' }}>Participant Feedbacks:</strong>
                      {ev.feedbacks.map((f, i) => (
                        <div key={i} style={{ marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          <em>"{f.text}"</em> - {f.participantEmail} 
                          <span className="ai-tag" style={{ marginLeft: '5px', background: f.sentiment === 'Positive' ? '#dcfce7' : f.sentiment === 'Negative' ? '#fee2e2' : '#f1f5f9', color: f.sentiment === 'Positive' ? '#166534' : f.sentiment === 'Negative' ? '#991b1b' : '#334155' }}>
                            {f.sentiment}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
                <div className="event-actions">
                  <button className="edit-event-btn" onClick={() => handleEdit(ev)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <button className="delete-event-btn" onClick={() => handleDelete(ev._id)}>
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

export default ManageEvents;