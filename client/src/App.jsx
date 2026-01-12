import React, { useState } from "react";
import "./index.css";
import Users from "./components/Users";
import UserLogin from "./components/UserLogin";
import Click2Call from "./components/Click2Call";
import CDR from "./components/CDR";
import Notes from "./components/Notes";
import CallAnalysis from "./components/CallAnalysis";
import AdminClick2Call from "./components/AdminClick2Call";
import LiveCalls from "./components/LiveCalls";
import WebRTCCall from "./components/WebRTCCall";

function App() {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    { id: "users", label: "Users" },
    { id: "login", label: "User Login" },
    // { id: "click2call", label: "Click2Call" },
    { id: "admin-click2call", label: "Click2Call (PSTN Calling)" },
    { id: "webrtc", label: "WebRTC Calls" },
    { id: "cdr", label: "Call Records" },
    // { id: "notes", label: "Notes" },
    // { id: "analysis", label: "Call Analysis" },
    // { id: "live", label: "Live Calls" },
  ];

  return (
    <div className="container">
      <div className="header">
        <h1>TeleCMI API Calling App</h1>
        <p>Complete API integration for TeleCMI services</p>
        <div className="nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "users" && <Users />}
      {activeTab === "login" && <UserLogin />}
      {/* {activeTab === "click2call" && <Click2Call />} */}
      {activeTab === "admin-click2call" && <AdminClick2Call />}
      {activeTab === "webrtc" && <WebRTCCall />}
      {activeTab === "cdr" && <CDR />}
      {/* {activeTab === "notes" && <Notes />} */}
      {/* {activeTab === "analysis" && <CallAnalysis />} */}
      {/* {activeTab === "live" && <LiveCalls />} */}
    </div>
  );
}

export default App;
