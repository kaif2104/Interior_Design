import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Captcha from '../components/Captcha';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);

  // Captcha State
  const [captchaInput, setCaptchaInput] = useState('');
  const [currentCaptcha, setCurrentCaptcha] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (input, expected) => {
    setCaptchaInput(input);
    setCurrentCaptcha(expected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verify Captcha
    if (!captchaInput || captchaInput.trim().toUpperCase() !== currentCaptcha.trim().toUpperCase()) {
      setError('Security verification failed. Please enter the correct Captcha characters shown in the box.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser({
        ...formData,
        rememberMe
      });

      login(res.data.user, res.data.token);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#faf9f6'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        border: '1px solid #eae6e0',
        borderRadius: '12px',
        padding: '35px',
        boxShadow: '0 6px 25px rgba(0,0,0,0.04)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#c59d5f',
            fontWeight: '700'
          }}>Client & Admin Portal</span>
          <h2 style={{ fontSize: '28px', color: '#141414', margin: '8px 0 4px' }}>Welcome Back</h2>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Log in to access your consultations, milestone payments, and project updates.</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. client@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #dcd6ce',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1px solid #dcd6ce',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* CAPTCHA CHALLENGE */}
          <Captcha onCaptchaChange={handleCaptchaChange} />

          {/* REMEMBER ME / COOKIE SESSION */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#555', cursor: 'pointer' }}>
              Keep session active (30-day Cookie Session)
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            {loading ? 'Verifying & Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '22px', marginBottom: 0 }}>
          Don't have an account yet?{' '}
          <Link to="/signup" style={{ color: '#c59d5f', fontWeight: '600', textDecoration: 'none' }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;