import { useEffect, useState, useCallback } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../AuthContext';
import { PlusCircle, Trash2, Search, Edit2 } from 'lucide-react';

export default function Records() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalCount: 0 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null); // holds record id if editing
  const [form, setForm] = useState({ amount: '', type: 'Income', category: '', notes: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 8 });
    if (q) params.append('q', q);
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', new Date(startDate).toISOString());
    if (endDate) params.append('endDate', new Date(endDate).toISOString());

    api.get(`/records?${params.toString()}`)
      .then(res => { setRecords(res.data.data); setMeta(res.data.meta); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, q, type, startDate, endDate]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await api.delete(`/records/${id}`);
    fetchRecords();
  };

  const openCreateModal = () => {
    setIsEditing(null);
    setForm({ amount: '', type: 'Income', category: '', notes: '', date: '' });
    setShowModal(true);
  };

  const openEditModal = (r) => {
    setIsEditing(r.id);
    setForm({ 
      amount: r.amount, 
      type: r.type, 
      category: r.category, 
      notes: r.notes || '',
      date: new Date(r.date).toISOString().split('T')[0] // Format for input type="date"
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (form.date) payload.date = new Date(form.date).toISOString();
      else delete payload.date; // Use backend default now() if empty

      if (isEditing) {
        await api.put(`/records/${isEditing}`, payload);
      } else {
        await api.post('/records', payload);
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h2>Financial Records</h2>
          {isAdmin && (
            <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} /> New Record
            </button>
          )}
        </div>

        <div className="filters-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div className="search-wrap" style={{ maxWidth: 'none' }}>
            <Search size={16} />
            <input
              type="text" placeholder="Search category or notes…"
              value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Start Date</label>
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>End Date</label>
            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Notes</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>By</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading && <tr className="empty-row"><td colSpan="7">Loading…</td></tr>}
                {!loading && records.length === 0 && (
                  <tr className="empty-row"><td colSpan="7">No records found matching filters.</td></tr>
                )}
                {!loading && records.map(r => (
                  <tr key={r.id}>
                    <td><span className={`badge badge-${r.type.toLowerCase()}`}>{r.type}</span></td>
                    <td style={{ fontWeight: 600 }}>{r.category}</td>
                    <td className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.notes || '—'}</td>
                    <td className={r.type === 'Income' ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>
                      {r.type === 'Income' ? '+' : '-'}${Number(r.amount).toLocaleString()}
                    </td>
                    <td className="text-muted">{new Date(r.date).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem' }}>{r.user?.name || '—'}</td>
                    {isAdmin && (
                      <td>
                        <button className="icon-btn" style={{ color: 'var(--text-muted)' }} onClick={() => openEditModal(r)} title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDelete(r.id)} title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {meta.page} of {Math.max(meta.totalPages, 1)} ({meta.totalCount} records)</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="glass-panel modal-card">
              <h2>{isEditing ? 'Edit Record' : 'Add New Record'}</h2>
              <form onSubmit={handleSubmit}>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
                <input type="number" placeholder="Amount" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} required min="0.01" step="0.01" />
                <input type="text" placeholder="Category (e.g. Salary, Rent)" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })} required />
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                <textarea rows="3" placeholder="Notes (optional)" value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })} />
                <div className="modal-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : (isEditing ? 'Update Record' : 'Save Record')}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
