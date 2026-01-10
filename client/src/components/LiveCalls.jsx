import React, { useState, useEffect } from 'react';
import { getLiveCalls } from '../api/telecmi';

const LiveCalls = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadLiveCalls();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadLiveCalls();
      }, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadLiveCalls = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLiveCalls();
      if (response.data.calls) {
        setCalls(response.data.calls);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load live calls');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      waiting: 'badge-warning',
      answered: 'badge-success',
      started: 'badge-info',
      hangup: 'badge-danger',
      missed: 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
  };

  return (
    <div className="card">
      <h2>Live Calls & Webhooks</h2>
      <p>View live call events received via webhooks</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={loadLiveCalls} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            style={{ marginRight: '5px' }}
          />
          Auto-refresh (5s)
        </label>
      </div>

      {calls.length === 0 && !loading && (
        <div className="empty-state">
          No live calls found. Webhook events will appear here when received.
        </div>
      )}

      {calls.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Direction</th>
                <th>Status</th>
                <th>From</th>
                <th>To</th>
                <th>Time</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, idx) => (
                <tr key={idx}>
                  <td>{call.type || '-'}</td>
                  <td>
                    <span className={`badge ${call.direction === 'inbound' ? 'badge-info' : 'badge-secondary'}`}>
                      {call.direction || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(call.status)}`}>
                      {call.status || '-'}
                    </span>
                  </td>
                  <td>{call.from || '-'}</td>
                  <td>{call.to || '-'}</td>
                  <td>{formatDate(call.time || call.receivedAt || call.lastEventAt)}</td>
                  <td>
                    <details>
                      <summary style={{ cursor: 'pointer', color: '#667eea' }}>View</summary>
                      <pre style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', fontSize: '12px', overflow: 'auto' }}>
                        {JSON.stringify(call, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LiveCalls;

