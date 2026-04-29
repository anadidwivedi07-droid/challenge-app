import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://challengeapptrack30-env.eba-egyp2gtn.eu-north-1.elasticbeanstalk.com/challenges';

const MONTH_COLORS = {
  january:   { bg: '#E6F1FB', color: '#185FA5', border: '#B5D4F4' },
  february:  { bg: '#FBEAF0', color: '#993556', border: '#F4C0D1' },
  march:     { bg: '#E1F5EE', color: '#0F6E56', border: '#9FE1CB' },
  april:     { bg: '#EAF3DE', color: '#3B6D11', border: '#C0DD97' },
  may:       { bg: '#FAEEDA', color: '#854F0B', border: '#FAC775' },
  june:      { bg: '#FAECE7', color: '#993C1D', border: '#F5C4B3' },
  july:      { bg: '#FCEBEB', color: '#A32D2D', border: '#F7C1C1' },
  august:    { bg: '#EEEDFE', color: '#534AB7', border: '#CECBF6' },
  september: { bg: '#E6F1FB', color: '#0C447C', border: '#85B7EB' },
  october:   { bg: '#FAEEDA', color: '#633806', border: '#EF9F27' },
  november:  { bg: '#FAECE7', color: '#712B13', border: '#F0997B' },
  december:  { bg: '#E1F5EE', color: '#085041', border: '#5DCAA5' },
};

function getMonthStyle(month) {
  return MONTH_COLORS[month?.toLowerCase()] || { bg: '#F1EFE8', color: '#444441', border: '#D3D1C7' };
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: type === 'success' ? '#1D9E75' : '#E24B4A',
      color: '#fff', padding: '12px 22px', borderRadius: 10,
      fontSize: 14, fontWeight: 600, letterSpacing: 0.2,
      animation: 'toastIn 0.3s ease'
    }}>
      {type === 'success' ? '✓ ' : '✕ '}{message}
    </div>
  );
}

