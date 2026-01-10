import React, { useState } from 'react';
import { getCallAnalysis } from '../api/telecmi';

const CallAnalysis = () => {
  const [analysisData, setAnalysisData] = useState({
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysis = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await getCallAnalysis({
        start_date: parseInt(analysisData.start_date),
        end_date: parseInt(analysisData.end_date),
      });
      setAnalysisResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch call analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Call Analysis</h2>
      <p>Get call statistics for a date range</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleAnalysis}>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date (Unix timestamp) *</label>
            <input
              type="number"
              value={analysisData.start_date}
              onChange={(e) => setAnalysisData({ ...analysisData, start_date: e.target.value })}
              required
              placeholder="e.g., 1609459200"
            />
          </div>
          <div className="form-group">
            <label>End Date (Unix timestamp) *</label>
            <input
              type="number"
              value={analysisData.end_date}
              onChange={(e) => setAnalysisData({ ...analysisData, end_date: e.target.value })}
              required
              placeholder="e.g., 1609545600"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Analyzing...' : 'Get Analysis'}
        </button>
      </form>

      {analysisResult && (
        <div style={{ marginTop: '20px' }}>
          <h3>Analysis Results:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '5px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                {analysisResult.total || 0}
              </div>
              <div style={{ color: '#666', marginTop: '5px' }}>Total Calls</div>
            </div>
            <div style={{ padding: '20px', background: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {analysisResult.answered || 0}
              </div>
              <div style={{ color: '#666', marginTop: '5px' }}>Answered</div>
            </div>
            <div style={{ padding: '20px', background: '#f8d7da', borderRadius: '5px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {analysisResult.missed || 0}
              </div>
              <div style={{ color: '#666', marginTop: '5px' }}>Missed</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
            <pre style={{ background: 'white', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallAnalysis;

