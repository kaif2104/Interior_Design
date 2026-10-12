import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPayment, getPayments } from '../api/payment';
import { getConsultations } from '../api/consultation';
import { getOrders } from '../api/orders';
import QRCodePayment from '../components/QRCodePayment';
import './Billing.css';

function Billing() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') === 'items' ? 'items' : 'milestones';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectName, setProjectName] = useState('Bespoke Architectural Renovation');
  const [designerName, setDesignerName] = useState('Priya Sharma (Lead Architect)');
  const [totalProjectAmount, setTotalProjectAmount] = useState(500000);
  const [userConsultation, setUserConsultation] = useState(null);

  const [paymentHistory, setPaymentHistory] = useState([]);
  const [itemOrders, setItemOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State (Interior Milestones)
  const [showPayModal, setShowPayModal] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState({
    title: '50% Half Payment - 3D Render Signoff & Material Procurement',
    amount: 250000
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Milestone Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Separate Item Tax Invoice Modal State
  const [selectedItemInvoice, setSelectedItemInvoice] = useState(null);

  // Load user data whenever user logs in or switches account
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setClientName(user.name || '');
    setClientEmail(user.email || '');
    setClientPhone(user.phone || '');

    const loadUserData = async () => {
      setLoading(true);
      try {
        // 1. Fetch milestone payments strictly for this user
        const payRes = await getPayments({ clientEmail: user.email });
        setPaymentHistory(payRes.data.payments || []);

        // 2. Fetch standalone item purchase orders for this user
        const orderRes = await getOrders({ clientEmail: user.email });
        setItemOrders(orderRes.data.orders || []);

        // 3. Fetch consultations booked by this user
        const consRes = await getConsultations({ clientEmail: user.email });
        if (consRes.data && consRes.data.length > 0) {
          const latestCons = consRes.data[0];
          setUserConsultation(latestCons);
          setProjectName(`${latestCons.propertyType} ${latestCons.roomType} (${latestCons.preferredStyle})`);
          if (latestCons.referenceProjectTitle) {
            setProjectName(`${latestCons.referenceProjectTitle} - ${latestCons.propertyType}`);
          }
        } else {
          setUserConsultation(null);
          setProjectName('Residential Interior Transformation');
        }
      } catch (err) {
        console.error('Error fetching user billing data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Calculate real total paid from user's actual completed payments
  const totalPaid = paymentHistory.reduce(
    (acc, p) => acc + (p.status === 'Completed' ? p.amountPaid : 0),
    0
  );
  const remainingBalance = Math.max(0, totalProjectAmount - totalPaid);
  const progressPercent = Math.min(100, Math.round((totalPaid / totalProjectAmount) * 100));

  // Check which milestones this specific user has completed
  const isMilestone1Paid = paymentHistory.some(
    (p) => p.status === 'Completed' && (p.milestoneTitle.includes('Milestone 1') || p.milestoneTitle.includes('Token') || p.milestoneTitle.includes('10%'))
  );
  const isMilestone2Paid = paymentHistory.some(
    (p) => p.status === 'Completed' && (p.milestoneTitle.includes('Milestone 2') || p.milestoneTitle.includes('50%') || p.milestoneTitle.includes('Half Payment'))
  );
  const isMilestone3Paid = paymentHistory.some(
    (p) => p.status === 'Completed' && (p.milestoneTitle.includes('Milestone 3') || p.milestoneTitle.includes('25%'))
  );
  const isMilestone4Paid = paymentHistory.some(
    (p) => p.status === 'Completed' && (p.milestoneTitle.includes('Milestone 4') || p.milestoneTitle.includes('15%'))
  );

  const handleOpenPayment = (title, amount) => {
    setActiveMilestone({ title, amount });
    setError('');
    setShowPayModal(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const payload = {
        clientName: user?.name || clientName,
        clientEmail: user?.email || clientEmail,
        clientPhone: user?.phone || clientPhone,
        projectName,
        designerName,
        totalProjectAmount,
        milestoneTitle: activeMilestone.title,
        amountPaid: activeMilestone.amount,
        paymentMethod,
        userId: user?.id || user?._id || undefined
      };

      const res = await createPayment(payload);
      setShowPayModal(false);
      setSelectedReceipt(res.data.payment);

      // Refresh payments for this user
      if (user?.email) {
        const payRes = await getPayments({ clientEmail: user.email });
        setPaymentHistory(payRes.data.payments || []);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // If NOT logged in, show auth gate
  if (!isAuthenticated) {
    return (
      <div className="billing-page">
        <div className="billing-container" style={{ maxWidth: '680px', textAlign: 'center', padding: '60px 20px' }}>
          <div className="billing-card" style={{ padding: '50px 30px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <span className="billing-badge">Client Portal</span>
            <h1 style={{ fontSize: '28px', color: '#141414', margin: '10px 0 14px' }}>
              Sign In to Access Your Project Billing
            </h1>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
              Each project quotation, milestone schedule, and payment receipt is strictly private and tied to your registered client account.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <Link
                to="/login"
                style={{
                  background: '#1a1a1a',
                  color: '#ffffff',
                  padding: '12px 28px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '14px'
                }}
              >
                Sign In to Account →
              </Link>
              <Link
                to="/signup"
                style={{
                  background: '#f0ede8',
                  color: '#333',
                  padding: '12px 28px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Create New Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-page">
      <div className="billing-container">
        {/* Header */}
        <div className="billing-header">
          <span className="billing-badge">Personal Project Account</span>
          <h1>Milestone Billing & Payments</h1>
          <p className="billing-subtitle">
            Welcome, <strong>{user.name}</strong> ({user.email}). Track your project quotation, authorize 50% milestone advances, and view verified digital tax receipts.
          </p>
        </div>

        {/* Top Tab Switcher */}
        <div className="billing-tab-switcher">
          <button
            className={`billing-tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
          >
            📐 Interior Design Milestones
            <span className="billing-tab-count">{paymentHistory.length}</span>
          </button>

          <button
            className={`billing-tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            🛍️ Decor & Furnishings Invoices
            <span className="billing-tab-count">{itemOrders.length}</span>
          </button>
        </div>

        {/* TAB 1: INTERIOR DESIGN MILESTONES */}
        {activeTab === 'milestones' && (
          <>
            {/* Lead Designer & Consultation Status Banner */}
            <div className="designer-callout">
          <div className="designer-avatar">📐</div>
          <div className="designer-callout-text">
            <h4>
              {userConsultation
                ? `Project Request Active: ${userConsultation.roomType} (${userConsultation.propertyType})`
                : `Consultation Stage with ${designerName}`}
            </h4>
            <p>
              {userConsultation ? (
                <>
                  Your consultation request for <strong>{userConsultation.roomType}</strong> (Estimated Budget:{' '}
                  <strong>{userConsultation.budgetRange}</strong>) is under active review. Make the{' '}
                  <strong>50% Half Payment (Milestone 2)</strong> to unlock full 3D photorealistic walk-throughs and commence factory raw material procurement.
                </>
              ) : (
                <>
                  You have not submitted a specific design booking yet.{' '}
                  <Link to="/book-consultation" style={{ color: '#c59d5f', fontWeight: 'bold' }}>
                    Book a free consultation
                  </Link>{' '}
                  to customize your floor plan, or test out a 50% advance milestone payment below.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="billing-layout">
          {/* Left: Milestones Timeline */}
          <div className="billing-card">
            <div className="card-title-row">
              <h2>Project Milestone Schedule</h2>
              <span className="project-tag">{projectName}</span>
            </div>

            {/* Progress Bar */}
            <div className="milestone-progress-box">
              <div className="progress-header">
                <span>Billing Progress: {progressPercent}% Paid</span>
                <span>₹{totalPaid.toLocaleString()} / ₹{totalProjectAmount.toLocaleString()}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="progress-meta">
                <span>Remaining Balance: ₹{remainingBalance.toLocaleString()}</span>
                <span>Account: {user.email}</span>
              </div>
            </div>

            {/* Milestone Items */}
            <div className="milestone-list">
              {/* Milestone 1 */}
              <div className={`milestone-item ${isMilestone1Paid ? 'paid' : 'active'}`}>
                <div className="milestone-left">
                  <div className="milestone-icon">{isMilestone1Paid ? '✓' : '1'}</div>
                  <div className="milestone-details">
                    <h4>Milestone 1: Discovery & Consultation Token (10%)</h4>
                    <p>Site measurement, space layout & initial mood board discussion.</p>
                  </div>
                </div>
                <div className="milestone-right">
                  <span className="milestone-amount">₹50,000</span>
                  {isMilestone1Paid ? (
                    <span className="status-badge paid">Paid & Verified</span>
                  ) : (
                    <button
                      className="btn-pay-milestone"
                      onClick={() =>
                        handleOpenPayment(
                          'Milestone 1: Discovery & Consultation Token (10%)',
                          50000
                        )
                      }
                    >
                      Pay Token (₹50k) →
                    </button>
                  )}
                </div>
              </div>

              {/* Milestone 2 (50% Half Payment) */}
              <div className={`milestone-item ${isMilestone2Paid ? 'paid' : 'active'}`}>
                <div className="milestone-left">
                  <div className="milestone-icon">{isMilestone2Paid ? '✓' : '2'}</div>
                  <div className="milestone-details">
                    <h4>Milestone 2: 50% Half Payment (Procurement Advance)</h4>
                    <p>Photorealistic 3D renders, BOQ finalization & factory raw material booking.</p>
                  </div>
                </div>
                <div className="milestone-right">
                  <span className="milestone-amount">₹2,50,000</span>
                  {isMilestone2Paid ? (
                    <span className="status-badge paid">Paid & Verified</span>
                  ) : (
                    <button
                      className="btn-pay-milestone"
                      onClick={() =>
                        handleOpenPayment(
                          '50% Half Payment - 3D Render Signoff & Material Procurement',
                          250000
                        )
                      }
                    >
                      Pay 50% Half Payment →
                    </button>
                  )}
                </div>
              </div>

              {/* Milestone 3 */}
              <div className={`milestone-item ${isMilestone3Paid ? 'paid' : ''}`}>
                <div className="milestone-left">
                  <div className="milestone-icon">{isMilestone3Paid ? '✓' : '3'}</div>
                  <div className="milestone-details">
                    <h4>Milestone 3: On-Site Carpentry & Civil Work (25%)</h4>
                    <p>Carcass installation, electricals, plumbing & false ceiling work.</p>
                  </div>
                </div>
                <div className="milestone-right">
                  <span className="milestone-amount">₹1,25,000</span>
                  {isMilestone3Paid ? (
                    <span className="status-badge paid">Paid & Verified</span>
                  ) : isMilestone2Paid ? (
                    <button
                      className="btn-pay-milestone"
                      onClick={() =>
                        handleOpenPayment(
                          'Milestone 3: On-Site Carpentry & Civil Work (25%)',
                          125000
                        )
                      }
                    >
                      Pay Milestone 3 →
                    </button>
                  ) : (
                    <span className="status-badge upcoming">Upcoming</span>
                  )}
                </div>
              </div>

              {/* Milestone 4 */}
              <div className={`milestone-item ${isMilestone4Paid ? 'paid' : ''}`}>
                <div className="milestone-left">
                  <div className="milestone-icon">{isMilestone4Paid ? '✓' : '4'}</div>
                  <div className="milestone-details">
                    <h4>Milestone 4: Final Handover & Styling (15%)</h4>
                    <p>Laminates, soft furnishings, deep cleaning & 10-year warranty handover.</p>
                  </div>
                </div>
                <div className="milestone-right">
                  <span className="milestone-amount">₹75,000</span>
                  {isMilestone4Paid ? (
                    <span className="status-badge paid">Paid & Verified</span>
                  ) : isMilestone3Paid ? (
                    <button
                      className="btn-pay-milestone"
                      onClick={() =>
                        handleOpenPayment(
                          'Milestone 4: Final Handover & Styling (15%)',
                          75000
                        )
                      }
                    >
                      Pay Final Balance →
                    </button>
                  ) : (
                    <span className="status-badge upcoming">Upcoming</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Cost Overview & Quick Half Payment CTA */}
          <div className="billing-card" style={{ height: 'fit-content' }}>
            <div className="card-title-row">
              <h2>Quotation Breakdown</h2>
            </div>

            <div className="overview-box">
              <div className="overview-row">
                <span>Total Project Value:</span>
                <strong>₹{totalProjectAmount.toLocaleString()}</strong>
              </div>
              <div className="overview-row">
                <span>Total Paid So Far:</span>
                <span style={{ color: totalPaid > 0 ? '#27ae60' : '#777', fontWeight: '600' }}>
                  ₹{totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="overview-row total">
                <span>Balance Remaining:</span>
                <span>₹{remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            {!isMilestone2Paid ? (
              <button
                className="btn-half-payment-cta"
                onClick={() =>
                  handleOpenPayment(
                    '50% Half Payment - 3D Render Signoff & Material Procurement',
                    250000
                  )
                }
              >
                💳 Pay 50% Half Payment (₹2,50,000)
              </button>
            ) : (
              <div style={{ background: '#e6f7ed', color: '#27ae60', padding: '12px', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                ✓ 50% Procurement Advance Paid!
              </div>
            )}

            <p className="guarantee-note">
              🔒 100% Escrow-backed milestone payments. Funds are released based on agreed quality check benchmarks.
            </p>

            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #f0ede8', textAlign: 'center' }}>
              <Link to="/feedback" style={{ color: '#c59d5f', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
                ✍️ Share Ongoing Review with your Designer →
              </Link>
            </div>
          </div>
        </div>

        {/* Transaction History Table for THIS user */}
        <div className="billing-card history-section">
          <div className="card-title-row">
            <h2>Payment & Invoice Records for {user.name}</h2>
            <span style={{ fontSize: '13px', color: '#777' }}>
              {paymentHistory.length} recorded {paymentHistory.length === 1 ? 'receipt' : 'receipts'}
            </span>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#777' }}>Loading your private invoices...</p>
          ) : paymentHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#777' }}>
              <p style={{ fontSize: '15px', marginBottom: '8px' }}>No payments recorded under <strong>{user.email}</strong> yet.</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Click "Pay 50% Half Payment" above to process your first advance milestone payment.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Date</th>
                    <th>Milestone Description</th>
                    <th>Method</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((txn) => (
                    <tr key={txn._id}>
                      <td><strong>{txn.receiptNumber}</strong></td>
                      <td>{new Date(txn.createdAt).toLocaleDateString()}</td>
                      <td>{txn.milestoneTitle}</td>
                      <td>{txn.paymentMethod}</td>
                      <td><strong>₹{txn.amountPaid.toLocaleString()}</strong></td>
                      <td>
                        <span className="status-badge paid">{txn.status}</span>
                      </td>
                      <td>
                        <button
                          className="btn-view-receipt"
                          onClick={() => setSelectedReceipt(txn)}
                        >
                          View Receipt 📄
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}

        {/* TAB 2: DECOR & FURNISHINGS INVOICES */}
        {activeTab === 'items' && (
          <>
            {/* Callout Banner */}
            <div className="designer-callout" style={{ borderLeftColor: '#c59d5f' }}>
              <div className="designer-avatar" style={{ background: '#1a1a1a', color: '#c59d5f' }}>🛍️</div>
              <div className="designer-callout-text">
                <h4>Direct Decor & Furnishings Purchasing Ledger</h4>
                <p>
                  Separate itemized billing for individual physical products (lamps, chairs, wallpapers, tables, and rugs) purchased directly from our store. Includes official digital tax invoices and real-time delivery tracking.
                </p>
              </div>
            </div>

            {/* Invoices List Section */}
            <div className="history-section billing-card" style={{ marginTop: 0 }}>
              <div className="card-title-row">
                <div>
                  <h2>Physical Item Tax Invoices & Order Receipts</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
                    Standalone item purchases billed separately from project milestones.
                  </p>
                </div>
                <Link
                  to="/items"
                  style={{
                    background: '#1a1a1a',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                >
                  + Shop More Furnishings
                </Link>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>Loading your furnishing orders...</p>
              ) : itemOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#777' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                  <h3 style={{ color: '#141414', margin: '0 0 6px' }}>No standalone item purchases yet</h3>
                  <p style={{ fontSize: '14px', maxWidth: '500px', margin: '0 auto 18px' }}>
                    You can buy lamps, accent chairs, textured wallpapers, and coffee tables individually without needing a full design project.
                  </p>
                  <Link
                    to="/items"
                    style={{
                      background: '#c59d5f',
                      color: '#1a1a1a',
                      padding: '10px 22px',
                      borderRadius: '6px',
                      fontWeight: '700',
                      textDecoration: 'none'
                    }}
                  >
                    Browse Furnishings Catalog →
                  </Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Tax Invoice No.</th>
                        <th>Order Reference</th>
                        <th>Date</th>
                        <th>Items Purchased</th>
                        <th>Delivery Destination</th>
                        <th>Total Amount</th>
                        <th>Delivery Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemOrders.map((order) => {
                        const firstItem = order.items && order.items[0];
                        const totalItemQty = order.items ? order.items.reduce((sum, it) => sum + it.quantity, 0) : 1;

                        return (
                          <tr key={order._id}>
                            <td><strong>{order.receiptNumber}</strong></td>
                            <td style={{ fontSize: '12px', color: '#666' }}>{order.orderNumber}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="item-order-thumb-group">
                                {firstItem?.image && (
                                  <img
                                    src={firstItem.image}
                                    alt={firstItem.name}
                                    className="item-order-mini-thumb"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80';
                                    }}
                                  />
                                )}
                                <div>
                                  <div style={{ fontWeight: '600', color: '#141414' }}>
                                    {firstItem?.name} {order.items.length > 1 ? `(+${order.items.length - 1} more)` : ''}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#777' }}>
                                    Qty: {totalItemQty} unit{totalItemQty > 1 ? 's' : ''} • {order.paymentMethod}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>{order.shippingAddress?.city}</div>
                              <div style={{ fontSize: '11px', color: '#777' }}>PIN: {order.shippingAddress?.pincode}</div>
                            </td>
                            <td>
                              <strong style={{ color: '#27ae60', fontSize: '15px' }}>
                                ₹{order.totalAmount?.toLocaleString()}
                              </strong>
                            </td>
                            <td>
                              <span className={`status-pill ${order.orderStatus?.toLowerCase() || 'processing'}`}>
                                {order.orderStatus || 'Processing'}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-view-receipt"
                                onClick={() => setSelectedItemInvoice(order)}
                              >
                                Tax Invoice 📄
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* PAYMENT CHECKOUT MODAL */}
        {showPayModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close-btn" onClick={() => setShowPayModal(false)}>
                ✕
              </button>

              <div className="modal-header">
                <h3>Secure Milestone Checkout</h3>
                <p>{activeMilestone.title}</p>
              </div>

              {error && <div style={{ color: '#c53030', marginBottom: '14px', fontSize: '14px' }}>{error}</div>}

              {/* Payment Methods */}
              <div className="payment-methods-grid">
                <div
                  className={`payment-method-card ${paymentMethod === 'UPI / QR Code' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('UPI / QR Code')}
                >
                  <div className="method-icon">📱</div>
                  <div className="method-name">UPI / QR</div>
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'Credit / Debit Card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Credit / Debit Card')}
                >
                  <div className="method-icon">💳</div>
                  <div className="method-name">Cards</div>
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'Net Banking' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('Net Banking')}
                >
                  <div className="method-icon">🏦</div>
                  <div className="method-name">Net Banking</div>
                </div>
              </div>

              {/* Dynamic QR Code Payment when UPI is selected */}
              {paymentMethod === 'UPI / QR Code' ? (
                <QRCodePayment
                  amount={activeMilestone.amount}
                  orderRef={`MILESTONE-${activeMilestone.id || 'STAGE'}`}
                  clientName={user.name}
                  onPaymentConfirmed={(utr) => handleProcessPayment(null, utr)}
                />
              ) : (
                <form onSubmit={handleProcessPayment}>
                  <div className="modal-form-group">
                    <label>Client Name (Account Holder)</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={user.name}
                      disabled
                      style={{ background: '#f5f5f5' }}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Billing Email</label>
                    <input
                      type="email"
                      className="modal-input"
                      value={user.email}
                      disabled
                      style={{ background: '#f5f5f5' }}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label>Payment Amount (INR)</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={`₹${activeMilestone.amount.toLocaleString()}`}
                      disabled
                      style={{ background: '#f5f5f5', fontWeight: 'bold' }}
                    />
                  </div>

                  <button type="submit" className="btn-confirm-pay" disabled={processing}>
                    {processing
                      ? 'Verifying & Processing Payment...'
                      : `Confirm & Pay ₹${activeMilestone.amount.toLocaleString()} →`}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* DIGITAL RECEIPT / TAX INVOICE MODAL */}
        {selectedReceipt && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close-btn" onClick={() => setSelectedReceipt(null)}>
                ✕
              </button>

              <div className="receipt-box">
                <div className="receipt-header">
                  <div className="receipt-brand">
                    <h4>INTERIOR STUDIO</h4>
                    <span style={{ fontSize: '12px', color: '#888' }}>Tax Invoice & Milestone Receipt</span>
                  </div>
                  <span className="receipt-badge">PAID IN FULL</span>
                </div>

                <div className="receipt-grid">
                  <div>
                    <span>Receipt No:</span>
                    <strong>{selectedReceipt.receiptNumber}</strong>
                  </div>
                  <div>
                    <span>Transaction ID:</span>
                    <strong>{selectedReceipt.transactionId}</strong>
                  </div>
                  <div>
                    <span>Client Name:</span>
                    <strong>{selectedReceipt.clientName}</strong>
                  </div>
                  <div>
                    <span>Payment Date:</span>
                    <strong>{new Date(selectedReceipt.createdAt).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Project Scope:</span>
                    <strong>{selectedReceipt.projectName}</strong>
                  </div>
                  <div>
                    <span>Lead Architect:</span>
                    <strong>{selectedReceipt.designerName}</strong>
                  </div>
                </div>

                <div style={{ margin: '15px 0', padding: '12px 0', borderTop: '1px solid #f0ede8', borderBottom: '1px solid #f0ede8' }}>
                  <div style={{ fontSize: '13px', color: '#777', marginBottom: '4px' }}>Milestone Paid:</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#141414' }}>
                    {selectedReceipt.milestoneTitle}
                  </div>
                </div>

                <div className="receipt-amount-banner">
                  <span>Total Paid (INR):</span>
                  <span style={{ color: '#27ae60', fontSize: '20px' }}>
                    ₹{selectedReceipt.amountPaid.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-confirm-pay"
                  style={{ background: '#1a1a1a' }}
                  onClick={() => window.print()}
                >
                  🖨️ Print / Save Receipt
                </button>
                <button
                  className="btn-confirm-pay"
                  style={{ background: '#f0ede8', color: '#333' }}
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STANDALONE ITEM TAX INVOICE MODAL */}
        {selectedItemInvoice && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '650px' }}>
              <button className="modal-close-btn" onClick={() => setSelectedItemInvoice(null)}>
                ✕
              </button>

              <div className="receipt-box">
                <div className="receipt-header">
                  <div className="receipt-brand">
                    <h4>INTERIOR STUDIO & FURNISHINGS</h4>
                    <span style={{ fontSize: '12px', color: '#888' }}>Official Decor & Furnishing Tax Invoice</span>
                  </div>
                  <span className="receipt-badge" style={{ background: '#d1fae5', color: '#047857' }}>
                    {selectedItemInvoice.paymentStatus || 'PAID & VERIFIED'}
                  </span>
                </div>

                <div className="receipt-grid">
                  <div>
                    <span>Tax Invoice No:</span>
                    <strong>{selectedItemInvoice.receiptNumber}</strong>
                  </div>
                  <div>
                    <span>Order Reference:</span>
                    <strong>{selectedItemInvoice.orderNumber}</strong>
                  </div>
                  <div>
                    <span>Customer Name:</span>
                    <strong>{selectedItemInvoice.clientName}</strong>
                  </div>
                  <div>
                    <span>Invoice Date:</span>
                    <strong>{new Date(selectedItemInvoice.createdAt).toLocaleString()}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span>Delivery Address:</span>
                    <strong>
                      {selectedItemInvoice.shippingAddress?.street}, {selectedItemInvoice.shippingAddress?.city} - {selectedItemInvoice.shippingAddress?.pincode}
                    </strong>
                  </div>
                  <div>
                    <span>Payment Method:</span>
                    <strong>{selectedItemInvoice.paymentMethod}</strong>
                  </div>
                  <div>
                    <span>Delivery Status:</span>
                    <strong style={{ color: '#2563eb' }}>{selectedItemInvoice.orderStatus || 'Processing'}</strong>
                  </div>
                </div>

                {/* Itemized Table */}
                <div style={{ margin: '15px 0', borderTop: '1px solid #f0ede8', borderBottom: '1px solid #f0ede8', padding: '12px 0' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#444' }}>
                    Purchased Furnishings Breakdown:
                  </div>
                  {selectedItemInvoice.items && selectedItemInvoice.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: '600' }}>{item.name}</div>
                          <div style={{ fontSize: '11px', color: '#777' }}>Qty: {item.quantity} x ₹{item.price?.toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: '700' }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="receipt-amount-banner">
                  <span>Grand Total Paid (INR):</span>
                  <span style={{ color: '#27ae60', fontSize: '22px' }}>
                    ₹{selectedItemInvoice.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-confirm-pay"
                  style={{ background: '#1a1a1a' }}
                  onClick={() => window.print()}
                >
                  🖨️ Print Tax Invoice
                </button>
                <button
                  className="btn-confirm-pay"
                  style={{ background: '#f0ede8', color: '#333' }}
                  onClick={() => setSelectedItemInvoice(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Billing;
