import React, { useState } from "react";
import {
  getUserInCDR,
  getUserOutCDR,
  getUserMissed,
  getUserOutMissed,
  getUserAnswered,
  getUserOutAnswered,
  getAnswered,
  getMissed,
  getOutAnswered,
  getOutMissed,
} from "../api/telecmi";

const CDR = () => {
  const [activeTab, setActiveTab] = useState("user-in");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cdrData, setCdrData] = useState(null);
  const [filters, setFilters] = useState({
    token: localStorage.getItem("userToken") || "",
    type: "1",
    from: "",
    to: "",
    page: 1,
    limit: 10,
    start_date: "",
    end_date: "",
  });

  // const userEndpoints = [
  //   { id: "user-in", label: "User Incoming Calls", func: getUserInCDR },
  //   { id: "user-out", label: "User Outgoing Calls", func: getUserOutCDR },
  //   { id: "user-missed", label: "User Missed Calls", func: getUserMissed },
  //   {
  //     id: "user-out-missed",
  //     label: "User Out Missed Calls",
  //     func: getUserOutMissed,
  //   },
  //   {
  //     id: "user-answered",
  //     label: "User Answered Calls",
  //     func: getUserAnswered,
  //   },
  //   {
  //     id: "user-out-answered",
  //     label: "User Out Answered Calls",
  //     func: getUserOutAnswered,
  //   },
  // ];

  const adminEndpoints = [
    {
      id: "admin-answered",
      label: "WebRTC Answered Incoming Calls",
      func: getAnswered,
    },
    { id: "admin-missed", label: "WebRTC Admin Missed Calls", func: getMissed },
    {
      id: "admin-out-answered",
      label: "WebRTC Out Answered Calls",
      func: getOutAnswered,
    },
    {
      id: "admin-out-missed",
      label: "WebRTC Out Missed Calls",
      func: getOutMissed,
    },
  ];

  const handleFetch = async (endpoint) => {
    setLoading(true);
    setError(null);
    setCdrData(null);

    try {
      let payload = {};
      if (endpoint.id.startsWith("user-")) {
        payload = {
          token: filters.token,
          type: filters.type,
          from: filters.from || undefined,
          to: filters.to || undefined,
          page: filters.page,
          limit: filters.limit,
        };
        if (
          endpoint.id === "user-missed" ||
          endpoint.id === "user-out-missed"
        ) {
          delete payload.type;
        }
      } else {
        payload = {
          start_date: filters.start_date
            ? parseInt(filters.start_date)
            : undefined,
          end_date: filters.end_date ? parseInt(filters.end_date) : undefined,
          page: filters.page,
          limit: filters.limit,
        };
      }

      const response = await endpoint.func(payload);
      setCdrData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch CDR");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="card">
        <h2>Call Detail Records (CDR)</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* {userEndpoints.map((endpoint) => (
            <button
              key={endpoint.id}
              className={`btn ${
                activeTab === endpoint.id ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setActiveTab(endpoint.id)}
            >
              {endpoint.label}
            </button>
          ))} */}
          {adminEndpoints.map((endpoint) => (
            <button
              key={endpoint.id}
              className={`btn ${
                activeTab === endpoint.id ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setActiveTab(endpoint.id)}
            >
              {endpoint.label}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {activeTab.startsWith("user-") && (
          <div>
            <div className="form-group">
              <label>User Token *</label>
              <input
                type="text"
                value={filters.token}
                onChange={(e) =>
                  setFilters({ ...filters, token: e.target.value })
                }
                required
                placeholder="User token from login (Get it from User Login tab)"
              />
            </div>
            {(activeTab === "user-in" || activeTab === "user-out") && (
              <div className="form-group">
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                >
                  <option value="1">Missed</option>
                  <option value="2">Answered</option>
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>From (Phone Number)</label>
                <input
                  type="text"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters({ ...filters, from: e.target.value })
                  }
                  placeholder="Filter by from number"
                />
              </div>
              <div className="form-group">
                <label>To (Phone Number)</label>
                <input
                  type="text"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters({ ...filters, to: e.target.value })
                  }
                  placeholder="Filter by to number"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab.startsWith("admin-") && (
          <div className="form-row">
            <div className="form-group">
              <label>Start Date (Unix timestamp)</label>
              <input
                type="number"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
                placeholder="e.g., 1609459200"
              />
            </div>
            <div className="form-group">
              <label>End Date (Unix timestamp)</label>
              <input
                type="number"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
                placeholder="e.g., 1609545600"
              />
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Page</label>
            <input
              type="number"
              value={filters.page}
              onChange={(e) =>
                setFilters({ ...filters, page: parseInt(e.target.value) })
              }
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Limit</label>
            <input
              type="number"
              value={filters.limit}
              onChange={(e) =>
                setFilters({ ...filters, limit: parseInt(e.target.value) })
              }
              min="1"
              max="100"
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            const endpoint = [...adminEndpoints].find(
              (e) => e.id === activeTab
            );
            if (endpoint) handleFetch(endpoint);
          }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch CDR"}
        </button>

        {cdrData && (
          <div style={{ marginTop: "20px" }}>
            <h3>Results ({cdrData.count || 0} records)</h3>
            {cdrData.cdr && cdrData.cdr.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th>Rate</th>
                      {cdrData.cdr[0].filename && <th>Recording</th>}
                      {cdrData.cdr[0].notes && <th>Notes</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {cdrData.cdr.map((call, idx) => (
                      <tr key={idx}>
                        <td>{formatDate(call.time)}</td>
                        <td>{call.from}</td>
                        <td>{call.to}</td>
                        <td>{formatDuration(call.duration)}</td>
                        <td>
                          <span
                            className={`badge ${
                              call.duration > 0
                                ? "badge-success"
                                : "badge-danger"
                            }`}
                          >
                            {call.duration > 0 ? "Answered" : "Missed"}
                          </span>
                        </td>
                        <td>{call.rate || "-"}</td>
                        {cdrData.cdr[0].filename && (
                          <td>
                            {call.filename ? (
                              <a
                                href={call.filename}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Listen
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                        )}
                        {cdrData.cdr[0].notes && (
                          <td>
                            {call.notes?.length > 0
                              ? `${call.notes.length} note(s)`
                              : "-"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">No records found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CDR;
