import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrders } from '../api/orders';

function MyOrders() {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async (showLoader = true) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await getOrders({
        userId: user.id || user._id || undefined,
        clientEmail: user.email
      });

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load orders when page opens
  useEffect(() => {
    loadOrders();
  }, [user]);

  // Automatically check for admin status changes every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      loadOrders(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(false);
  };

  const getStatusClass = (status) => {
    return (status || 'Processing')
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#faf9f6',
          padding: '40px'
        }}
      >
        <div
          style={{
            background: '#fff',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid #e5e0d8',
            maxWidth: '500px'
          }}
        >
          <div style={{ fontSize: '45px' }}>🔐</div>

          <h2 style={{ color: '#141414' }}>
            Please Login
          </h2>

          <p style={{ color: '#777' }}>
            Please login to view your orders and delivery status.
          </p>

          <Link
            to="/login"
            style={{
              display: 'inline-block',
              marginTop: '15px',
              background: '#c59d5f',
              color: '#1a1a1a',
              padding: '10px 22px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '700'
            }}
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#faf9f6',
        padding: '50px 25px 80px'
      }}
    >
      <div
        style={{
          maxWidth: '1150px',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '35px'
          }}
        >
          <span
            style={{
              display: 'inline-block',
              background: '#f7efe6',
              color: '#c59d5f',
              padding: '7px 18px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}
          >
            Customer Account
          </span>

          <h1
            style={{
              fontSize: '40px',
              color: '#141414',
              margin: '14px 0 8px'
            }}
          >
            My Orders
          </h1>

          <p
            style={{
              color: '#777',
              fontSize: '15px',
              margin: 0
            }}
          >
            Track your furnishing purchases and delivery status.
          </p>
        </div>

        {/* Top information bar */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e8e2d9',
            borderRadius: '12px',
            padding: '18px 22px',
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}
        >
          <div>
            <strong style={{ color: '#141414' }}>
              Hello, {user.name}
            </strong>

            <div
              style={{
                color: '#777',
                fontSize: '13px',
                marginTop: '4px'
              }}
            >
              {user.email}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '6px',
              cursor: refreshing ? 'default' : 'pointer',
              fontWeight: '600'
            }}
          >
            {refreshing ? 'Refreshing...' : '↻ Refresh Orders'}
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '60px',
              textAlign: 'center',
              border: '1px solid #e8e2d9'
            }}
          >
            <div style={{ fontSize: '40px' }}>📦</div>
            <h3>Loading your orders...</h3>
            <p style={{ color: '#777' }}>
              Please wait while we retrieve your orders.
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* No orders */
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '70px 30px',
              textAlign: 'center',
              border: '1px solid #e8e2d9'
            }}
          >
            <div style={{ fontSize: '55px' }}>🛍️</div>

            <h2 style={{ color: '#141414' }}>
              No Orders Yet
            </h2>

            <p
              style={{
                color: '#777',
                maxWidth: '500px',
                margin: '0 auto 22px'
              }}
            >
              You haven't purchased any furnishings yet.
              Browse our collection and place your first order.
            </p>

            <Link
              to="/items"
              style={{
                display: 'inline-block',
                background: '#c59d5f',
                color: '#1a1a1a',
                padding: '11px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '700'
              }}
            >
              Browse Items →
            </Link>
          </div>
        ) : (
          /* Orders */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '22px'
            }}
          >
            {orders.map((order) => {
              const status = order.orderStatus || 'Processing';

              return (
                <div
                  key={order._id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5dfd6',
                    borderRadius: '14px',
                    padding: '25px',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Order Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '15px',
                      flexWrap: 'wrap',
                      borderBottom: '1px solid #eee8df',
                      paddingBottom: '18px',
                      marginBottom: '20px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#999',
                          marginBottom: '5px'
                        }}
                      >
                        ORDER NUMBER
                      </div>

                      <strong
                        style={{
                          fontSize: '17px',
                          color: '#141414'
                        }}
                      >
                        {order.orderNumber}
                      </strong>

                      <div
                        style={{
                          fontSize: '12px',
                          color: '#777',
                          marginTop: '5px'
                        }}
                      >
                        Ordered on{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`status-pill ${getStatusClass(status)}`}
                      style={{
                        padding: '8px 15px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'inline-block'
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Items */}
                  <div>
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px',
                          padding: '12px 0',
                          borderBottom:
                            index !== order.items.length - 1
                              ? '1px solid #f0ece6'
                              : 'none'
                        }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '70px',
                              height: '70px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '70px',
                              height: '70px',
                              background: '#f3efe9',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '25px'
                            }}
                          >
                            🛋️
                          </div>
                        )}

                        <div style={{ flex: 1 }}>
                          <strong style={{ color: '#222' }}>
                            {item.name}
                          </strong>

                          <div
                            style={{
                              fontSize: '13px',
                              color: '#777',
                              marginTop: '4px'
                            }}
                          >
                            Quantity: {item.quantity}
                          </div>
                        </div>

                        <strong style={{ color: '#333' }}>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Bottom information */}
                  <div
                    style={{
                      marginTop: '20px',
                      paddingTop: '18px',
                      borderTop: '1px solid #eee8df',
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '15px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          textTransform: 'uppercase'
                        }}
                      >
                        Payment
                      </div>

                      <strong style={{ fontSize: '14px' }}>
                        {order.paymentMethod}
                      </strong>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          textTransform: 'uppercase'
                        }}
                      >
                        Payment Status
                      </div>

                      <strong
                        style={{
                          fontSize: '14px',
                          color: '#27ae60'
                        }}
                      >
                        {order.paymentStatus}
                      </strong>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          textTransform: 'uppercase'
                        }}
                      >
                        Delivery
                      </div>

                      <strong style={{ fontSize: '14px' }}>
                        {order.shippingAddress?.city},{' '}
                        {order.shippingAddress?.pincode}
                      </strong>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          textTransform: 'uppercase'
                        }}
                      >
                        Total
                      </div>

                      <strong
                        style={{
                          fontSize: '18px',
                          color: '#c59d5f'
                        }}
                      >
                        ₹{order.totalAmount?.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Tracking progress */}
                  <div
                    style={{
                      marginTop: '22px',
                      background: '#faf8f4',
                      borderRadius: '10px',
                      padding: '18px'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        marginBottom: '12px',
                        color: '#333'
                      }}
                    >
                      Order Progress
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '5px',
                        fontSize: '11px',
                        color: '#777'
                      }}
                    >
                      {[
                        'Processing',
                        'Dispatched',
                        'In Transit',
                        'Delivered'
                      ].map((step) => {
                        const steps = [
                          'Processing',
                          'Dispatched',
                          'In Transit',
                          'Delivered'
                        ];

                        const currentIndex = steps.indexOf(status);
                        const stepIndex = steps.indexOf(step);
                        const completed =
                          stepIndex <= currentIndex &&
                          status !== 'Cancelled';

                        return (
                          <div
                            key={step}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              color: completed
                                ? '#c59d5f'
                                : '#aaa',
                              fontWeight: completed
                                ? '700'
                                : '400'
                            }}
                          >
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: completed
                                  ? '#c59d5f'
                                  : '#ddd',
                                margin: '0 auto 6px'
                              }}
                            />

                            {step}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {status === 'Cancelled' && (
                    <div
                      style={{
                        marginTop: '15px',
                        padding: '12px',
                        background: '#fff0f0',
                        color: '#c0392b',
                        borderRadius: '7px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}
                    >
                      ⚠️ This order has been cancelled.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;