import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openCart, cartCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      background: '#1a1a1a',
      color: '#fff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
        <Link to="/" style={{
          color: '#fff',
          textDecoration: 'none',
          fontSize: '20px',
          fontWeight: '700',
          letterSpacing: '1px'
        }}>
          INTERIOR<span style={{ color: '#c59d5f' }}>STUDIO</span>
        </Link>
        
        <div style={{ display: 'flex', gap: '18px', fontSize: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#ccc', textDecoration: 'none', transition: '0.2s' }}>
            Home
          </Link>

          <Link to="/portfolio" style={{ color: '#ccc', textDecoration: 'none', transition: '0.2s' }}>
            Portfolio
          </Link>

          <Link to="/items" style={{ color: '#ccc', textDecoration: 'none', transition: '0.2s' }}>
            Items & Decor
          </Link>

          <Link to="/book-consultation" style={{ color: '#e6c280', textDecoration: 'none', fontWeight: '500' }}>
            Book Consultation
          </Link>

          <Link to="/billing" style={{ color: '#ccc', textDecoration: 'none', transition: '0.2s' }}>
            Billing & Milestones
          </Link>

          {/* My Orders */}
          {user && user.role !== 'admin' && (
            <Link
              to="/my-orders"
              style={{
                color: '#ccc',
                textDecoration: 'none',
                transition: '0.2s'
              }}
            >
              My Orders
            </Link>
          )}

          <Link to="/feedback" style={{ color: '#ccc', textDecoration: 'none', transition: '0.2s' }}>
            Client Reviews
          </Link>

          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              style={{
                color: '#1a1a1a',
                background: '#c59d5f',
                padding: '4px 10px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '12px'
              }}
            >
              ⚙️ Admin Panel
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>

        {/* Shopping Cart Button */}
        <button
          onClick={openCart}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#2a2a2a',
            border: '1px solid #444',
            color: '#fff',
            padding: '7px 14px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          title="View Studio Shopping Cart"
        >
          <span>🛍️ Cart</span>

          {cartCount > 0 && (
            <span style={{
              background: '#c59d5f',
              color: '#1a1a1a',
              fontSize: '11px',
              fontWeight: '800',
              padding: '2px 7px',
              borderRadius: '10px'
            }}>
              {cartCount}
            </span>
          )}
        </button>

        {user ? (
          <>
            <span style={{ fontSize: '14px', color: '#bbb' }}>
              Hello, <strong style={{ color: '#fff' }}>{user.name}</strong>

              {user.role === 'admin' && (
                <span style={{
                  marginLeft: '8px',
                  background: '#c59d5f',
                  color: '#1a1a1a',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  ADMIN
                </span>
              )}
            </span>

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #555',
                color: '#ddd',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: '#ddd',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Login
            </Link>

            <Link
              to="/signup"
              style={{
                background: '#c59d5f',
                color: '#1a1a1a',
                textDecoration: 'none',
                padding: '7px 16px',
                borderRadius: '4px',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
