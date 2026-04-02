import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Viewer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = isLogin
        ? await login(email, password)
        : await register(name, email, password, role);
      if (userData.role === 'Viewer') navigate('/records');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-panel auth-card">
        <h1>💎 Zorvyn</h1>
        <p className="subtitle">{isLogin ? 'Sign in to your finance dashboard' : 'Create your account'}</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="Viewer">👁 Viewer — Read only access</option>
                <option value="Analyst">📊 Analyst — View records + dashboard</option>
                <option value="Admin">⚡ Admin — Full access</option>
              </select>
            </>
          )}
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>{isLogin ? 'Sign up' : 'Log in'}</span>
        </div>
      </div>
    </div>
  );
}
