import './App.css';
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "./ThemeContext";

import Home from "./Home";
import Achievements from "./Achievements";
import Initiatives from "./Initiatives";
import Gallery from "./Gallery";
import Events from "./Events";
import Contact from "./Contact";
import AdminLogin from "./AdminLogin";
import AdminHome from "./AdminHome";
import ManageInitiatives from "./ManageInitiatives";
import ManageEvents from "./ManageEvents";
import ManageAchievements from "./ManageAchievements";
import ManageGallery from "./ManageGallery";
import Settings from "./Settings";
import ViewSubmissions from "./ViewSubmissions";
import ChatPage from "./pages/ChatPage";
import ChatWidget from "./components/ChatWidget";
import AdminAnalytics from "./pages/AdminAnalytics";
import ComplaintsPublic from "./ComplaintsPublic";
import ManageComplaints from "./ManageComplaints";

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Routes>
          <Route path="/home"        element={<Home />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/initiatives"  element={<Initiatives />} />
          <Route path="/gallery"      element={<Gallery />} />
          <Route path="/events"       element={<Events />} />
          <Route path="/contact"      element={<Contact />} />
          <Route path="/admin"        element={<AdminLogin />} />
          <Route path="/ad_ho"        element={<AdminHome />} />
          <Route path="/man_init"     element={<ManageInitiatives />} />
          <Route path="/man_eve"      element={<ManageEvents />} />
          <Route path="/man_achive"   element={<ManageAchievements />} />
          <Route path="/man_gal"      element={<ManageGallery />} />
          <Route path="/sett"         element={<Settings />} />
          <Route path="/vvs"          element={<ViewSubmissions />} />
          <Route path="/chat"         element={<ChatPage />} />
          <Route path="/ad_ho/analytics" element={<AdminAnalytics />} />
          <Route path="/complaints"   element={<ComplaintsPublic />} />
          <Route path="/man_comp"     element={<ManageComplaints />} />
          <Route path="/"             element={<Home />} />
        </Routes>
        <ChatWidget />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
