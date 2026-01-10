import React, { useState, useEffect, useRef } from "react";
import PIOPIY from "piopiyjs";

const WebRTCCall = () => {
  const [piopiy, setPiopiy] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({
    user_id: "",
    password: "",
    sbc_uri: "sbcind.telecmi.com",
    display_name: "TeleCMI User",
  });
  const [callData, setCallData] = useState({
    phoneNumber: "",
    extraParams: {},
  });
  const [callStatus, setCallStatus] = useState({
    status: "idle", // idle, ringing, calling, answered, ended
    callId: null,
    incomingCall: null,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [logs, setLogs] = useState([]);
  const audioRef = useRef(null);
  const piopiyRef = useRef(null);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const setupEventListeners = (piopiyInstance) => {
    // Login events
    piopiyInstance.on("login", (object) => {
      if (object.code === 200) {
        setIsLoggedIn(true);
        setSuccess("Login successful!");
        addLog("Login successful", "success");
      } else {
        setError(`Login failed: ${object.msg || "Unknown error"}`);
        addLog(`Login failed: ${JSON.stringify(object)}`, "error");
      }
    });

    piopiyInstance.on("loginFailed", (object) => {
      setIsLoggedIn(false);
      setError(`Login failed: ${object.msg || "Invalid credentials"}`);
      addLog(`Login failed: ${JSON.stringify(object)}`, "error");
    });

    // Call events
    piopiyInstance.on("trying", (object) => {
      if (object.code === 100) {
        setCallStatus((prev) => ({ ...prev, status: "calling" }));
        addLog("Call is being initiated...", "info");
      }
    });

    piopiyInstance.on("ringing", (object) => {
      setCallStatus((prev) => ({ ...prev, status: "ringing" }));
      addLog("Call is ringing...", "info");
    });

    piopiyInstance.on("answered", (object) => {
      if (object.code === 200) {
        setCallStatus((prev) => ({ ...prev, status: "answered" }));
        addLog("Call answered", "success");
      }
    });

    piopiyInstance.on("callStream", (object) => {
      addLog("Media stream established", "success");
      // Handle audio stream if needed
      if (object.stream && audioRef.current) {
        audioRef.current.srcObject = object.stream;
      }
    });

    // Incoming call
    piopiyInstance.on("inComingCall", (object) => {
      setCallStatus({
        status: "ringing",
        incomingCall: object,
        callId: object.callId || null,
      });
      addLog(`Incoming call from: ${object.from || "Unknown"}`, "info");
      setSuccess("Incoming call!");
    });

    // Hangup
    piopiyInstance.on("hangup", (object) => {
      if (object.code === 200) {
        setCallStatus({ status: "ended", callId: null, incomingCall: null });
        addLog("Call ended", "info");
      }
    });

    // Ended
    piopiyInstance.on("ended", (object) => {
      setCallStatus({ status: "idle", callId: null, incomingCall: null });
      addLog("Call ended", "info");
    });

    // Hold/Unhold
    piopiyInstance.on("hold", (object) => {
      if (object.code === 200) {
        addLog("Call on hold", "info");
      }
    });

    piopiyInstance.on("unhold", (object) => {
      if (object.code === 200) {
        addLog("Call resumed", "info");
      }
    });

    // Transfer
    piopiyInstance.on("transfer", (object) => {
      if (object.code === 100) {
        addLog("Call transfer initiated", "info");
      }
    });

    // Error
    piopiyInstance.on("error", (object) => {
      setError(`Error: ${object.msg || "Unknown error"}`);
      addLog(`Error: ${JSON.stringify(object)}`, "error");
    });

    // Logout
    piopiyInstance.on("logout", (object) => {
      if (object.code === 200) {
        setIsLoggedIn(false);
        addLog("Logged out successfully", "info");
      }
    });
  };

  useEffect(() => {
    // Initialize PIOPIY SDK when component mounts
    try {
      const piopiyInstance = new PIOPIY({
        name: "TeleCMI User",
        debug: true,
        autoplay: true,
        ringTime: 60,
      });

      // Set up event listeners
      setupEventListeners(piopiyInstance);
      setPiopiy(piopiyInstance);
      piopiyRef.current = piopiyInstance;
      addLog("PIOPIY SDK initialized", "info");
    } catch (err) {
      addLog(`PIOPIY SDK initialization error: ${err.message}`, "error");
      setError(`Failed to initialize PIOPIY SDK: ${err.message}`);
    }

    return () => {
      // Cleanup on unmount
      if (piopiyRef.current) {
        try {
          piopiyRef.current.logout();
        } catch (e) {
          console.error("Error during cleanup:", e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!piopiy) {
      setError("PIOPIY SDK not initialized");
      return;
    }

    try {
      piopiy.login(loginData.user_id, loginData.password, loginData.sbc_uri);
      addLog(`Attempting login for user: ${loginData.user_id}`, "info");
    } catch (err) {
      setError(`Login error: ${err.message}`);
      addLog(`Login error: ${err.message}`, "error");
    }
  };

  const handleLogout = () => {
    if (piopiy && isLoggedIn) {
      try {
        piopiy.logout();
        setIsLoggedIn(false);
        setCallStatus({ status: "idle", callId: null, incomingCall: null });
        setSuccess("Logged out");
      } catch (err) {
        setError(`Logout error: ${err.message}`);
      }
    }
  };

  const handleMakeCall = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!piopiy || !isLoggedIn) {
      setError("Please login first");
      return;
    }

    if (!callData.phoneNumber) {
      setError("Please enter a phone number");
      return;
    }

    try {
      if (Object.keys(callData.extraParams).length > 0) {
        piopiy.call(callData.phoneNumber, callData.extraParams);
      } else {
        piopiy.call(callData.phoneNumber);
      }
      setCallStatus((prev) => ({
        ...prev,
        status: "calling",
        callId: piopiy.getCallId(),
      }));
      addLog(`Calling ${callData.phoneNumber}`, "info");
    } catch (err) {
      setError(`Call error: ${err.message}`);
      addLog(`Call error: ${err.message}`, "error");
    }
  };

  const handleAnswer = () => {
    if (piopiy && callStatus.incomingCall) {
      try {
        piopiy.answer();
        setCallStatus((prev) => ({ ...prev, status: "answered" }));
        setSuccess("Call answered");
        addLog("Call answered", "success");
      } catch (err) {
        setError(`Answer error: ${err.message}`);
      }
    }
  };

  const handleReject = () => {
    if (piopiy && callStatus.incomingCall) {
      try {
        piopiy.reject();
        setCallStatus({ status: "idle", callId: null, incomingCall: null });
        addLog("Call rejected", "info");
      } catch (err) {
        setError(`Reject error: ${err.message}`);
      }
    }
  };

  const handleHangup = () => {
    if (piopiy && callStatus.status !== "idle") {
      try {
        piopiy.terminate();
        setCallStatus({ status: "idle", callId: null, incomingCall: null });
        addLog("Call terminated", "info");
      } catch (err) {
        setError(`Hangup error: ${err.message}`);
      }
    }
  };

  const handleHold = () => {
    if (piopiy && callStatus.status === "answered") {
      try {
        piopiy.hold();
        addLog("Call on hold", "info");
      } catch (err) {
        setError(`Hold error: ${err.message}`);
      }
    }
  };

  const handleUnhold = () => {
    if (piopiy && callStatus.status === "answered") {
      try {
        piopiy.unHold();
        addLog("Call resumed", "info");
      } catch (err) {
        setError(`Unhold error: ${err.message}`);
      }
    }
  };

  const handleMute = () => {
    if (piopiy && callStatus.status === "answered") {
      try {
        piopiy.mute();
        addLog("Call muted", "info");
      } catch (err) {
        setError(`Mute error: ${err.message}`);
      }
    }
  };

  const handleUnmute = () => {
    if (piopiy && callStatus.status === "answered") {
      try {
        piopiy.unMute();
        addLog("Call unmuted", "info");
      } catch (err) {
        setError(`Unmute error: ${err.message}`);
      }
    }
  };

  return (
    <div>
      <div className="card">
        <h2>WebRTC Calls (PIOPIY SDK)</h2>
        <p>Make and receive WebRTC calls using PIOPIY SDK</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Login Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3>Login</h3>
          {!isLoggedIn ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>User ID *</label>
                <input
                  type="text"
                  value={loginData.user_id}
                  onChange={(e) =>
                    setLoginData({ ...loginData, user_id: e.target.value })
                  }
                  required
                  placeholder="User ID"
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                  placeholder="Password"
                />
              </div>
              <div className="form-group">
                <label>SBC URI *</label>
                <input
                  type="text"
                  value={loginData.sbc_uri}
                  onChange={(e) =>
                    setLoginData({ ...loginData, sbc_uri: e.target.value })
                  }
                  required
                  placeholder="SBC URI (e.g., sbc.telecmi.com)"
                />
              </div>
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={loginData.display_name}
                  onChange={(e) =>
                    setLoginData({ ...loginData, display_name: e.target.value })
                  }
                  placeholder="Display Name"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>
          ) : (
            <div>
              <p>Logged in as: {loginData.user_id}</p>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Incoming Call Alert */}
        {callStatus.incomingCall && callStatus.status === "ringing" && (
          <div className="alert alert-warning" style={{ marginBottom: "20px" }}>
            <h3>Incoming Call!</h3>
            <p>From: {callStatus.incomingCall.from || "Unknown"}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleAnswer} className="btn btn-success">
                Answer
              </button>
              <button onClick={handleReject} className="btn btn-danger">
                Reject
              </button>
            </div>
          </div>
        )}

        {/* Make Call Section */}
        {isLoggedIn && (
          <div style={{ marginBottom: "30px" }}>
            <h3>Make Call</h3>
            <form onSubmit={handleMakeCall}>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  value={callData.phoneNumber}
                  onChange={(e) =>
                    setCallData({ ...callData, phoneNumber: e.target.value })
                  }
                  required
                  placeholder="e.g., 13158050050"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={callStatus.status !== "idle"}
              >
                Make Call
              </button>
            </form>
          </div>
        )}

        {/* Call Controls */}
        {isLoggedIn && callStatus.status !== "idle" && (
          <div style={{ marginBottom: "30px" }}>
            <h3>Call Controls</h3>
            <p>Status: {callStatus.status}</p>
            {callStatus.callId && <p>Call ID: {callStatus.callId}</p>}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {callStatus.status === "answered" && (
                <>
                  <button onClick={handleHold} className="btn btn-secondary">
                    Hold
                  </button>
                  <button onClick={handleUnhold} className="btn btn-secondary">
                    Unhold
                  </button>
                  <button onClick={handleMute} className="btn btn-secondary">
                    Mute
                  </button>
                  <button onClick={handleUnmute} className="btn btn-secondary">
                    Unmute
                  </button>
                </>
              )}
              <button onClick={handleHangup} className="btn btn-danger">
                Hangup
              </button>
            </div>
          </div>
        )}

        {/* Audio Element */}
        <audio ref={audioRef} autoPlay playsInline />
      </div>

      {/* Logs Section */}
      <div className="card">
        <h3>Event Logs</h3>
        <div
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "5px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          {logs.length === 0 ? (
            <p>No logs yet</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "5px",
                  color:
                    log.type === "error"
                      ? "#dc3545"
                      : log.type === "success"
                      ? "#28a745"
                      : "#333",
                }}
              >
                <span style={{ color: "#666" }}>[{log.timestamp}]</span>{" "}
                {log.message}
              </div>
            ))
          )}
        </div>
        {logs.length > 0 && (
          <button
            onClick={() => setLogs([])}
            className="btn btn-secondary"
            style={{ marginTop: "10px" }}
          >
            Clear Logs
          </button>
        )}
      </div>
    </div>
  );
};

export default WebRTCCall;
