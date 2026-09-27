import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import {
  Home, Users, Calendar, Award,
  Image as ImageIcon, Inbox, Settings,
  Menu, X, LogIn, Sun, Moon, BarChart, MessageSquare
} from "lucide-react";
import "./NaviBar.css";

/* Bridge-arch logo — "Setu" means bridge */
const BridgeLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {/* road base */}
    <line x1="2" y1="18" x2="22" y2="18" />
    {/* left pillar */}
    <line x1="5" y1="18" x2="5" y2="12" />
    {/* right pillar */}
    <line x1="19" y1="18" x2="19" y2="12" />
    {/* arch span */}
    <path d="M5 12 Q12 4 19 12" />
    {/* two hangers */}
    <line x1="10" y1="18" x2="10" y2="10.5" />
    <line x1="14" y1="18" x2="14" y2="10.5" />
  </svg>
);

const NAV_ITEMS = [
  { to: "/ad_ho",     label: "Home",         icon: Home      },
  { to: "/man_init",  label: "Initiatives",  icon: Users     },
  { to: "/man_eve",   label: "Events",       icon: Calendar  },
  { to: "/man_achive",label: "Achievements", icon: Award     },
  { to: "/man_gal",   label: "Gallery",      icon: ImageIcon },
  { to: "/vvs",       label: "Submissions",  icon: Inbox     },
  { to: "/man_comp",  label: "Complaints",   icon: MessageSquare },
  { to: "/ad_ho/analytics", label: "Analytics", icon: BarChart },
  { to: "/sett",      label: "Settings",     icon: Settings  },
];

function NaviBar() {
  const location  = useLocation();
  const [email,    setEmail]   = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme,   toggle }    = useTheme();

  useEffect(() => {
    setEmail(localStorage.getItem("email"));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`admin-navbar${scrolled ? " scrolled" : ""}`}>
      <div className="admin-nav-inner">

        {/* ── Logo ── */}
        <div className="logo-section">
          <Link to="/ad_ho" className="logo-link">
            <div className="logo-icon">
              <BridgeLogo />
            </div>
            <div className="logo-text">
              <span className="logo-main">LokSetu</span>
              <span className="logo-subtitle">Admin Portal</span>
            </div>
          </Link>
        </div>

        {/* ── Desktop links (only when logged in) ── */}
        {email && (
          <div className="admin-nav-links">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={isActive(to) ? "active" : ""}
              >
                <span className="nav-ico"><Icon size={15} /></span>
                <span className="nav-lbl">{label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* ── Right actions ── */}
        <div className="admin-nav-actions">
          {/* Theme toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!email && (
            <Link to="/" className="admin-login-chip">
              <LogIn size={14} />
              <span className="admin-chip-text">Sign In</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          {email && (
            <button
              className="admin-menu-toggle"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>

      </div>

      {/* ── Mobile drawer ── */}
      {email && (
        <div className={`admin-mobile-menu${menuOpen ? " open" : ""}`}>
          <div className="admin-mobile-inner">
            <div className="admin-mobile-header">
              <span>Navigation</span>
              <button
                className="admin-mobile-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="admin-mobile-links">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={isActive(to) ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="nav-ico"><Icon size={18} /></span>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NaviBar;
