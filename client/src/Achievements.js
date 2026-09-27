import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy } from 'lucide-react';
import Navbar from './Navbar';
import "./Achievements.css";

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/achievements')
      .then(res => res.json())
      .then(data => {
        setAchievements(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch achievements error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="achievements-page">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="achievements-hero">
        <div className="achievements-hero-inner">
          <div className="achievements-eyebrow">
            Recognitions &amp; Milestones
          </div>
          <h1>Our <em>Achievements</em></h1>
          <p className="achievements-hero-sub">
            Celebrating the milestones that reflect our commitment to community impact,
            social welfare, and sustainable change.
          </p>
          {!loading && (
            <div className="achievements-count-badge">
              <Trophy size={13} />
              {achievements.length} Award{achievements.length !== 1 ? 's' : ''} &amp; Recognitions
            </div>
          )}
        </div>
      </section>

      {/* ── Awards Grid ── */}
      <div className="achievements-container">
        <div className="achievements-section-label">Hall of Recognition</div>

        {loading ? (
          /* Skeleton loader */
          <div className="achievements-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-box skeleton-icon"></div>
                <div className="skeleton-box skeleton-title"></div>
                <div className="skeleton-box skeleton-meta"></div>
                <div className="skeleton-box skeleton-img"></div>
              </div>
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="achievements-grid">
            <div className="achievements-empty">
              <div className="achievements-empty-icon">
                <Award size={32} />
              </div>
              <h3>No achievements yet</h3>
              <p>Awards and recognitions will appear here once added.</p>
            </div>
          </div>
        ) : (
          <div className="achievements-grid">
            {achievements.map((a, index) => (
              <motion.div
                key={a._id}
                className="achievement-card reveal"
                data-index={String(index + 1).padStart(2, '0')}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Icon box */}
                <div className="achievement-icon-box">
                  <Trophy size={24} />
                </div>

                {/* Title */}
                <h2>{a.title}</h2>

                {/* Meta row: year + issuer */}
                <div className="achievement-meta">
                  {a.year && (
                    <span className="achievement-year">{a.year}</span>
                  )}
                  {a.issuer && (
                    <span className="achievement-issuer">{a.issuer}</span>
                  )}
                </div>

                {/* Certificate image */}
                {a.certificate && (
                  <a
                    href={`http://localhost:5000/${a.certificate}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="achievement-cert-wrap"
                  >
                    <img
                      src={`http://localhost:5000/${a.certificate}`}
                      alt={`${a.title} certificate`}
                      className="achievement-image"
                    />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Achievements;