function UpdateModal({ challenge, onClose, onUpdate }) {
  const [month, setMonth] = useState(challenge.month);
  const [description, setDescription] = useState(challenge.description);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!month.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await axios.put(`${API}/${challenge.id}`, { month: month.trim(), description: description.trim() });
      onUpdate();
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 14, border: '1px solid #334155',
        padding: 28, width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <h3 style={{ margin: '0 0 20px', color: '#f1f5f9', fontSize: 18 }}>Update Challenge</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Month</label>
          <input value={month} onChange={e => setMonth(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', background: 'transparent', color: '#94a3b8',
            border: '1px solid #334155', borderRadius: 8, fontSize: 13, cursor: 'pointer'
          }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '8px 18px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [editingChallenge, setEditingChallenge] = useState(null);

  const fetchChallenges = async () => {
    try {
      const res = await axios.get(API);
      setChallenges(res.data);
    } catch {
      showToast('Failed to load challenges', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const showToast = (message, type) => setToast({ message, type });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!month.trim() || !description.trim()) { setError('Both fields are required.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await axios.post(API, { month: month.trim(), description: description.trim() });
      setMonth(''); setDescription('');
      await fetchChallenges();
      showToast('Challenge added successfully!', 'success');
    } catch { showToast('Failed to add challenge', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setChallenges(prev => prev.filter(c => c.id !== id));
      showToast('Challenge deleted', 'success');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filtered = challenges
    .filter(c =>
      c.month?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const va = (a[sortField] || '').toString().toLowerCase();
      const vb = (b[sortField] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const SortIcon = ({ field }) => (
    <span style={{ marginLeft: 4, opacity: sortField === field ? 1 : 0.3, fontSize: 11 }}>
      {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Segoe UI', sans-serif", padding: '32px 24px' }}>
      <style>{`
        @keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .tbl-row:hover { background: rgba(255,255,255,0.04) !important; }
        .del-btn:hover { background: #7f1d1d !important; color: #fca5a5 !important; }
        .upd-btn:hover { background: #1e40af !important; color: #93c5fd !important; }
        .sort-th:hover { color: #60a5fa !important; cursor: pointer; }
        input::placeholder, textarea::placeholder { color: #64748b; }
        input:focus, textarea:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1e293b; } ::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: '#f1f5f9', letterSpacing: -1 }}>
            Monthly Challenges
          </h1>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
            Track and manage your monthly goals
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total', value: challenges.length, color: '#3b82f6' },
            { label: 'This month', value: challenges.filter(c => c.month?.toLowerCase() === new Date().toLocaleString('default',{month:'long'}).toLowerCase()).length, color: '#10b981' },
            { label: 'Showing', value: filtered.length, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1e293b', borderRadius: 12, padding: '16px 20px', border: '1px solid #334155' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Add Form */}
        <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', padding: '24px', marginBottom: 24, animation: 'fadeIn 0.4s ease' }}>
          <p style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
            + Add New Challenge
          </p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Month</label>
                <input value={month} onChange={e => setMonth(e.target.value)} placeholder="e.g. January"
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the challenge..."
                  style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={submitting} style={{
                padding: '10px 24px', background: submitting ? '#1d4ed8' : '#2563eb', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap', transition: 'background 0.2s'
              }}>
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
            {error && <p style={{ margin: '10px 0 0', color: '#f87171', fontSize: 13 }}>{error}</p>}
          </form>
        </div>

        {/* Table */}
        <div style={{ background: '#1e293b', borderRadius: 14, border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>All Challenges</p>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ padding: '8px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 13, width: 200 }} />
          </div>

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 160px 1fr 160px', padding: '12px 20px', background: '#0f172a', borderBottom: '1px solid #334155' }}>
            {[['id','#'], ['month','Month'], ['description','Description'], [null,'Action']].map(([field, label]) => (
              <div key={label} onClick={field ? () => handleSort(field) : undefined}
                className={field ? 'sort-th' : ''}
                style={{ fontSize: 12, fontWeight: 600, color: sortField === field ? '#60a5fa' : '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, userSelect: 'none' }}>
                {label}{field && <SortIcon field={field} />}
              </div>
            ))}
          </div>

          {/* Table Body */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading challenges...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              {search ? 'No challenges match your search.' : 'No challenges yet. Add one above!'}
            </div>
          ) : (
            filtered.map((c, i) => {
              const ms = getMonthStyle(c.month);
              return (
                <div key={c.id} className="tbl-row" style={{
                  display: 'grid', gridTemplateColumns: '60px 160px 1fr 160px',
                  padding: '14px 20px', borderBottom: '1px solid #1e293b',
                  alignItems: 'center', transition: 'background 0.15s',
                  animation: `fadeIn 0.3s ease ${i * 0.04}s both`
                }}>
                  <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>#{c.id}</span>
                  <span>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 700, background: ms.bg, color: ms.color,
                      border: `1px solid ${ms.border}`, textTransform: 'capitalize'
                    }}>
                      {c.month}
                    </span>
                  </span>
                  <span style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.4, paddingRight: 16 }}>{c.description}</span>
                  <span style={{ display: 'flex', gap: 8 }}>
                    <button className="upd-btn" onClick={() => setEditingChallenge(c)} style={{
                      padding: '5px 14px', background: '#1e293b', color: '#60a5fa',
                      border: '1px solid #3b82f6', borderRadius: 6, fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      Edit
                    </button>
                    <button className="del-btn" onClick={() => handleDelete(c.id)} style={{
                      padding: '5px 14px', background: '#1e293b', color: '#94a3b8',
                      border: '1px solid #334155', borderRadius: 6, fontSize: 12,
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                      Delete
                    </button>
                  </span>
                </div>
              );
            })
          )}

          {filtered.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #334155', background: '#0f172a' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                Showing {filtered.length} of {challenges.length} challenges
              </p>
            </div>
          )}
        </div>
      </div>

      {editingChallenge && (
        <UpdateModal
          challenge={editingChallenge}
          onClose={() => setEditingChallenge(null)}
          onUpdate={() => { fetchChallenges(); showToast('Challenge updated!', 'success'); }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}