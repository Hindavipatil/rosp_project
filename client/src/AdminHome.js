import NaviBar from "./NaviBar";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users, Calendar, Image as ImageIcon, Award,
  LogOut, ArrowRight, BarChart2, Download, Loader2, MessageSquare
} from "lucide-react";
import "./AdminHome.css";
import AIInsightDashboard from "./components/AIInsightDashboard";

function AdminHome() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [stats, setStats] = useState({ initiatives: 0, events: 0, achievements: 0, gallery: 0 });
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [globalKpi, setGlobalKpi] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    const e = localStorage.getItem("email");
    if (e !== null) { setEmail(e); }
    else             { nav("/admin"); }
  }, [nav]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [iniRes, evRes, achRes, galRes] = await Promise.all([
          fetch("http://localhost:5000/api/initiatives").then(r => r.ok ? r.json() : []).catch(() => []),
          fetch("http://localhost:5000/api/events").then(r => r.ok ? r.json() : []).catch(() => []),
          fetch("http://localhost:5000/api/achievements").then(r => r.ok ? r.json() : []).catch(() => []),
          fetch("http://localhost:5000/api/gallery").then(r => r.ok ? r.json() : []).catch(() => []),
        ]);
        setStats({
          initiatives:  Array.isArray(iniRes) ? iniRes.length  : 0,
          events:       Array.isArray(evRes)  ? evRes.length   : 0,
          achievements: Array.isArray(achRes) ? achRes.length  : 0,
          gallery:      Array.isArray(galRes) ? galRes.length  : 0,
        });
      } catch { /* keep defaults */ }
      finally { setLoading(false); }
    };
    fetchCounts();
  }, []);

  const lo = (e) => {
    e.preventDefault();
    localStorage.removeItem("email");
    nav("/");
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setReportData(null);
    try {
      const [repRes, evRes, kpiRes] = await Promise.all([
        fetch("http://localhost:5000/api/reports/generate", { method: "POST" }),
        fetch("http://localhost:5000/api/events"),
        fetch("http://localhost:5000/api/analytics/kpi")
      ]);
      const repData = await repRes.json();
      const evData = await evRes.json();
      const kpiData = await kpiRes.json();

      setEventsData(evData);
      setGlobalKpi(kpiData);
      setReportData(repData.eventReports ? repData : { error: "Failed to generate predictive report." });
    } catch (err) {
      console.error(err);
      setReportData({ error: "Error connecting to the analytical ML API." });
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = () => {
    try {
      if (!reportData?.eventReports) return;
      let txt = `Loksetu Organizational Insights\n\n`;
      txt += `== Global Summary ==\n${reportData.globalSummary}\n\n`;
      txt += `== Event Insights ==\n`;
      reportData.eventReports.forEach(e => { txt += `- ${e.eventName}\n  ${e.summary}\n`; });
      txt += `\n== Recommendations ==\n${reportData.recommendations.replace(/\\n/g, "\n")}`;
      const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Loksetu_Report.txt");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error generating file:", err);
    }
  };

  const statCards = [
    { icon: <Users size={22} />,     cls: "green",  label: "Initiatives",  key: "initiatives",  to: "/man_init"   },
    { icon: <Calendar size={22} />,  cls: "blue",   label: "Events",       key: "events",       to: "/man_eve"    },
    { icon: <Award size={22} />,     cls: "amber",  label: "Achievements", key: "achievements", to: "/man_achive" },
    { icon: <ImageIcon size={22} />, cls: "orange", label: "Gallery Items",key: "gallery",      to: "/man_gal"    },
    { icon: <MessageSquare size={22} />, cls: "purple", label: "Complaints",key: "complaints",  to: "/man_comp"   },
  ];

  const quickActions = [
    { icon: <Users size={20} />,     label: "Add Initiative",  to: "/man_init"   },
    { icon: <Calendar size={20} />,  label: "Create Event",    to: "/man_eve"    },
    { icon: <Award size={20} />,     label: "Add Achievement", to: "/man_achive" },
    { icon: <ImageIcon size={20} />, label: "Upload Media",    to: "/man_gal"    },
    { icon: <MessageSquare size={20} />, label: "Manage Complaints", to: "/man_comp" },
  ];

  return (
    <>
      <NaviBar />
      <div className="admin-home-page">
        <div className="admin-container">

          {/* ── Hero ── */}
          <section className="admin-hero">
            <div className="admin-hero-text">
              <div className="admin-eyebrow">
                <BarChart2 size={12} />
                Control Panel
              </div>
              <h1>Admin Dashboard</h1>
              <p>Logged in as {email || "Administrator"} · Manage your content below.</p>
            </div>
            <form onSubmit={lo} className="logout-form">
              <button type="submit" className="logout-btn">
                <LogOut size={15} />
                Log Out
              </button>
            </form>
          </section>

          {/* ── Stats ── */}
          <div className="admin-section-label">Overview</div>
          <section className="stats-grid">
            {statCards.map((sc, idx) => (
              <div
                key={sc.key}
                className="stat-card"
                data-index={String(idx + 1).padStart(2, "0")}
              >
                <div className={`stat-icon ${sc.cls}`}>{sc.icon}</div>
                <div className="stat-value">{loading ? "—" : stats[sc.key]}</div>
                <div className="stat-label">{sc.label}</div>
                <Link to={sc.to} className="stat-link">
                  Manage <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </section>

          {/* ── Quick actions ── */}
          <section className="quick-actions">
            <div className="admin-section-label">Quick Actions</div>
            <div className="actions-grid">
              {quickActions.map((a) => (
                <Link key={a.to} to={a.to} className="action-card">
                  {a.icon}
                  <span>{a.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── AI Report ── */}
          <section className="report-section">
            <div className="report-header">
              <div className="report-header-text">
                <h3>Automated Pattern &amp; Insights Report</h3>
                <p>
                  Generate a natural-language summary analysing events, volunteers,
                  duplicates, and capacity bottlenecks using the ML pipeline.
                </p>
              </div>
              <button
                className="generate-btn"
                onClick={handleGenerateReport}
                disabled={generatingReport}
              >
                {generatingReport
                  ? <><Loader2 size={16} className="spin" /> Running Pipeline…</>
                  : <><BarChart2 size={16} /> Generate AI Insights</>
                }
              </button>
            </div>

            {/* Error */}
            {reportData?.error && (
              <div className="report-error">{reportData.error}</div>
            )}

            {/* Output */}
            {reportData?.eventReports && (
              <div className="report-output">
                <AIInsightDashboard reportData={reportData} eventsData={eventsData} globalKpi={globalKpi} />

                <button className="download-btn" onClick={downloadReport} style={{marginTop: 30}}>
                  <Download size={14} />
                  Download Raw Report
                </button>
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}

export default AdminHome;
