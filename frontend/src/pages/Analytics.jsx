import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../utils/api';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics(id);
      setData(res.data);
    } catch (err) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.center}>Loading analytics...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>🔗 Snipora</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        {/* URL Info */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📊 Analytics</h2>
          <div style={styles.urlInfo}>
            <p style={styles.label}>Original URL</p>
            <a href={data.originalUrl} target="_blank" rel="noreferrer" style={styles.urlLink}>
              {data.originalUrl}
            </a>
          </div>
          <div style={styles.urlInfo}>
            <p style={styles.label}>Short URL</p>
            <a href={data.shortUrl} target="_blank" rel="noreferrer" style={styles.shortLink}>
              {data.shortUrl}
            </a>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👆</div>
            <div style={styles.statNumber}>{data.totalClicks}</div>
            <div style={styles.statLabel}>Total Clicks</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statNumber}>
              {new Date(data.createdAt).toLocaleDateString()}
            </div>
            <div style={styles.statLabel}>Created On</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🕐</div>
            <div style={styles.statNumber}>
              {data.lastVisited ? new Date(data.lastVisited).toLocaleDateString() : 'Never'}
            </div>
            <div style={styles.statLabel}>Last Visited</div>
          </div>
        </div>

        {/* Recent Visits */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🕐 Recent Visits</h2>
          {data.recentVisits.length === 0 ? (
            <div style={styles.empty}>No visits yet!</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Date & Time</th>
                  <th style={styles.th}>Device</th>
                  <th style={styles.th}>Browser</th>
                  <th style={styles.th}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {data.recentVisits.map((visit, index) => (
                  <tr key={visit._id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{new Date(visit.timestamp).toLocaleString()}</td>
                    <td style={styles.td}>{visit.device}</td>
                    <td style={styles.td}>{visit.browser}</td>
                    <td style={styles.td}>{visit.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#6c63ff' },
  navbar: {
    background: '#6c63ff', padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  logo: { color: '#fff', fontSize: '22px', fontWeight: '700' },
  backBtn: {
    background: 'rgba(255,255,255,0.2)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)', padding: '8px 16px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  content: { maxWidth: '900px', margin: '32px auto', padding: '0 16px' },
  card: {
    background: '#fff', borderRadius: '16px', padding: '28px',
    marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '20px' },
  urlInfo: { marginBottom: '12px' },
  label: { fontSize: '12px', color: '#888', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' },
  urlLink: { fontSize: '14px', color: '#333', wordBreak: 'break-all' },
  shortLink: { fontSize: '14px', color: '#6c63ff', fontWeight: '600' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: {
    flex: 1, background: '#fff', borderRadius: '16px', padding: '24px',
    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minWidth: '150px',
  },
  statIcon: { fontSize: '32px', marginBottom: '8px' },
  statNumber: { fontSize: '24px', fontWeight: '700', color: '#6c63ff', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#888' },
  empty: { textAlign: 'center', color: '#888', padding: '32px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '12px', background: '#f8f8f8', textAlign: 'left',
    fontSize: '13px', fontWeight: '600', color: '#555',
    borderBottom: '2px solid #eee',
  },
  td: { padding: '12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0' },
  trEven: { background: '#fff' },
  trOdd: { background: '#fafafa' },
};

export default Analytics;