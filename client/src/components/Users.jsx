import React, { useState, useEffect } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../api/telecmi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    extension: '',
    name: '',
    phone_number: '',
    password: '',
    start_time: '',
    end_time: '',
    sms_alert: false,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listUsers({ page: 1, limit: 50 });
      if (response.data.agents) {
        setUsers(response.data.agents);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        await updateUser({ ...formData, id: editingUser.agent_id });
        setSuccess('User updated successfully');
      } else {
        await createUser(formData);
        setSuccess('User created successfully');
      }
      setShowForm(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    setError(null);
    try {
      await deleteUser({ id: userId });
      setSuccess('User deleted successfully');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      extension: user.extension || '',
      name: user.name || '',
      phone_number: user.phone || '',
      password: '',
      start_time: user.start_time || '',
      end_time: user.end_time || '',
      sms_alert: user.notify || false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      extension: '',
      name: '',
      phone_number: '',
      password: '',
      start_time: '',
      end_time: '',
      sms_alert: false,
    });
  };

  return (
    <div className="card">
      <h2>User Management</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button
        className="btn btn-primary"
        onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setEditingUser(null);
            resetForm();
          }
        }}
      >
        {showForm ? 'Cancel' : 'Add New User'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-row">
            <div className="form-group">
              <label>Extension *</label>
              <input
                type="number"
                value={formData.extension}
                onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time (24h format, e.g., 900)</label>
              <input
                type="number"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                placeholder="900"
              />
            </div>
            <div className="form-group">
              <label>End Time (24h format, e.g., 1800)</label>
              <input
                type="number"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                placeholder="1800"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.sms_alert}
                onChange={(e) => setFormData({ ...formData, sms_alert: e.target.checked })}
              />
              {' '}SMS Alert
            </label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
          </button>
        </form>
      )}

      {loading && !showForm && <div className="loading">Loading users...</div>}

      {!loading && users.length === 0 && (
        <div className="empty-state">No users found</div>
      )}

      {users.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Extension</th>
              <th>Phone</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.agent_id}>
                <td>{user.agent_id}</td>
                <td>{user.name}</td>
                <td>{user.extension}</td>
                <td>{user.phone}</td>
                <td>{user.start_time || '-'}</td>
                <td>{user.end_time || '-'}</td>
                <td>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(user)}
                    style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(user.agent_id)}
                    style={{ padding: '5px 10px', fontSize: '12px' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Users;

