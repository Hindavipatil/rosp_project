import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Calendar,
  MapPin,
  Users,
  UserCheck,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import { useEventFilters } from "./hooks/useEventFilters";
import EventFilterBar from "./components/EventFilterBar";
import "./Events.css";

const API_BASE = "http://localhost:5000";

function Events() {
  const { filters, setFilter, clearAll } = useEventFilters();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", age: "", role: "Participant",
  });
  const [feedbackData, setFeedbackData] = useState({ email: "", text: "" });

  const [message, setMessage] = useState({});
  const [fullImage, setFullImage] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  useEffect(() => { fetchMeta(); }, []);
  useEffect(() => { fetchEvents(); }, [JSON.stringify(filters)]);

  const fetchMeta = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/events/meta`);
      setCategories(res.data.categories || []);
      setAllTags(res.data.tags || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.tags?.length > 0) params.append("tags", filters.tags.join(","));
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.availability) params.append("availability", filters.availability);
      const res = await axios.get(`${API_BASE}/api/events?${params.toString()}`);
      setEvents(res.data);

      // Low Capacity Alerts (Public Page)
      res.data.forEach(async (ev) => {
        const now = new Date();
        if (new Date(ev.date) < now || ev.status?.toLowerCase() === "closed") return;

        const parts = (ev.participants || []).filter(p => p.role === "Participant").length;
        const vols = (ev.participants || []).filter(p => p.role === "Volunteer").length;

        if (ev.capacity > 0 && ev.capacity - parts <= 3 && ev.capacity - parts > 0) {
          toast.warn(`⚠️ Only ${ev.capacity - parts} participant spots remaining for "${ev.title}"!`, { autoClose: false, toastId: `low_parts_${ev._id}` });
        }
        if (ev.volunteerCap > 0 && ev.volunteerCap - vols <= 3 && ev.volunteerCap - vols > 0) {
          toast.warn(`⚠️ Only ${ev.volunteerCap - vols} volunteer spots remaining for "${ev.title}"!`, { autoClose: false, toastId: `low_vols_${ev._id}` });
        }
      });
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e, eventId) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/events/${eventId}/register`, {
        ...formData,
        age: Number(formData.age),
      });
      setMessage({ [eventId]: { text: "Registration successful!", type: "success" } });
      setFormData({ name: "", phone: "", email: "", age: "", role: "Participant" });
      toast.success("You're registered!");
      fetchEvents();
    } catch (err) {
      const apiMsg =
        err.response?.data?.error || err.response?.data?.message || "Registration failed!";
      setMessage({ [eventId]: { text: apiMsg, type: "error" } });
      toast.error(apiMsg);
    }
  };

  const handleFeedbackSubmit = async (e, eventId) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/events/${eventId}/feedback`, feedbackData);
      setMessage({ [eventId]: { text: `Feedback saved! Sentiment Analysis: ${res.data.sentiment}`, type: "success" } });
      setFeedbackData({ email: "", text: "" });
      toast.success("Feedback submitted!");
      fetchEvents();
    } catch (err) {
      const apiMsg = err.response?.data?.error || "Submission failed!";
      setMessage({ [eventId]: { text: apiMsg, type: "error" } });
      toast.error(apiMsg);
    }
  };

  const getEventStatus = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) return "past";
    if (event.status?.toLowerCase() === "open") return "upcoming";
    return "closed";
  };

  const statusConfig = {
    upcoming: { color: "#2d9e9e", dot: "#4CAF50",  label: "Upcoming" },
    past:     { color: "#888",    dot: "#888",      label: "Past" },
    closed:   { color: "#c9923a", dot: "#FF9800",   label: "Closed" },
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });

  return (
    <div className="events-page">
      <Navbar />

      {/* ── Hero banner ── */}
      <motion.section
        className="events-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="events-eyebrow">Join the Movement</div>
          <h1 className="page-title">
            Events &amp; <em>Activities</em>
          </h1>
          <p className="page-description">
            Discover upcoming events, register to participate, and see the impact
            we've created together across our communities.
          </p>
          {!loading && (
            <div className="events-count-badge">
              <Calendar size={13} />
              {events.length} Event{events.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Filter bar (EventFilterBar component) ── */}
      <div className="events-filter-wrapper">
        <div className="container">
          <EventFilterBar
            filters={filters}
            setFilter={setFilter}
            clearAll={clearAll}
            resultCount={events.length}
            total={events.length}
            categories={categories}
            allTags={allTags}
          />
        </div>
      </div>

      {/* ── Events grid ── */}
      <motion.section
        className="events-section"
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container">
          <div className="events-section-label">
            {loading ? "Loading…" : `${events.length} result${events.length !== 1 ? "s" : ""}`}
          </div>

          {loading ? (
            /* Skeleton grid */
            <div className="events-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-event-card">
                  <div className="skeleton-poster" />
                  <div className="skeleton-body">
                    <div className="skeleton-line title" />
                    <div className="skeleton-line text" />
                    <div className="skeleton-line text2" />
                    <div className="skeleton-line meta" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="events-grid">
              <div className="no-events">
                <div className="no-events-icon">
                  <Calendar size={32} />
                </div>
                <h3>No events found</h3>
                <p>Try adjusting your filters or check back later for new events.</p>
              </div>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event, index) => {
                const status = getEventStatus(event);
                const cfg = statusConfig[status];
                const isExpanded = expandedEvent === event._id;

                return (
                  <motion.div
                    key={event._id}
                    className="event-card"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: (index % 3) * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {/* Poster */}
                    {event.poster && (
                      <div className="event-poster">
                        <img
                          src={`${API_BASE}/${event.poster}`}
                          alt={event.title}
                          onClick={() => setFullImage(`${API_BASE}/${event.poster}`)}
                        />
                        <div className="event-status" style={{ color: cfg.color }}>
                          <span
                            className="status-dot"
                            style={{ background: cfg.dot }}
                          />
                          {cfg.label}
                        </div>
                      </div>
                    )}

                    {/* No-poster status badge */}
                    {!event.poster && (
                      <div
                        className="event-status"
                        style={{
                          position: "relative",
                          top: "auto",
                          right: "auto",
                          display: "inline-flex",
                          margin: "20px 32px 0",
                          color: cfg.color,
                        }}
                      >
                        <span
                          className="status-dot"
                          style={{ background: cfg.dot }}
                        />
                        {cfg.label}
                      </div>
                    )}

                    <div className="event-content">
                      {/* Title + expand */}
                      <div className="event-header">
                        <h3 className="event-title">{event.title}</h3>
                        <button
                          className="expand-btn"
                          onClick={() =>
                            setExpandedEvent(isExpanded ? null : event._id)
                          }
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </div>

                      {/* Description */}
                      <p className="event-description">{event.description}</p>

                      {/* Meta */}
                      <div className="event-details">
                        <div className="detail-item">
                          <Calendar size={13} />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="detail-item">
                          <MapPin size={13} />
                          <span>{event.venue}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={13} />
                          <span>{event.time || "TBA"}</span>
                        </div>
                      </div>

                      {event.organizers && (
                        <div className="event-organizers">
                          <strong>By:</strong> {event.organizers}
                        </div>
                      )}

                      <div className="participants-pill" style={{display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-secondary)'}}>
                        {(() => {
                           const parts = (event.participants || []).filter(p => p.role === "Participant").length;
                           const vols = (event.participants || []).filter(p => p.role === "Volunteer").length;
                           const cap = event.capacity || 0;
                           const vCap = event.volunteerCap || 0;
                           
                           return (
                             <>
                               {cap > 0 ? <div>Participants: {parts} / {cap}</div> : <div>Participants: {parts}</div>}
                               {vCap > 0 ? <div>Volunteers: {vols} / {vCap}</div> : <div>Volunteers: {vols}</div>}
                               {(cap > 0 && parts >= cap) && <div style={{color: 'var(--accent-red)', fontWeight: 'bold', marginTop: '4px'}}>🔴 Participant Registration Full</div>}
                               {(vCap > 0 && vols >= vCap) && <div style={{color: 'var(--accent-red)', fontWeight: 'bold', marginTop: '4px'}}>🔴 Volunteer Registration Full</div>}
                             </>
                           );
                        })()}
                      </div>

                      {/* Registration form (expanded, upcoming only) */}
                      <AnimatePresence>
                        {isExpanded && status === "upcoming" && (
                          <motion.div
                            className="event-expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                          >
                            <form
                              className="register-form"
                              onSubmit={(e) => handleRegister(e, event._id)}
                            >
                              <h4>Register for this event</h4>
                              <div className="form-grid">
                                <input
                                  type="text"
                                  placeholder="Full Name"
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                  }
                                  required
                                />
                                <input
                                  type="tel"
                                  placeholder="Phone Number"
                                  value={formData.phone}
                                  onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                  }
                                  required
                                />
                                <input
                                  type="email"
                                  placeholder="Email Address"
                                  value={formData.email}
                                  onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                  }
                                  required
                                />
                                <input
                                  type="number"
                                  placeholder="Age"
                                  value={formData.age}
                                  onChange={(e) =>
                                    setFormData({ ...formData, age: e.target.value })
                                  }
                                  required
                                />
                                <select
                                  value={formData.role}
                                  onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                  }
                                >
                                  {(() => {
                                    const parts = (event.participants || []).filter(p => p.role === "Participant").length;
                                    const cap = event.capacity || 0;
                                    const isPartsFull = cap > 0 && parts >= cap;
                                    
                                    const vols = (event.participants || []).filter(p => p.role === "Volunteer").length;
                                    const vCap = event.volunteerCap || 0;
                                    const isVolsFull = vCap > 0 && vols >= vCap;
                                    
                                    return (
                                      <>
                                        <option value="Participant" disabled={isPartsFull}>Participate {isPartsFull ? "(Full)" : ""}</option>
                                        <option value="Volunteer" disabled={isVolsFull}>Volunteer {isVolsFull ? "(Full)" : ""}</option>
                                      </>
                                    );
                                  })()}
                                </select>
                              </div>

                              <button type="submit" className="btn-primary register-btn" disabled={((event.capacity || 0) > 0 && (event.participants || []).filter(p => p.role === "Participant").length >= event.capacity) && ((event.volunteerCap || 0) > 0 && (event.participants || []).filter(p => p.role === "Volunteer").length >= event.volunteerCap)}>
                                <UserCheck size={16} />
                                Register Now
                              </button>

                              {message[event._id] && (
                                <div
                                  className={`register-message ${message[event._id].type}`}
                                >
                                  {message[event._id].text}
                                </div>
                              )}
                            </form>
                          </motion.div>
                        )}

                        {/* Show closed message when expanded + closed */}
                        {isExpanded && status === "closed" && (
                          <motion.div
                            className="event-expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="register-message error">
                              Registration for this event is currently closed.
                            </div>
                          </motion.div>
                        )}

                        {isExpanded && status === "past" && (
                          <motion.div
                            className="event-expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="register-message success">
                              This event has already taken place. Stay tuned for future events!
                            </div>
                            <form className="register-form" style={{ marginTop: '20px' }} onSubmit={(e) => handleFeedbackSubmit(e, event._id)}>
                              <h4>Leave Event Feedback</h4>
                              <div className="form-grid">
                                <input
                                  type="email"
                                  placeholder="Your Registered Email"
                                  value={feedbackData.email}
                                  onChange={(e) => setFeedbackData({ ...feedbackData, email: e.target.value })}
                                  required
                                />
                                <input
                                  type="text"
                                  placeholder="Share your experience..."
                                  value={feedbackData.text}
                                  onChange={(e) => setFeedbackData({ ...feedbackData, text: e.target.value })}
                                  required
                                />
                              </div>
                              <button type="submit" className="btn-primary register-btn">
                                Submit Feedback
                              </button>
                              {message[event._id] && (
                                <div className={`register-message ${message[event._id].type}`}>
                                  {message[event._id].text}
                                </div>
                              )}
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Poster lightbox ── */}
      <AnimatePresence>
        {fullImage && (
          <motion.div
            className="full-image-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setFullImage(null)}
          >
            <button
              className="close-full-image-btn"
              onClick={(e) => { e.stopPropagation(); setFullImage(null); }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <motion.img
              src={fullImage}
              alt="Event poster"
              className="full-image"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Events;