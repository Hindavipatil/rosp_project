import React, { useEffect, useState } from "react";
import axios from "axios";
import NaviBar from "./NaviBar";

function ViewVolunteerSubmissions() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events/volunteers");
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  return (
    <>
      <NaviBar />
      <div className="submissions-container">
        <h2 className="submissions-title">Volunteer Submissions</h2>
        {submissions.length === 0 ? (
          <p>No volunteers registered yet.</p>
        ) : (
          submissions.map((submission, index) => (
            <div key={index} className="submission-card">
              <h3>{submission.name}</h3>
              <p><strong>Email:</strong> {submission.email}</p>
              <p><strong>Phone:</strong> {submission.phone}</p>
              <p><strong>Age:</strong> {submission.age}</p>
              <p><strong>Event:</strong> {submission.eventTitle}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default ViewVolunteerSubmissions;
