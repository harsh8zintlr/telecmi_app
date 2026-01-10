import React, { useState } from "react";
import { adminClick2Call } from "../api/telecmi";

const AdminClick2Call = () => {
  const [callData, setCallData] = useState({
    user_id: "",
    secret: "faa1cca3-ac54-4490-a543-6d731c0ce0a2",
    to: "",
    callerid: "1203203897",
    webrtc: false, // Default value is true
    followme: true, // Default value is false
    extra_params: { crm: false },
    token: localStorage.getItem("userToken"),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [callResult, setCallResult] = useState(null);

  // Handle webrtc and followme mutual exclusivity
  const handleWebRTCChange = (checked) => {
    setCallData({
      ...callData,
      webrtc: checked,
      followme: !checked, // If webrtc is true, followme must be false
    });
  };

  const handleFollowMeChange = (checked) => {
    setCallData({
      ...callData,
      followme: checked,
      webrtc: !checked, // If followme is true, webrtc must be false
    });
  };

  // Save admin secret to localStorage when it changes
  const handleSecretChange = (value) => {
    setCallData({ ...callData, secret: value });
    if (value) {
      localStorage.setItem("adminSecret", value);
    } else {
      localStorage.removeItem("adminSecret");
    }
  };

  const handleCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCallResult(null);

    try {
      const response = await adminClick2Call(callData);
      setCallResult(response.data);
      setSuccess("Call initiated successfully!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Admin Click2Call</h2>
      <p>Initiate a call using admin credentials</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleCall}>
        <div className="form-row">
          <div className="form-group">
            <label>User ID *</label>
            <input
              type="text"
              value={callData.user_id}
              onChange={(e) =>
                setCallData({ ...callData, user_id: e.target.value })
              }
              required
              placeholder="User ID"
            />
          </div>
          <div className="form-group">
            <label>Secret (Admin Token) *</label>
            <input
              type="text"
              value={callData.secret}
              onChange={(e) => handleSecretChange(e.target.value)}
              required
              placeholder="Admin secret (saved automatically)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>To (Phone Number) *</label>
            <input
              type="text"
              value={callData.to}
              onChange={(e) => setCallData({ ...callData, to: e.target.value })}
              required
              placeholder="e.g., 13158050050"
            />
          </div>
          <div className="form-group">
            <label>Caller ID</label>
            <input
              type="text"
              value={callData.callerid}
              onChange={(e) =>
                setCallData({ ...callData, callerid: e.target.value })
              }
              placeholder="Caller ID number"
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={callData.webrtc}
              disabled={true}
              onChange={(e) => handleWebRTCChange(e.target.checked)}
            />{" "}
            WebRTC (default: true)
          </label>
          <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
            When WebRTC is false, Follow Me will be automatically set to true
          </small>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={callData.followme}
              onChange={(e) => handleFollowMeChange(e.target.checked)}
            />{" "}
            Follow Me (default: false)
          </label>
          <small style={{ display: "block", color: "#666", marginTop: "5px" }}>
            When Follow Me is true, WebRTC will be automatically set to false
          </small>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={callData.extra_params.crm}
              onChange={(e) =>
                setCallData({
                  ...callData,
                  extra_params: { crm: e.target.checked },
                })
              }
            />{" "}
            CRM Integration
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Calling..." : "Make Call"}
        </button>
      </form>

      {callResult && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "5px",
          }}
        >
          <h3>Call Result:</h3>
          <pre
            style={{
              background: "white",
              padding: "10px",
              borderRadius: "5px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(callResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminClick2Call;
