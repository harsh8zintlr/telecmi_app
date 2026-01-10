import React, { useState } from "react";
import { click2Call, hangupCall } from "../api/telecmi";

const Click2Call = () => {
  const [callData, setCallData] = useState({
    token: localStorage.getItem("userToken") || "",
    to: "",
    callerid: "1203203897",
    extra_params: { crm: true },
  });
  const [hangupData, setHangupData] = useState({
    token: localStorage.getItem("userToken") || "",
    cmiuuid: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [callResult, setCallResult] = useState(null);

  const handleCall = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCallResult(null);

    try {
      const response = await click2Call(callData);
      setCallResult(response.data);
      setSuccess("Call initiated successfully!");
      if (response.data.request_id) {
        setHangupData({ ...hangupData, cmiuuid: response.data.request_id });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate call");
    } finally {
      setLoading(false);
    }
  };

  const handleHangup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await hangupCall(hangupData);
      setSuccess("Call hung up successfully!");
      setCallResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to hangup call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Click2Call</h2>
        <p>Initiate a call using user token</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleCall}>
          <div className="form-group">
            <label>User Token *</label>
            <input
              type="text"
              value={callData.token}
              onChange={(e) =>
                setCallData({ ...callData, token: e.target.value })
              }
              required
              placeholder="Enter user token (from login)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>To (Phone Number) *</label>
              <input
                type="text"
                value={callData.to}
                onChange={(e) =>
                  setCallData({ ...callData, to: e.target.value })
                }
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

      <div className="card">
        <h2>Hangup Call</h2>

        <form onSubmit={handleHangup}>
          <div className="form-group">
            <label>User Token *</label>
            <input
              type="text"
              value={hangupData.token}
              onChange={(e) =>
                setHangupData({ ...hangupData, token: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Call UUID (cmiuuid) *</label>
            <input
              type="text"
              value={hangupData.cmiuuid}
              onChange={(e) =>
                setHangupData({ ...hangupData, cmiuuid: e.target.value })
              }
              required
              placeholder="Call UUID from call result"
            />
          </div>

          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? "Hanging up..." : "Hangup Call"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Click2Call;
