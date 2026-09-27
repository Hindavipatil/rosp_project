import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Images,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import './Gallery.css';

function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [tab, setTab] = useState('photo');
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/gallery');
      setGallery(res.data);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const photos = gallery.filter(item => item.type === 'photo');
  const videos = gallery.filter(item => item.type === 'video');
  const photoUrls = photos.map(p => `http://localhost:5000/${p.url}`);

  const openLightbox = (index) => { setPhotoIndex(index); setIsOpen(true); };
  const closeLightbox = () => setIsOpen(false);
  const nextImage = () => setPhotoIndex((photoIndex + 1) % photoUrls.length);
  const prevImage = () => setPhotoIndex((photoIndex + photoUrls.length - 1) % photoUrls.length);

  const downloadImage = (url, caption) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = caption || 'gallery-image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const shareImage = async (url, caption) => {
    if (navigator.share) {
      try { await navigator.share({ title: caption || 'Gallery Image', url }); }
      catch (e) { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard');
    }
  };

  /* keyboard nav in lightbox */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, photoIndex]);

  return (
    <div className="gallery-page">
      <Navbar />

      {/* ── Hero banner ── */}
      <motion.section
        className="gallery-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="gallery-eyebrow">Visual Archive</div>
          <h1 className="page-title">
            Our <em>Gallery</em>
          </h1>
          <p className="page-description">
            A visual chronicle of our community impact — photos and videos from
            events, initiatives, and milestones that define our journey.
          </p>

          {!loading && (
            <div className="gallery-header-stats">
              <div className="gallery-stat-pill">
                <Images size={13} />
                {photos.length} Photo{photos.length !== 1 ? 's' : ''}
              </div>
              <div className="gallery-stat-pill">
                <Play size={13} />
                {videos.length} Video{videos.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Tab bar ── */}
      <motion.section
        className="gallery-controls"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="gallery-tabs">
          <button
            className={`tab-button${tab === 'photo' ? ' active' : ''}`}
            onClick={() => setTab('photo')}
          >
            <Images size={15} />
            Photos ({photos.length})
          </button>
          <button
            className={`tab-button${tab === 'video' ? ' active' : ''}`}
            onClick={() => setTab('video')}
          >
            <Play size={15} />
            Videos ({videos.length})
          </button>
        </div>
      </motion.section>

      {/* ── Gallery content ── */}
      <motion.section
        className="gallery-content"
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="container">
          <div className="gallery-section-label">
            {tab === 'photo' ? 'Photography' : 'Videos'}
          </div>

          {loading ? (
            /* Skeleton grid */
            <div className="gallery-skeleton-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="skeleton-photo">
                  <div className="skeleton-img-block" />
                  <div className="skeleton-caption-block">
                    <div className="skeleton-line w70" />
                    <div className="skeleton-line w45" />
                  </div>
                </div>
              ))}
            </div>
          ) : tab === 'photo' ? (
            /* ── Photos ── */
            <div className="photo-gallery">
              {photos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Images size={32} /></div>
                  <h3>No photos yet</h3>
                  <p>Photos from our events and initiatives will appear here.</p>
                </div>
              ) : (
                <div className="photo-grid">
                  {photos.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      className="photo-item"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
                      viewport={{ once: true }}
                    >
                      <div className="photo-container">
                        <img
                          src={`http://localhost:5000/${item.url}`}
                          alt={item.caption || `Gallery photo ${idx + 1}`}
                          onClick={() => openLightbox(idx)}
                          loading="lazy"
                        />
                        <div className="photo-overlay">
                          <div className="photo-actions">
                            <button
                              className="action-btn"
                              title="Download"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadImage(`http://localhost:5000/${item.url}`, item.caption);
                              }}
                            >
                              <Download size={14} />
                            </button>
                            <button
                              className="action-btn"
                              title="Share"
                              onClick={(e) => {
                                e.stopPropagation();
                                shareImage(`http://localhost:5000/${item.url}`, item.caption);
                              }}
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      {item.caption && (
                        <div className="photo-caption">
                          <p>{item.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Videos ── */
            <div className="video-gallery">
              {videos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon"><Play size={32} /></div>
                  <h3>No videos yet</h3>
                  <p>Videos from our events and initiatives will appear here.</p>
                </div>
              ) : (
                <div className="video-grid">
                  {videos.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      className="video-item"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="video-container">
                        <iframe
                          src={item.url}
                          title={item.caption || `Video ${idx + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      {item.caption && (
                        <div className="video-caption">
                          <p>{item.caption}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
          >
            <div
              className="lightbox-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
                <X size={18} />
              </button>

              {/* Prev */}
              {photoUrls.length > 1 && (
                <button
                  className="lightbox-nav prev"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Next */}
              {photoUrls.length > 1 && (
                <button
                  className="lightbox-nav next"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  aria-label="Next"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              <motion.div
                className="lightbox-content"
                key={photoIndex}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={photoUrls[photoIndex]}
                  alt={`Gallery image ${photoIndex + 1}`}
                  className="lightbox-image"
                />

                <div className="lightbox-info">
                  <div className="lightbox-counter">
                    {photoIndex + 1} / {photoUrls.length}
                  </div>

                  <div className="lightbox-actions">
                    <button
                      className="action-btn"
                      onClick={() => downloadImage(photoUrls[photoIndex], photos[photoIndex]?.caption)}
                    >
                      <Download size={14} />
                      Download
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => shareImage(photoUrls[photoIndex], photos[photoIndex]?.caption)}
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>

                  {photos[photoIndex]?.caption && (
                    <div className="lightbox-caption">
                      <p>{photos[photoIndex].caption}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Gallery;
