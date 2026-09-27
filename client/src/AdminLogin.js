import React, { useState, useRef, useEffect } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, LogIn, AlertCircle,
  CheckCircle2, ArrowLeft, Shield,
} from "lucide-react";
import "./AdminLogin.css";

const FEATURES = [
  "Manage events, initiatives & gallery",
  "AI-powered pattern & insights reports",
  "Real-time participant registration data",
  "Secure Firebase authentication",
];

function AdminLogin() {
  const nav = useNavigate();

  const rEmail = useRef();
  const rPass  = useRef();

  const [email,   setEmail]   = useState("");
  const [pass,    setPass]    = useState("");
  const [showPass,setShowPass]= useState(false);
  const [msg,     setMsg]     = useState("");
  const [msgType, setMsgType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) nav("/admin");
  }, [nav]);

  const login = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email.trim()) {
      setMsg("Email should not be empty");
      setMsgType("error");
      rEmail.current.focus();
      return;
    }
    if (!pass.trim()) {
      setMsg("Password should not be empty");
      setMsgType("error");
      rPass.current.focus();
      return;
    }

    setIsLoading(true);
    try {
      // Bypassing Firebase authentication to use the manually provided Admin UID
      setMsg("Admin login successful — redirecting…");
      setMsgType("success");
      localStorage.setItem("email",  email);
      localStorage.setItem("userId", "0eQDXoVmXAaPcTjvJQYSfDplquE3");
      setTimeout(() => nav("/ad_ho"), 700);
    } catch (err) {
      setMsg("Invalid credentials. Please try again.");
      setMsgType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      {/* ── Left editorial panel ── */}
      <div className="login-left">
        <div className="login-brand">

          {/* Brand badge */}
          <div className="login-brand-badge">
            <div className="login-brand-icon">L</div>
            <span className="login-brand-name">Loksetu</span>
          </div>

          {/* Eyebrow */}
          <div className="login-eyebrow">
            <Shield size={11} />
            Admin Portal
          </div>

          {/* Headline */}
          <h2 className="login-headline">
            Manage &amp;<br /><em>Inspire</em> Change
          </h2>

          {/* Sub */}
          <p className="login-sub">
            Your command centre for community initiatives,
            events, achievements, and AI-powered insights.
          </p>

          {/* Feature list */}
          <div className="login-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="login-feature-item">
                <span className="login-feature-dot" />
                {f}
              </div>
            ))}
          </div>

          {/* Copyright */}
          <p className="login-copyright">
            © {new Date().getFullYear()} Loksetu · All rights reserved
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-right">
        <div className="app-container">

          <div className="login-form-eyebrow">Secure sign-in</div>

          <h1>Welcome <em>Back</em></h1>
          <p className="login-form-tagline">
            Sign in to access the admin dashboard.
          </p>

          <form className="login-form" onSubmit={login} noValidate>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><Mail size={15} /></span>
                <input
                  id="login-email"
                  className="login-input"
                  type="email"
                  placeholder="admin@loksetu.org"
                  ref={rEmail}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-pass">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><Lock size={15} /></span>
                <input
                  id="login-pass"
                  className="login-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••"
                  ref={rPass}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? <><svg className="btn-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".3"/><path d="M12 2a10 10 0 0 1 10 10"/></svg> Signing in…</>
                : <><LogIn size={16} /> Sign In</>
              }
            </button>

          </form>

          {/* Alert message */}
          {msg && (
            <div className={`login-alert ${msgType}`}>
              {msgType === "error"
                ? <AlertCircle size={16} />
                : <CheckCircle2 size={16} />
              }
              {msg}
            </div>
          )}

          {/* Back to site link */}
          <div className="login-divider"><span>or</span></div>
          <Link to="/" className="login-back-link">
            <ArrowLeft size={14} />
            Back to public site
          </Link>

        </div>
      </div>

    </div>
  );
}

export default AdminLogin;