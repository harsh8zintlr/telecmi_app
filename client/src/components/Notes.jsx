import React, { useState } from 'react';
import { addNote, getNotes } from '../api/telecmi';

const Notes = () => {
  const [addNoteData, setAddNoteData] = useState({
    token: localStorage.getItem('userToken') || '',
    from: '',
    date: Math.floor(Date.now() / 1000),
    msg: '',
  });
  const [getNoteData, setGetNoteData] = useState({
    token: localStorage.getItem('userToken') || '',
    phone_number: '',
    date: Math.floor(Date.now() / 1000),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [notesResult, setNotesResult] = useState(null);

  const handleAddNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await addNote({
        ...addNoteData,
        date: parseInt(addNoteData.date),
      });
      setSuccess('Note added successfully!');
      setAddNoteData({ ...addNoteData, msg: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleGetNotes = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setNotesResult(null);

    try {
      const response = await getNotes({
        ...getNoteData,
        date: parseInt(getNoteData.date),
      });
      setNotesResult(response.data);
      setSuccess('Notes fetched successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div>
      <div className="card">
        <h2>Add Note</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleAddNote}>
          <div className="form-group">
            <label>User Token *</label>
            <input
              type="text"
              value={addNoteData.token}
              onChange={(e) => setAddNoteData({ ...addNoteData, token: e.target.value })}
              required
              placeholder="User token from login"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From (Phone Number) *</label>
              <input
                type="text"
                value={addNoteData.from}
                onChange={(e) => setAddNoteData({ ...addNoteData, from: e.target.value })}
                required
                placeholder="Phone number"
              />
            </div>
            <div className="form-group">
              <label>Date (Unix timestamp) *</label>
              <input
                type="number"
                value={addNoteData.date}
                onChange={(e) => setAddNoteData({ ...addNoteData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Message *</label>
            <textarea
              value={addNoteData.msg}
              onChange={(e) => setAddNoteData({ ...addNoteData, msg: e.target.value })}
              required
              rows="4"
              placeholder="Enter note message"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Note'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Get Notes</h2>

        <form onSubmit={handleGetNotes}>
          <div className="form-group">
            <label>User Token *</label>
            <input
              type="text"
              value={getNoteData.token}
              onChange={(e) => setGetNoteData({ ...getNoteData, token: e.target.value })}
              required
              placeholder="User token from login"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                value={getNoteData.phone_number}
                onChange={(e) => setGetNoteData({ ...getNoteData, phone_number: e.target.value })}
                required
                placeholder="Phone number"
              />
            </div>
            <div className="form-group">
              <label>Date (Unix timestamp) *</label>
              <input
                type="number"
                value={getNoteData.date}
                onChange={(e) => setGetNoteData({ ...getNoteData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Get Notes'}
          </button>
        </form>

        {notesResult && (
          <div style={{ marginTop: '20px' }}>
            <h3>Notes:</h3>
            {notesResult.notes && notesResult.notes.length > 0 ? (
              <div>
                {notesResult.notes.map((note, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '15px',
                      marginBottom: '10px',
                      background: '#f8f9fa',
                      borderRadius: '5px',
                      borderLeft: '4px solid #667eea',
                    }}
                  >
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Date:</strong> {formatDate(note.date)}
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Agent:</strong> {note.agent}
                    </div>
                    <div>
                      <strong>Message:</strong> {note.msg}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No notes found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;

