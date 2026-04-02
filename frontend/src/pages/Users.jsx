import { useEffect, useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { ShieldAlert, UserX, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? (Action cannot be reversed)')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <h2>User Administration</h2>
          <div style={{ color: 'var(--text-muted)' }}>Manage access levels and team members</div>
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr className="empty-row"><td colSpan="6">Loading users...</td></tr>}
                {!loading && users.map(u => (
                  <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.6 }}>
                    <td style={{ fontWeight: 600 }}>{u.name} {u.id === currentUser.id && <span className="badge badge-viewer">YOU</span>}</td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        disabled={u.id === currentUser.id} // Prevents admin from accidentally degrading themselves
                        style={{ padding: '0.4rem', fontSize: '0.8rem', width: 'auto', minWidth: '110px' }}
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Analyst">Analyst</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(u)} 
                        disabled={u.id === currentUser.id}
                        className="icon-btn" 
                        style={{ color: u.isActive ? 'var(--success)' : 'var(--danger)', padding: 0 }}
                        title={u.isActive ? 'Active - Click to Deactivate' : 'Inactive - Click to Activate'}
                      >
                        {u.isActive ? <CheckCircle size={20} /> : <XCircle size={20} />}
                        <span style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="icon-btn danger" 
                        onClick={() => handleDelete(u.id)}
                        disabled={u.id === currentUser.id}
                        title="Delete User"
                      >
                        <UserX size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <div className="panel-title">Role Permissions Breakdown</div>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}><ShieldAlert size={20} className="text-muted" /> <div><strong>Viewer</strong>: Read-only access to their own financial records. Cannot see Dashboard statistics or modify data.</div></div>
            <div style={{ display: 'flex', gap: '1rem' }}><ShieldAlert size={20} className="text-muted" /> <div><strong>Analyst</strong>: Can view aggregate statistical Dashboards and interact with universal Records. Cannot add or remove data.</div></div>
            <div style={{ display: 'flex', gap: '1rem' }}><ShieldAlert size={20} className="text-muted" /> <div><strong>Admin</strong>: Complete system control. Can add/modify/remove records, and manage employee users & roles.</div></div>
          </div>
        </div>

      </div>
    </div>
  );
}
