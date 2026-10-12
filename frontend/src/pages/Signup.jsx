import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../api/auth';
import Captcha from '../components/Captcha';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

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

    // Captcha validation
    if (!captchaInput || captchaInput.trim().toUpperCase() !== currentCaptcha.trim().toUpperCase()) {
      setError('Security verification failed. Please enter the correct Captcha characters.');
      return;
    }

    setLoading(true);
    try {
      await signupUser(formData);
      alert('Account registered successfully! Please sign in with your credentials.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        maxWidth: '460px',
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
          }}>New Client Registration</span>
          <h2 style={{ fontSize: '28px', color: '#141414', margin: '8px 0 4px' }}>Create Account</h2>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Join Interior Studio to manage your interior design projects, floor plans, and milestone billing.</p>
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
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Rahul Verma"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #dcd6ce',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. rahul@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #dcd6ce',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #dcd6ce',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. +91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #dcd6ce',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* CAPTCHA CHALLENGE */}
          <Captcha onCaptchaChange={handleCaptchaChange} />

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
              transition: '0.2s',
              marginTop: '8px'
            }}
          >
            {loading ? 'Creating Account...' : 'Register Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '22px', marginBottom: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#c59d5f', fontWeight: '600', textDecoration: 'none' }}>
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;