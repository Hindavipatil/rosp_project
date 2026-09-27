import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";
import { 
  Menu as MenuIcon, 
  X as CloseIcon,
  Home as HomeIcon,
  Trophy as TrophyIcon,
  Lightbulb as LightbulbIcon,
  Images as ImagesIcon,
  Calendar as CalendarIcon,
  MessageCircle as MessageIcon,
  Shield as ShieldIcon,
  Sparkles,
  ChevronDown,
  Sun,
  Moon
} from "lucide-react";
import "./Navbar.css";

/* Bridge-arch logo — "Setu" means bridge */
const BridgeLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="18" x2="22" y2="18" />
    <line x1="5" y1="18" x2="5" y2="12" />
    <line x1="19" y1="18" x2="19" y2="12" />
    <path d="M5 12 Q12 4 19 12" />
    <line x1="10" y1="18" x2="10" y2="10.5" />
    <line x1="14" y1="18" x2="14" y2="10.5" />
  </svg>
);

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: "/home",         label: "Home",         icon: HomeIcon      },
    { path: "/achievements",  label: "Achievements", icon: TrophyIcon    },
    { path: "/initiatives",   label: "Initiatives",  icon: LightbulbIcon },
    { path: "/gallery",       label: "Gallery",      icon: ImagesIcon    },
    { path: "/events",        label: "Events",       icon: CalendarIcon  },
    { path: "/chat",          label: "AI Chatbot",   icon: MessageIcon   },
    { path: "/complaints",    label: "Complaints",   icon: MessageIcon   },
    { path: "/contact",       label: "Contact",      icon: MessageIcon   },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleMouseEnter = (index) => {
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="nav-container">
        {/* Logo Section */}
        <motion.div 
          className="logo-section"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link to="/home" className="logo-link">
            <div className="logo-icon">
              <BridgeLogo />
            </div>
            <div className="logo-text">
              <span className="logo-main">LokSetu</span>
              <span className="logo-subtitle">Social Impact</span>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="nav-links">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <motion.div
                key={item.path}
                className="nav-item"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <Link 
                  to={item.path} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-link-content">
                    <div className="nav-icon">
                      <Icon size={20} />
                    </div>
                    <span className="nav-label">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="active-indicator"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
                
                {/* Hover Effect */}
                <motion.div
                  className="nav-hover-effect"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: activeDropdown === index ? 1 : 0,
                    opacity: activeDropdown === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Theme toggle */}
          <motion.button
            className="theme-toggle-btn"
            onClick={toggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </motion.button>

          <motion.div
            className="admin-section"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/admin" className="admin-link">
              <div className="admin-icon">
                <ShieldIcon size={18} />
              </div>
              <span className="admin-text">Admin</span>
              <div className="admin-badge">
                <Sparkles size={12} />
              </div>
            </Link>
          </motion.div>
          
          <motion.button
            className="menu-toggle"
            onClick={toggleMenu}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <MenuIcon size={24} />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="mobile-menu-content">
              <div className="mobile-menu-header">
                <h3>Navigation</h3>
                <motion.button
                  className="mobile-close-btn"
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <CloseIcon size={20} />
                </motion.button>
              </div>
              
              <div className="mobile-nav-items">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <motion.div
                      key={item.path}
                      className="mobile-nav-item"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        to={item.path} 
                        className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="mobile-nav-icon">
                          <Icon size={22} />
                        </div>
                        <span className="mobile-nav-label">{item.label}</span>
                        {isActive && (
                          <motion.div
                            className="mobile-active-indicator"
                            layoutId="mobileActiveIndicator"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              
              <div className="mobile-admin-section">
                <Link 
                  to="/admin" 
                  className="mobile-admin-link"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="mobile-admin-icon">
                    <ShieldIcon size={22} />
                  </div>
                  <span>Admin Login</span>
                  <div className="mobile-admin-badge">
                    <Sparkles size={14} />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;
