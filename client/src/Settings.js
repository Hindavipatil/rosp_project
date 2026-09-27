import { useState, useEffect } from "react";
import NaviBar from "./NaviBar";
import { Settings2, Save, LogOut, Trash2 } from "lucide-react";
import "./Settings.css";

const SOCIAL_NETWORKS = ["facebook", "twitter", "instagram", "linkedin", "youtube"];

function Settings() {
  const [password,     setPassword]     = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone,        setPhone]        = useState("");
  const [logo,         setLogo]         = useState(null);
  const [settings,     setSettings]     = useState({});
  const [socialLinks,  setSocialLinks]  = useState({
    facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "",
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setSettings(data);
          setPassword(data.password || "");
          setContactEmail(data.contactEmail || "");
          setPhone(data.phone || "");
          setSocialLinks({
            facebook:  data.socialLinks?.facebook  || "",
            twitter:   data.socialLinks?.twitter   || "",
            instagram: data.socialLinks?.instagram || "",
            linkedin:  data.socialLinks?.linkedin  || "",
            youtube:   data.socialLinks?.youtube   || "",
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = async () => {
    const fd = new FormData();
    fd.append("password",     password);
    fd.append("contactEmail", contactEmail);
    fd.append("phone",        phone);
    SOCIAL_NETWORKS.forEach(n => fd.append(n, socialLinks[n]));
    if (logo) fd.append("logo", logo);

    try {
      const res  = await fetch("http://localhost:5000/api/settings", { method: "POST", body: fd });
      const data = await res.json();
      console.log("Server response:", data);
      alert("✅ Settings saved successfully!");
      fetch("http://localhost:5000/api/settings")
        .then(r => r.json())
        .then(d => setSettings(d));
    } catch (err) {
      console.error(err);
      alert("❌ Error saving settings");
    }
  };

  const handleDeleteLogo = async () => {
    if (!window.confirm("Are you sure you want to delete the current logo?")) return;
    try {
      const res  = await fetch("http://localhost:5000/api/settings/logo", { method: "DELETE" });
      const data = await res.json();
      alert(data.message);
      setSettings({ ...settings, logo: null });
      setLogo(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting logo");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("email");
    window.location.href = "/";
  };

  return (
    <div className="settings-page">
      <NaviBar />
      <div className="settings-container">

        {/* Heading */}
        <div className="settings-eyebrow">
          <Settings2 size={12} /> Admin · Settings
        </div>
        <h1 className="settings-title">
          Site Settings
        </h1>

        {/* Password card */}
        <div className="settings-card">
          <h2>Change Admin Password</h2>
          <div className="settings-field">
            <label className="settings-field-label">New Password</label>
            <input
              type="password"
              className="settings-input"
              placeholder="Enter new password…"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Contact info card */}
        <div className="settings-card">
          <h2>Contact Info &amp; Logo</h2>

          <div className="settings-field">
            <label className="settings-field-label">Contact Email</label>
            <input
              type="email"
              className="settings-input"
              placeholder="contact@loksetu.org"
              value={contactEmail}
              onChange={e => setContactEmail(e.target.value)}
            />
          </div>

          <div className="settings-field">
            <label className="settings-field-label">Phone Number</label>
            <input
              type="text"
              className="settings-input"
              placeholder="+91 00000 00000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {/* Current logo */}
          {settings.logo && (
            <div className="settings-logo-preview">
              <img
                src={`http://localhost:5000/${settings.logo}`}
                alt="Current Logo"
                className="settings-logo-img"
              />
              <button type="button" className="delete-logo-btn" onClick={handleDeleteLogo}>
                <Trash2 size={12} /> Delete Logo
              </button>
            </div>
          )}

          <div className="settings-field">
            <label className="settings-field-label">Upload New Logo</label>
            <input
              type="file"
              className="settings-input"
              accept="image/*"
              onChange={e => setLogo(e.target.files[0])}
            />
          </div>
        </div>

        {/* Social links card */}
        <div className="settings-card">
          <h2>Social Media Links</h2>
          {SOCIAL_NETWORKS.map(network => (
            <div key={network} className="social-field">
              <label className="social-network-label">{network}</label>
              <input
                type="text"
                className="settings-input"
                placeholder={`https://${network}.com/loksetu`}
                value={socialLinks[network]}
                onChange={e => setSocialLinks({ ...socialLinks, [network]: e.target.value })}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="settings-buttons">
          <button onClick={handleSave} className="btn-save">
            <Save size={16} /> Save Settings
          </button>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={14} /> Log Out
          </button>
        </div>

      </div>
    </div>
  );
}

export default Settings;