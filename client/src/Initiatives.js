import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Lightbulb,
  Calendar,
  MapPin,
  Users,
  Target,
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  TrendingUp,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "./Navbar";
import "./Initiatives.css";

function Initiatives() {
  const [initiatives, setInitiatives] = useState([]);
  const [filter, setFilter] = useState("All");
  const [fullImage, setFullImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  useEffect(() => {
    fetchInitiatives();
  }, []);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/initiatives");
      setInitiatives(res.data);
    } catch (err) {
      console.error("Error fetching initiatives:", err);
      toast.error("Failed to load initiatives");
    } finally {
      setLoading(false);
    }
  };

  const categoryOrder = [
    "Women Empowerment",
    "Tree Plantation",
    "Ration Card Drives",
    "Health/Hygiene",
  ];

  const filtered = initiatives
    .filter((i) => filter === "All" || i.category === filter)
    .sort((a, b) => {
      const rankA = categoryOrder.indexOf(a.category) !== -1 ? categoryOrder.indexOf(a.category) : 999;
      const rankB = categoryOrder.indexOf(b.category) !== -1 ? categoryOrder.indexOf(b.category) : 999;
      return rankA - rankB;
    });

  const categories = [
    { name: "All",                icon: Target,    color: "#1a6b6b" },
    { name: "Women Empowerment",  icon: Heart,     color: "#E91E63" },
    { name: "Tree Plantation",    icon: TrendingUp,color: "#4CAF50" },
    { name: "Ration Card Drives", icon: Award,     color: "#FF9800" },
    { name: "Health/Hygiene",     icon: Users,     color: "#2196F3" },
  ];

  const getCategoryColor = (name) =>
    categories.find((c) => c.name === name)?.color ?? "#1a6b6b";

  const getCategoryIcon = (name) =>
    categories.find((c) => c.name === name)?.icon ?? Target;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="initiatives-page">
      <Navbar />

      {/* ── Hero banner ── */}
      <motion.section
        className="initiatives-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="initiatives-eyebrow">Community Action</div>
          <h1 className="page-title">
            Our <em>Initiatives</em>
          </h1>
          <p className="page-description">
            Discover the impactful projects we've undertaken to create positive,
            lasting change across our communities.
          </p>
        </div>
      </motion.section>

      {/* ── Filter bar ── */}
      <motion.section
        className="filter-section"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="filter-tabs">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.name}
                className={`filter-tab${filter === cat.name ? " active" : ""}`}
                onClick={() => setFilter(cat.name)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + idx * 0.06 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon size={14} />
                <span>{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.section>

      {/* ── Initiatives grid ── */}
      <motion.section
        className="initiatives-section"
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container">
          <div className="initiatives-section-label">
            {filter === "All" ? "All Initiatives" : filter}
          </div>

          {loading ? (
            /* Skeleton loader */
            <div className="initiatives-skeleton">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-init-card">
                  <div className="skeleton-img-area"></div>
                  <div className="skeleton-init-body">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line text"></div>
                    <div className="skeleton-line text2"></div>
                    <div className="skeleton-line meta"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="initiatives-grid">
              <div className="no-initiatives">
                <div className="no-initiatives-icon">
                  <Lightbulb size={32} />
                </div>
                <h3>No initiatives found</h3>
                <p>Check back later for new projects and community programmes.</p>
              </div>
            </div>
          ) : (
            <div className="initiatives-grid">
              {filtered.map((initiative, index) => {
                const CategoryIcon = getCategoryIcon(initiative.category);
                const catColor = getCategoryColor(initiative.category);
                const isExpanded = expandedCard === initiative._id;

                return (
                  <motion.div
                    key={initiative._id}
                    className="initiative-card"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: (index % 3) * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {/* Cover photo */}
                    {initiative.photos?.[0] && (
                      <div className="initiative-image">
                        <img
                          src={`http://localhost:5000/${initiative.photos[0]}`}
                          alt={initiative.title}
                          onClick={() =>
                            setFullImage(`http://localhost:5000/${initiative.photos[0]}`)
                          }
                        />
                        {/* Category badge */}
                        <div className="category-badge">
                          <span
                            className="category-badge-dot"
                            style={{ background: catColor }}
                          />
                          <CategoryIcon size={11} />
                          <span>{initiative.category}</span>
                        </div>
                      </div>
                    )}

                    <div className="initiative-content">
                      {/* Title + expand toggle */}
                      <div className="initiative-header">
                        <h3 className="initiative-title">{initiative.title}</h3>
                        <button
                          className="expand-btn"
                          onClick={() =>
                            setExpandedCard(isExpanded ? null : initiative._id)
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

                      {/* Summary */}
                      <p className="initiative-description">
                        {initiative.short_description}
                      </p>

                      {/* Meta */}
                      <div className="initiative-meta">
                        <div className="meta-item">
                          <Calendar size={13} />
                          <span>{formatDate(initiative.date)}</span>
                        </div>
                        <div className="meta-item">
                          <MapPin size={13} />
                          <span>{initiative.location}</span>
                        </div>
                      </div>

                      {/* Impact pill */}
                      {initiative.impact_metrics?.people_helped > 0 && (
                        <div className="impact-pill">
                          <Users size={11} />
                          {initiative.impact_metrics.people_helped.toLocaleString()} people helped
                        </div>
                      )}

                      {/* Expanded content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            className="initiative-expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                          >
                            <div className="expanded-content">
                              {/* Impact stats */}
                              <div className="impact-stats">
                                <h4>Impact Metrics</h4>
                                <div className="stats-grid">
                                  <div className="stat-item">
                                    <Users size={18} />
                                    <div>
                                      <span className="stat-value">
                                        {initiative.impact_metrics?.people_helped?.toLocaleString() || 0}
                                      </span>
                                      <span className="stat-label">People Helped</span>
                                    </div>
                                  </div>
                                  {initiative.impact_metrics?.projects_completed > 0 && (
                                    <div className="stat-item">
                                      <Target size={18} />
                                      <div>
                                        <span className="stat-value">
                                          {initiative.impact_metrics.projects_completed}
                                        </span>
                                        <span className="stat-label">Projects</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Gallery thumbs */}
                              {initiative.photos?.length > 1 && (
                                <div className="initiative-gallery">
                                  <h4>Gallery</h4>
                                  <div className="gallery-grid">
                                    {initiative.photos.slice(1, 4).map((url, idx) => (
                                      <img
                                        key={idx}
                                        src={`http://localhost:5000/${url}`}
                                        alt={`${initiative.title} ${idx + 2}`}
                                        className="gallery-thumb"
                                        onClick={() =>
                                          setFullImage(`http://localhost:5000/${url}`)
                                        }
                                      />
                                    ))}
                                    {initiative.photos.length > 4 && (
                                      <div className="more-photos">
                                        +{initiative.photos.length - 4}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
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

      {/* ── Lightbox ── */}
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
              <X size={20} />
            </button>
            <motion.img
              src={fullImage}
              alt="Full view"
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

export default Initiatives;
