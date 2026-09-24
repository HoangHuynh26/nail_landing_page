import React, { useState, useEffect } from 'react';
import {
  Database, CheckCircle2, AlertTriangle, RefreshCw, Zap,
  Server, Shield, Copy, Check, ExternalLink, ArrowRight
} from 'lucide-react';

export function AdminDatabase() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbUrlInput, setDbUrlInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/status');
      if (!res.ok) throw new Error('Failed to load status');
      const data = await res.json();
      if (data.success && data.data?.database) {
        setStatus(data.data.database);
      }
    } catch (err) {
      console.error('Error fetching DB status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectNeon = async (e) => {
    e.preventDefault();
    if (!dbUrlInput.trim().startsWith('postgres')) {
      alert('Please enter a valid PostgreSQL URL starting with postgresql:// or postgres://');
      return;
    }

    setConnecting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/db-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: dbUrlInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setStatus(data.database);
        setDbUrlInput('');
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection failed: ' + err.message });
    } finally {
      setConnecting(false);
    }
  };

  const isNeon = status?.mode === 'neon_postgresql';

  return (
    <div>
      {/* Status Banner */}
      <div className="admin-card" style={{ borderColor: isNeon ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: isNeon ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isNeon ? '#10b981' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#fff', fontWeight: '700' }}>
                  {isNeon ? 'Connected to Neon PostgreSQL Cloud' : 'Operating in Resilient Local Fallback Mode'}
                </h2>
                <span className={`admin-db-pill ${isNeon ? 'is-neon' : 'is-fallback'}`}>
                  <span className="admin-pulse-dot" />
                  {isNeon ? 'NEON POSTGRESQL' : 'LOCAL FALLBACK'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                {isNeon
                  ? 'Cloud database is active, verified, and synchronized with automated table schemas.'
                  : 'App is running smoothly with local persistent store. Connect your Neon PostgreSQL URL below to switch seamlessly to the cloud.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="admin-secondary-btn"
            onClick={fetchStatus}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Database Engine</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
              {isNeon ? 'PostgreSQL (Neon.tech)' : 'Local File Store (JSON)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Connection Latency</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#38bdf8', marginTop: '2px' }}>
              {status?.pingMs ? `${status.pingMs} ms` : 'Local (<1ms)'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Synchronized Bookings</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#d4af37', marginTop: '2px' }}>
              {status?.counts?.bookings ?? 0} records
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Catalog Services</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#34d399', marginTop: '2px' }}>
              {status?.counts?.services ?? 0} active items
            </div>
          </div>
        </div>

        {status?.maskedUrl && (
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
            Active Connection: <code style={{ color: '#d4af37' }}>{status.maskedUrl}</code>
          </div>
        )}
      </div>

      {/* Connect Neon Form Card */}
      <div className="admin-card">
        <h3 className="admin-card__title">
          <Server size={18} className="text-gold" />
          <span>Connect or Update Neon PostgreSQL Database</span>
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: '6px 0 20px' }}>
          Paste your Neon connection string directly below to connect live without having to restart any dev servers. The tables (<code>bookings</code>, <code>services</code>, <code>promotions</code>) will be created and seeded automatically.
        </p>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: message.type === 'success' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              color: message.type === 'success' ? '#34d399' : '#f87171'
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleConnectNeon}>
          <div className="admin-form-group">
            <label>Neon Database URL Connection String</label>
            <input
              type="password"
              className="admin-form-input"
              placeholder="postgresql://neondb_owner:password@ep-sample-12345.us-east-2.aws.neon.tech/neondb?sslmode=require"
              value={dbUrlInput}
              onChange={(e) => setDbUrlInput(e.target.value)}
              disabled={connecting}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              className="admin-primary-btn"
              disabled={connecting}
            >
              <Zap size={14} />
              <span>{connecting ? 'Testing & Connecting...' : 'Connect & Sync Neon Database'}</span>
            </button>
          </div>
        </form>

        {/* Step-by-Step Neon Guide */}
        <div
          style={{
            marginTop: '28px',
            padding: '20px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#fff' }}>
              How to get your Neon connection string in 30 seconds:
            </h4>
            <a
              href="https://console.neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#d4af37', fontSize: '12px', textDecoration: 'none' }}
            >
              Open Neon Console <ExternalLink size={12} />
            </a>
          </div>

          <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#94a3b8', lineHeight: '1.7' }}>
            <li>Go to <strong style={{ color: '#fff' }}>neon.tech</strong> and sign in to your project dashboard.</li>
            <li>In the <strong style={{ color: '#fff' }}>Connection Details</strong> panel on the main page, select <strong style={{ color: '#fff' }}>Node.js</strong> or <strong style={{ color: '#fff' }}>Parameters only</strong>.</li>
            <li>Copy the full connection URL starting with <code>postgresql://neondb_owner:...</code></li>
            <li>Paste it above or add it to <code>server/.env</code> as <code>DATABASE_URL=...</code>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default AdminDatabase;
