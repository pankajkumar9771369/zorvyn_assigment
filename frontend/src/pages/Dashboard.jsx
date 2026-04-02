import { useEffect, useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading dashboard...
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h2>Financial Overview</h2>
        </div>

        <div className="metrics-grid">
          <div className="glass-panel metric-card">
            <div className="metric-header">
              <span className="metric-label">Total Income</span>
              <div className="metric-icon income"><TrendingUp size={20} /></div>
            </div>
            <div className="metric-value income">${(data?.totalIncome || 0).toLocaleString()}</div>
          </div>
          <div className="glass-panel metric-card">
            <div className="metric-header">
              <span className="metric-label">Total Expense</span>
              <div className="metric-icon expense"><TrendingDown size={20} /></div>
            </div>
            <div className="metric-value expense">${(data?.totalExpense || 0).toLocaleString()}</div>
          </div>
          <div className="glass-panel metric-card">
            <div className="metric-header">
              <span className="metric-label">Net Balance</span>
              <div className="metric-icon balance"><DollarSign size={20} /></div>
            </div>
            <div className="metric-value" style={{ color: (data?.netBalance || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              ${(data?.netBalance || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="two-col-grid">
          {/* Recent Activity */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-title">Recent Activity</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentActivity || []).length === 0 && (
                    <tr className="empty-row"><td colSpan="3">No activity yet</td></tr>
                  )}
                  {(data?.recentActivity || []).map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.category}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.notes || '—'}</div>
                      </td>
                      <td className={r.type === 'Income' ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>
                        {r.type === 'Income' ? '+' : '-'}${r.amount}
                      </td>
                      <td className="text-muted">{new Date(r.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-title">Monthly Trends</div>
            {(data?.monthlyTrends || []).length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No trend data yet</div>
            )}
            {(data?.monthlyTrends || []).map(t => (
              <div key={t.month} className="trend-row">
                <strong>{t.month}</strong>
                <span className="text-success">+${t.income}</span>
                <span className="text-danger">-${t.expense}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        {(data?.categoryTotals || []).length > 0 && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <div className="panel-title">Category Breakdown</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Category</th><th>Type</th><th>Total</th></tr></thead>
                <tbody>
                  {data.categoryTotals.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{c.category}</td>
                      <td><span className={`badge badge-${c.type.toLowerCase()}`}>{c.type}</span></td>
                      <td className={c.type === 'Income' ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>${c.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
