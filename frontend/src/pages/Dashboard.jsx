import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../utils/api';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ originalUrl: '', customAlias: '', expiryDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const res = await api.getAllUrls();
      setUrls(res.data);
    } catch (err) {
      setError('Failed to fetch URLs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);
    try {
      const res = await api.createShortUrl(formData);
      setUrls([res.data, ...urls]);
      setFormData({ originalUrl: '', customAlias: '', expiryDate: '' });
      setSuccess('Short URL created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create URL');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) return;
    try {
      await api.deleteUrl(id);
      setUrls(urls.filter(url => url._id !== id));
      setSuccess('URL deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await api.updateUrl(id, { originalUrl: editUrl });
      setUrls(urls.map(url => url._id === id ? { ...url, originalUrl: res.data.originalUrl } : url));
      setEditingId(null);
      setEditUrl('');
      setSuccess('URL updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update URL');
    }
  };

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h1 style={styles.logo}>✨SNIPORA</h1>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user?.name}!</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>✂️ Shorten a URL</h2>
          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.successMsg}>{success}</div>}
          <form onSubmit={handleCreate}>
            <div style={styles.inputRow}>
              <input
                type="url"
                placeholder="Paste your long URL here..."
                value={formData.originalUrl}
                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                style={styles.mainInput}
                required
              />
            </div>
            <div style={styles.optionsRow}>
              <input
                type="text"
                placeholder="Custom alias (optional)"
                value={formData.customAlias}
                onChange={(e) => setFormData({ ...formData, customAlias: e.target.value })}
                style={styles.optionInput}
              />
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                style={styles.dateInput}
              />
              <button type="submit" style={styles.createBtn} disabled={creating}>
                {creating ? 'Creating...' : 'Shorten!'}
              </button>
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔗 Your Links ({urls.length})</h2>
          {loading ? (
            <div style={styles.loading}>Loading your links...</div>
          ) : urls.length === 0 ? (
            <div style={styles.empty}>No links yet! Create your first short URL above.</div>
          ) : (
            <div>
              {urls.map(url => (
                <div key={url._id} style={styles.urlCard}>
                  <div style={styles.urlInfo}>
                    <div style={styles.originalUrl}>
                      {editingId === url._id ? (
                        <div style={styles.editRow}>
                          <input
                            type="url"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            style={styles.editInput}
                          />
                          <button onClick={() => handleEdit(url._id)} style={styles.saveBtn}>Save</button>
                          <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Cancel</button>
                        </div>
                      ) : (
                        <span style={{ color: '#ccc' }} title={url.originalUrl}>
                          {url.originalUrl.length > 50 ? url.originalUrl.substring(0, 50) + '...' : url.originalUrl}
                        </span>
                      )}
                    </div>
                    <a href={url.shortUrl} target="_blank" rel="noreferrer" style={styles.shortUrl}>
                      {url.shortUrl}
                    </a>
                    <div style={styles.urlMeta}>
                      <span>📅 {new Date(url.createdAt).toLocaleDateString()}</span>
                      <span>👆 {url.clicks} clicks</span>
                      {url.expiryDate && <span>⏰ Expires: {new Date(url.expiryDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div style={styles.urlActions}>
                    <button onClick={() => handleCopy(url.shortUrl)} style={styles.copyBtn}>📋 Copy</button>
                    <button onClick={() => navigate(`/analytics/${url._id}`)} style={styles.analyticsBtn}>📊 Stats</button>
                    <button onClick={() => { setEditingId(url._id); setEditUrl(url.originalUrl); }} style={styles.editBtn}>✏️ Edit</button>
                    <button onClick={() => handleDelete(url._id)} style={styles.deleteBtn}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#1a1a1a' },
  navbar: {
    background: '#111',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ff6a00',
    boxShadow: '0 2px 20px rgba(255,106,0,0.3)',
  },
  logo: { color: '#ff6a00', fontSize: '22px', fontWeight: '900', letterSpacing: '4px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#ccc', fontSize: '14px' },
  logoutBtn: {
    background: 'transparent',
    color: '#ff6a00',
    border: '1.5px solid #ff6a00',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  content: { maxWidth: '900px', margin: '32px auto', padding: '0 16px' },
  card: {
    background: '#111',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(255,106,0,0.15)',
    border: '1px solid #2a2a2a',
  },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#ff6a00', marginBottom: '20px' },
  error: {
    background: '#ff000022', color: '#ff6a00', padding: '10px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  successMsg: {
    background: '#00ff0022', color: '#00cc00', padding: '10px',
    borderRadius: '8px', marginBottom: '16px', fontSize: '14px',
  },
  inputRow: { marginBottom: '12px' },
  mainInput: {
    width: '100%', padding: '14px', borderRadius: '10px',
    border: '1.5px solid #ff6a00', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
    background: '#1a1a1a', color: '#fff',
    boxShadow: '0 0 8px rgba(255,106,0,0.2)',
  },
  optionsRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  optionInput: {
    flex: 1, padding: '12px', borderRadius: '10px',
    border: '1.5px solid #333', fontSize: '14px',
    outline: 'none', minWidth: '150px',
    background: '#1a1a1a', color: '#666',
  },
  dateInput: {
    flex: 1, padding: '12px', borderRadius: '10px',
    border: '1.5px solid #333', fontSize: '14px',
    outline: 'none', minWidth: '150px',
    background: '#1a1a1a', color: '#666',
    colorScheme: 'dark',
  },
  createBtn: {
    padding: '12px 28px', background: '#ff6a00', color: '#fff',
    border: 'none', borderRadius: '10px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer', letterSpacing: '1px',
  },
  loading: { textAlign: 'center', color: '#888', padding: '32px' },
  empty: { textAlign: 'center', color: '#888', padding: '32px' },
  urlCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px', borderRadius: '12px', border: '1px solid #2a2a2a',
    marginBottom: '12px', background: '#1a1a1a', flexWrap: 'wrap', gap: '12px',
  },
  urlInfo: { flex: 1 },
  originalUrl: { fontSize: '14px', fontWeight: '500', marginBottom: '4px' },
  shortUrl: { fontSize: '14px', color: '#ff6a00', fontWeight: '600', marginBottom: '6px', display: 'block' },
  urlMeta: { display: 'flex', gap: '16px', fontSize: '12px', color: '#888' },
  urlActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  copyBtn: {
    padding: '8px 12px', background: '#1a1a1a', color: '#ff6a00',
    border: '1.5px solid #ff6a00', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
    boxShadow: '0 0 6px rgba(255,106,0,0.3)',
  },
  analyticsBtn: {
    padding: '8px 12px', background: '#1a1a1a', color: '#ff6a00',
    border: '1.5px solid #ff6a00', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
    boxShadow: '0 0 6px rgba(255,106,0,0.3)',
  },
  editBtn: {
    padding: '8px 12px', background: '#1a1a1a', color: '#ff6a00',
    border: '1.5px solid #ff6a00', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
    boxShadow: '0 0 6px rgba(255,106,0,0.3)',
  },
  deleteBtn: {
    padding: '8px 12px', background: '#1a1a1a', color: '#ff4444',
    border: '1.5px solid #ff4444', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
    boxShadow: '0 0 6px rgba(255,0,0,0.3)',
  },
  editRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  editInput: {
    flex: 1, padding: '8px', borderRadius: '8px',
    border: '1.5px solid #ff6a00', fontSize: '14px',
    background: '#1a1a1a', color: '#fff',
    boxShadow: '0 0 8px rgba(255,106,0,0.4)',
    outline: 'none',
  },
  saveBtn: {
    padding: '8px 12px', background: '#ff6a00', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
  cancelBtn: {
    padding: '8px 12px', background: '#333', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
  },
};

export default Dashboard;