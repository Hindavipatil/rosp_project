import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { 
  Heart, 
  Users, 
  Calendar, 
  Award, 
  ArrowRight, 
  Star,
  Target,
  TrendingUp,
  Globe,
  Shield,
  Clock,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone
} from "lucide-react";
import Navbar from "./Navbar";
import "./Home.css";
import { HashLink } from "react-router-hash-link";
import axios from "axios";

function Home() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [settings, setSettings] = useState({});
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: ""
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 50]);

  useEffect(() => {
    fetchUpcomingEvents();
    fetchSettings();
    
    const interval = setInterval(() => {
      fetchSettings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/settings");
      if (res.data) {
        setSettings(res.data);
        setSocialLinks({
          facebook: res.data.socialLinks?.facebook || "",
          twitter: res.data.socialLinks?.twitter || "",
          instagram: res.data.socialLinks?.instagram || "",
          linkedin: res.data.socialLinks?.linkedin || "",
          youtube: res.data.socialLinks?.youtube || ""
        });
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await axios.get("http://localhost:5000/api/events");
      const upcoming = res.data.filter(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        return eventDate > now && event.status?.toLowerCase() === "open";
      });
      setUpcomingEvents(upcoming.slice(0, 5));
    } catch (err) {
      console.error("Error fetching upcoming events:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const stats = [
    { icon: Users, value: "500+", label: "Lives Impacted" },
    { icon: Heart, value: "50+", label: "Initiatives" },
    { icon: Calendar, value: "100+", label: "Events Organized" },
    { icon: Award, value: "25+", label: "Awards Received" }
  ];

  const features = [
    {
      icon: Target,
      title: "Community Development",
      description: "Empowering communities through sustainable development programs and initiatives.",
      color: "linear-gradient(135deg, #2E7D32, #4CAF50)"
    },
    {
      icon: Users,
      title: "Social Welfare",
      description: "Dedicated to improving lives through comprehensive social welfare programs.",
      color: "linear-gradient(135deg, #FF6F00, #FF9800)"
    },
    {
      icon: Globe,
      title: "Environmental Care",
      description: "Protecting our planet through tree plantation and environmental awareness campaigns.",
      color: "linear-gradient(135deg, #1976D2, #42A5F5)"
    },
    {
      icon: Shield,
      title: "Women Empowerment",
      description: "Creating opportunities and supporting women in their journey towards independence.",
      color: "linear-gradient(135deg, #7B1FA2, #BA68C8)"
    }
  ];

  return (
    <div className="home-page">
      <Navbar />

      {/* ── Upcoming Events Marquee ── */}
      {upcomingEvents.length > 0 && (
        <motion.section 
          className="events-marquee-section"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="marquee-container">
            <div className="marquee-header">
              <Calendar size={14} />
              <span>Upcoming</span>
            </div>
            <div className="marquee-content">
              <div className="marquee-track">
                {[...upcomingEvents, ...upcomingEvents].map((event, index) => (
                  <div key={`${event._id}-${index}`} className="marquee-item">
                    <div className="event-info">
                      <h4>{event.title}</h4>
                      <div className="event-meta">
                        <span>
                          <Calendar size={11} />
                          {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {event.venue && (
                          <span>
                            <MapPin size={11} />
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="marquee-separator">◆</div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/events" className="marquee-link">
              View All
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.section>
      )}

      {/* ── Hero Section ── */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated background */}

        <div className="hero-content">
          {/* Left: text */}
          <div className="hero-text">
            <div className="hero-eyebrow">
              Building Stronger Communities
            </div>

            <h1 className="hero-title">
              <span className="title-main">
                Lok<span className="accent-word">Setu</span>
              </span>
              <span className="title-subtitle">Social Impact Platform</span>
            </h1>

            <p className="hero-description">
              Where Leadership Meets People. Building stronger communities through
              dedicated social work, impactful initiatives, and meaningful change.
            </p>

            <div className="hero-actions" style={{ display: 'flex' }}>
              <Link to="/initiatives" className="btn-primary">
                Explore Our Work
                <ArrowRight size={18} />
              </Link>
              <HashLink smooth to="/events#upcoming" className="btn-outline">
                Upcoming Events
              </HashLink>
            </div>
          </div>

          {/* Right: visual frame */}
          <motion.div 
            className="hero-image"
            style={{ y: y1 }}
          >
            <div className="hero-visual-frame">
              {/* Corner decorations */}
              <div className="frame-corner tl"></div>
              <div className="frame-corner tr"></div>
              <div className="frame-corner bl"></div>
              <div className="frame-corner br"></div>
            </div>

            {/* Floating stat pills */}
            <div className="floating-card card-1">
              <div className="card-icon">
                <Heart size={18} />
              </div>
              <div>
                <span className="card-label">Community</span>
                <span className="card-value">Impact</span>
              </div>
            </div>

            <div className="floating-card card-2">
              <div className="card-icon">
                <Users size={18} />
              </div>
              <div>
                <span className="card-label">Lives Touched</span>
                <span className="card-value">500+</span>
              </div>
            </div>

            <div className="floating-card card-3">
              <div className="card-icon">
                <Award size={18} />
              </div>
              <div>
                <span className="card-label">Awards</span>
                <span className="card-value">25+</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Stats Section ── */}
      <motion.section 
        className="stats-section"
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="stat-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="stat-icon">
                    <Icon size={26} />
                  </div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Features Section ── */}
      <section className="features-section">
        <div className="section-header">
          <div>
            <div className="section-label">What We Do</div>
            <h2 className="section-title">Our <em>Impact</em> Areas</h2>
          </div>
          <p className="section-description">
            We focus on multiple dimensions of social change to create comprehensive,
            lasting impact across communities.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="feature-card"
                data-index={`0${index + 1}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div 
                  className="feature-icon"
                  style={{ background: feature.color }}
                >
                  <Icon size={26} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <Link to="/initiatives" className="feature-arrow">
                  Learn more <ArrowRight size={12} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <motion.section 
        className="cta-section"
        style={{ y: y2 }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="cta-grid">
          <motion.div 
            className="cta-card journey-card"
            whileHover={{ scale: 1.01 }}
          >
            <div>
              <div className="cta-tag">Our Story</div>
              <div className="cta-content">
                <h3>Our Journey</h3>
                <p>Discover the stories of impact and transformation in our communities.</p>
              </div>
            </div>
            <div className="cta-bottom">
              <Link to="/initiatives" className="cta-link">
                View Our Journey
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="cta-large-icon">↗</div>
          </motion.div>

          <motion.div 
            className="cta-card gallery-card"
            whileHover={{ scale: 1.01 }}
          >
            <div>
              <div className="cta-tag">Gallery</div>
              <div className="cta-content">
                <h3>Featured Projects</h3>
                <p>Explore our past projects and see the tangible impact we've created.</p>
              </div>
            </div>
            <div className="cta-bottom">
              <Link to="/gallery" className="cta-link">
                View Gallery
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="cta-large-icon">◈</div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            {/* Brand */}
            <div className="footer-brand">
              <h3>LokSetu</h3>
              <p className="tagline">Building stronger communities through social impact and meaningful change.</p>
              {settings.contactEmail && (
                <div className="footer-contact-item">
                  <Mail size={14} />
                  {settings.contactEmail}
                </div>
              )}
              {settings.phone && (
                <div className="footer-contact-item">
                  <Phone size={14} />
                  {settings.phone}
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="footer-nav">
              <h4>Navigate</h4>
              <ul className="footer-nav-links">
                <li><Link to="/initiatives">Initiatives</Link></li>
                <li><Link to="/events">Events</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
                <li><Link to="/achievements">Achievements</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </nav>

            {/* Social */}
            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a 
                  href={socialLinks.facebook || "https://facebook.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                  <span>Facebook</span>
                </a>
                <a 
                  href={socialLinks.twitter || "https://twitter.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link twitter"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                  <span>Twitter</span>
                </a>
                <a 
                  href={socialLinks.instagram || "https://instagram.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                  <span>Instagram</span>
                </a>
                <a 
                  href={socialLinks.linkedin || "https://linkedin.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link linkedin"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                  <span>LinkedIn</span>
                </a>
                <a 
                  href={socialLinks.youtube || "https://youtube.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link youtube"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 LokSetu. All rights reserved.</p>
            <span className="footer-bottom-badge">Made with ♥ for community</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
