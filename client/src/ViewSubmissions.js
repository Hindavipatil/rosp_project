import React, { useEffect, useState } from "react";
import axios from "axios";
import NaviBar from "./NaviBar";
import { Users, Loader2, AlertCircle, UserCheck, UserPlus, Sparkles, TrendingUp, Info } from "lucide-react";
import "./ViewSubmissions.css";

const PredictionCard = ({ eventId }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/events/${eventId}/predict`);
        setPrediction(res.data);
      } catch (err) {
        console.error("Prediction fetch failed", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [eventId]);

  if (loading) return (
    <div className="prediction-mini-state">
      <Loader2 size={12} className="spin" /> Calculating turnout...
    </div>
  );

  if (error || !prediction) return null;

  return (
    <div className="prediction-card-inline">
      <div className="pred-icon"><TrendingUp size={14} /></div>
      <div className="pred-content">
        <div className="pred-label">ML Turnout Prediction</div>
        <div className="pred-value">
          {prediction.predicted_participants} 
          <span className="pred-unit">Attendees</span>
        </div>
        <div className="pred-note">
          <Sparkles size={10} /> {prediction.confidence_note}
        </div>
      </div>
    </div>
  );
};

function ViewSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => { fetchSubmissions(); }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/events/submissions");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to fetch volunteer data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submissions-page">
      <NaviBar />
      <div className="submissions-container">

        {/* Heading */}
        <div className="submissions-eyebrow">
          <Users size={12} /> Admin · Submissions
        </div>
        <h1 className="submissions-title">
          Event Submissions
        </h1>

        {/* States */}
        {loading && (
          <div className="submissions-state">
            <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} />
            Loading submission data…
          </div>
        )}

        {error && (
          <div className="submissions-state error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="submissions-state">
            No submissions recorded yet.
          </div>
        )}

        {/* Event blocks */}
        {!loading && !error && submissions.map((ev) => {
          const volCount  = ev.volunteers?.length  || 0;
          const partCount = ev.participants?.length || 0;
          return (
            <div key={ev.eventId} className="event-submission-block">

              {/* Event header */}
              <div className="event-sub-header">
                <h3 className="event-sub-title">{ev.title}</h3>
                <div className="event-sub-meta">
                  <span className="sub-chip vol">
                    {volCount}{typeof ev.volunteerCap === 'number' ? `/${ev.volunteerCap}` : ''} Volunteers
                  </span>
                  <span className="sub-chip part">
                    {partCount} Participants
                  </span>
                </div>
                <PredictionCard eventId={ev.eventId} />
              </div>

              {/* Two-column body */}
              <div className="event-sub-grid">

                {/* Volunteers */}
                <div className="sub-col">
                  <p className="sub-col-title">
                    <UserCheck size={12} /> Volunteers
                  </p>
                  {volCount === 0 ? (
                    <p className="sub-empty">No volunteers registered.</p>
                  ) : (
                    <ul className="sub-people-list">
                      {ev.volunteers.map((p, idx) => (
                        <li key={idx} className="sub-person">
                          <div className="sub-person-name">{p.name}</div>
                          <div className="sub-person-meta">
                            {p.email} · {p.phone} · Age {p.age}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Participants */}
                <div className="sub-col">
                  <p className="sub-col-title">
                    <UserPlus size={12} /> Participants
                  </p>
                  {partCount === 0 ? (
                    <p className="sub-empty">No participants registered.</p>
                  ) : (
                    <ul className="sub-people-list">
                      {ev.participants.map((p, idx) => (
                        <li key={idx} className="sub-person">
                          <div className="sub-person-name">{p.name}</div>
                          <div className="sub-person-meta">
                            {p.email} · {p.phone} · Age {p.age}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ViewSubmissions;
