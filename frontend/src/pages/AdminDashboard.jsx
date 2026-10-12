import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStats,
  getAllUsers,
  updateConsultationStatus,
  deleteConsultation,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getAllPaymentsAdmin,
  createStoreItem,
  deleteStoreItem
} from '../api/admin';
import { getConsultations } from '../api/consultation';
import { getPortfolioItems } from '../api/portfolio';
import { getItems } from '../api/items';
import { getOrders, updateOrderStatus } from '../api/orders';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('consultations');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Summary Metrics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalConsultations: 0,
    pendingConsultations: 0,
    inProgressConsultations: 0,
    completedConsultations: 0,
    totalProjects: 0,
    totalUsers: 0
  });

  // Data Collections
  const [consultations, setConsultations] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // Filter & Search states
  const [consultationSearch, setConsultationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showArrangeMeetingModal, setShowArrangeMeetingModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // Meeting Arrangement Form State
  const [meetingForm, setMeetingForm] = useState({
    consultationId: '',
    clientName: '',
    clientEmail: '',
    requestedDate: '',
    requestedTimeSlot: '',
    meetingDate: '',
    meetingTimeSlot: 'Morning (10:00 AM - 1:00 PM)',
    meetingMode: 'Design Studio Walk-in',
    meetingLocation: 'Studio 402, Design Avenue, Metro District',
    meetingLink: 'https://meet.google.com/int-stud-des',
    adminMessage: '',
    isRescheduledByAdmin: false
  });

  // New Store Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Lighting & Lamps',
    price: '',
    originalPrice: '',
    dimensions: '',
    material: '',
    color: '',
    leadTime: '3-5 Business Days',
    images: '',
    description: ''
  });

  // New Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    category: 'Living Room',
    style: 'Modern',
    budgetRange: '₹4L - ₹6L',
    areaSize: '1200 sq.ft.',
    duration: '4-6 Weeks',
    designerName: 'Priya Sharma (Lead Architect)',
    images: '',
    description: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, consRes, portRes, payRes, usersRes, itemsRes, ordersRes] = await Promise.all([
        getAdminStats(),
        getConsultations(),
        getPortfolioItems(),
        getAllPaymentsAdmin(),
        getAllUsers(),
        getItems(),
        getOrders()
      ]);

      setStats(statsRes.data);
      setConsultations(consRes.data || []);
      setPortfolioList(portRes.data || []);
      setPaymentsList(payRes.data?.payments || []);
      setUsersList(usersRes.data || []);
      setItemsList(itemsRes.data || []);
      setOrdersList(ordersRes.data?.orders || []);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Update Item Order Delivery Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus: newStatus });
      setOrdersList((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
      );
      alert(`Order delivery status updated to "${newStatus}".`);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status.');
    }
  };

  // Status Updater
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateConsultationStatus(id, { status: newStatus });
      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
      );
      // Refresh stats
      const statsRes = await getAdminStats();
      setStats(statsRes.data);
    } catch (err) {
      alert('Failed to update consultation status.');
    }
  };

  // Open Meeting Arrangement Modal
  const handleOpenArrangeMeeting = (c) => {
    const defaultDate = c.preferredDate
      ? new Date(c.preferredDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const slot = c.preferredTimeSlot || 'Morning (10:00 AM - 1:00 PM)';
    const clientReqDate = c.preferredDate
      ? new Date(c.preferredDate).toLocaleDateString()
      : 'Flexible Date';

    setMeetingForm({
      consultationId: c._id,
      clientName: c.clientName,
      clientEmail: c.clientEmail,
      requestedDate: clientReqDate,
      requestedTimeSlot: slot,
      meetingDate: defaultDate,
      meetingTimeSlot: slot,
      meetingMode: 'Design Studio Walk-in',
      meetingLocation: 'Studio 402, Design Avenue, Metro District',
      meetingLink: 'https://meet.google.com/int-stud-des',
      adminMessage: `Meeting arranged! We will meet on ${clientReqDate} at ${slot} at our Design Studio. Looking forward to reviewing your floor plan!`,
      isRescheduledByAdmin: false
    });
    setShowArrangeMeetingModal(true);
  };

  // 1-Click Accept Requested Schedule
  const handleAcceptRequestedSchedule = () => {
    setMeetingForm((prev) => ({
      ...prev,
      isRescheduledByAdmin: false,
      adminMessage: `Meeting confirmed for your requested slot (${prev.requestedDate} at ${prev.meetingTimeSlot}). We look forward to meeting with you!`
    }));
  };

  // Save Arranged Meeting
  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    try {
      await updateConsultationStatus(meetingForm.consultationId, {
        status: 'Meeting Arranged',
        meetingDate: meetingForm.meetingDate,
        meetingTimeSlot: meetingForm.meetingTimeSlot,
        meetingMode: meetingForm.meetingMode,
        meetingLocation: meetingForm.meetingLocation,
        meetingLink: meetingForm.meetingLink,
        adminMessage: meetingForm.adminMessage,
        isRescheduledByAdmin: meetingForm.isRescheduledByAdmin
      });

      setConsultations((prev) =>
        prev.map((c) =>
          c._id === meetingForm.consultationId
            ? {
                ...c,
                status: 'Meeting Arranged',
                meetingDate: meetingForm.meetingDate,
                meetingTimeSlot: meetingForm.meetingTimeSlot,
                meetingMode: meetingForm.meetingMode,
                meetingLocation: meetingForm.meetingLocation,
                meetingLink: meetingForm.meetingLink,
                adminMessage: meetingForm.adminMessage,
                isRescheduledByAdmin: meetingForm.isRescheduledByAdmin
              }
            : c
        )
      );

      const statsRes = await getAdminStats();
      setStats(statsRes.data);
      setShowArrangeMeetingModal(false);
      alert(`Meeting arranged successfully! ${meetingForm.clientName} can now see the confirmed meeting details and notification message.`);
    } catch (err) {
      console.error('Error arranging meeting:', err);
      alert('Failed to arrange meeting. Please try again.');
    }
  };

  // Create Store Item
  const handleCreateStoreItem = async (e) => {
    e.preventDefault();
    try {
      const imgArray = newItem.images
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);

      const payload = {
        ...newItem,
        price: Number(newItem.price),
        originalPrice: newItem.originalPrice ? Number(newItem.originalPrice) : undefined,
        images:
          imgArray.length > 0
            ? imgArray
            : ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80']
      };

      await createStoreItem(payload);
      setShowAddItemModal(false);
      setNewItem({
        name: '',
        category: 'Lighting & Lamps',
        price: '',
        originalPrice: '',
        dimensions: '',
        material: '',
        color: '',
        leadTime: '3-5 Business Days',
        images: '',
        description: ''
      });

      const res = await getItems();
      setItemsList(res.data || []);
      alert('New decor & furnishing item published to catalog successfully!');
    } catch (err) {
      console.error('Error creating store item:', err);
      alert('Failed to add item to catalog.');
    }
  };

  // Delete Store Item
  const handleDeleteStoreItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this furnishing item?')) return;
    try {
      await deleteStoreItem(id);
      setItemsList((prev) => prev.filter((item) => item._id !== id));
      alert('Item removed from catalog.');
    } catch (err) {
      alert('Failed to delete item.');
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      await updateConsultationStatus(selectedInquiry._id, { adminNotes: adminNotesInput });
      setConsultations((prev) =>
        prev.map((c) =>
          c._id === selectedInquiry._id ? { ...c, adminNotes: adminNotesInput } : c
        )
      );
      setSelectedInquiry(null);
    } catch (err) {
      alert('Failed to save admin notes.');
    }
  };

  // Delete Consultation
  const handleDeleteConsultation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this consultation request?')) return;
    try {
      await deleteConsultation(id);
      setConsultations((prev) => prev.filter((c) => c._id !== id));
      const statsRes = await getAdminStats();
      setStats(statsRes.data);
    } catch (err) {
      alert('Failed to delete consultation.');
    }
  };

  // Create Portfolio Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const imgArray = newProject.images
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean);

      const payload = {
        ...newProject,
        images: imgArray.length > 0 ? imgArray : ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80']
      };

      await createPortfolioItem(payload);
      setShowAddProjectModal(false);
      setNewProject({
        title: '',
        category: 'Living Room',
        style: 'Modern',
        budgetRange: '₹4L - ₹6L',
        areaSize: '1200 sq.ft.',
        duration: '4-6 Weeks',
        designerName: 'Priya Sharma (Lead Architect)',
        images: '',
        description: ''
      });

      const portRes = await getPortfolioItems();
      setPortfolioList(portRes.data || []);
      const statsRes = await getAdminStats();
      setStats(statsRes.data);
      alert('New portfolio project published successfully!');
    } catch (err) {
      alert('Failed to create portfolio project.');
    }
  };

  // Delete Portfolio Project
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio showcase?')) return;
    try {
      await deletePortfolioItem(id);
      setPortfolioList((prev) => prev.filter((p) => p._id !== id));
      const statsRes = await getAdminStats();
      setStats(statsRes.data);
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  // Filter consultations
  const filteredConsultations = consultations.filter((c) => {
    const matchesSearch =
      c.clientName?.toLowerCase().includes(consultationSearch.toLowerCase()) ||
      c.clientEmail?.toLowerCase().includes(consultationSearch.toLowerCase()) ||
      c.roomType?.toLowerCase().includes(consultationSearch.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="admin-title-group">
            <span className="admin-badge">Admin Studio Control Center</span>
            <h1>Studio Management Dashboard</h1>
            <p>
              Welcome, <strong>{user?.name}</strong>. Oversee client inquiries, manage portfolio designs, and track financial milestone revenue.
            </p>
          </div>

          <button className="btn-refresh" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing Data...' : '↻ Refresh Dashboard'}
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon revenue">💰</div>
            <div className="kpi-content">
              <h3>₹{stats.totalRevenue?.toLocaleString()}</h3>
              <p>Total Milestone Revenue</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon inquiries">📅</div>
            <div className="kpi-content">
              <h3>{stats.totalConsultations}</h3>
              <p>{stats.pendingConsultations} Pending / {stats.inProgressConsultations} Active</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon projects">🏗️</div>
            <div className="kpi-content">
              <h3>{stats.totalProjects}</h3>
              <p>Live Portfolio Showcases</p>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon users">👥</div>
            <div className="kpi-content">
              <h3>{stats.totalUsers}</h3>
              <p>Registered User Accounts</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'consultations' ? 'active' : ''}`}
            onClick={() => setActiveTab('consultations')}
          >
            📋 Consultation Inquiries
            <span className="tab-counter">{consultations.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            🎨 Portfolio Project Manager
            <span className="tab-counter">{portfolioList.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            📦 Furnishings & Decor Catalog
            <span className="tab-counter">{itemsList.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            💳 Financial Ledger & Milestones
            <span className="tab-counter">{paymentsList.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🛍️ Item Purchase Orders
            <span className="tab-counter">{ordersList.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👤 Client & User Directory
            <span className="tab-counter">{usersList.length}</span>
          </button>
        </div>

        {/* TAB 1: CONSULTATIONS MANAGER */}
        {activeTab === 'consultations' && (
          <div className="admin-card-section">
            <div className="section-controls-row">
              <div className="search-filter-box">
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search client by name, email, or room scope..."
                  value={consultationSearch}
                  onChange={(e) => setConsultationSearch(e.target.value)}
                />

                <select
                  className="admin-select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Meeting Arranged">Meeting Arranged</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <span style={{ fontSize: '13px', color: '#777' }}>
                Showing {filteredConsultations.length} of {consultations.length} inquiries
              </span>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>Loading consultation requests...</p>
            ) : filteredConsultations.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>No consultations found matching your filter.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Contact Info</th>
                      <th>Space & Scope</th>
                      <th>Aesthetics</th>
                      <th>Budget Bracket</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredConsultations.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.clientName}</strong>
                          {c.referenceProjectTitle && (
                            <div style={{ fontSize: '11px', color: '#c59d5f', marginTop: '2px' }}>
                              ✨ {c.referenceProjectTitle}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{c.clientEmail}</div>
                          <div style={{ fontSize: '11px', color: '#777' }}>{c.clientPhone}</div>
                        </td>
                        <td>
                          <strong>{c.roomType}</strong>
                          <div style={{ fontSize: '11px', color: '#777' }}>{c.propertyType}</div>
                        </td>
                        <td>{c.preferredStyle}</td>
                        <td><strong>{c.budgetRange}</strong></td>
                        <td>
                          {c.preferredDate ? new Date(c.preferredDate).toLocaleDateString() : 'TBD'}
                          <div style={{ fontSize: '11px', color: '#777' }}>{c.preferredTimeSlot}</div>
                        </td>
                        <td>
                          <select
                            className="table-status-select"
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Meeting Arranged">Meeting Arranged</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn-action-small schedule"
                            title="Arrange / Confirm Meeting with Client"
                            onClick={() => handleOpenArrangeMeeting(c)}
                            style={{ marginRight: '6px' }}
                          >
                            Meeting 📅
                          </button>
                          <button
                            className="btn-action-small view"
                            onClick={() => {
                              setSelectedInquiry(c);
                              setAdminNotesInput(c.adminNotes || '');
                            }}
                          >
                            Notes 📝
                          </button>
                          <button
                            className="btn-action-small delete"
                            onClick={() => handleDeleteConsultation(c._id)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PORTFOLIO MANAGER */}
        {activeTab === 'portfolio' && (
          <div className="admin-card-section">
            <div className="section-controls-row">
              <h2>Published Portfolio Concept Designs</h2>
              <button
                className="btn-add-primary"
                onClick={() => setShowAddProjectModal(true)}
              >
                ➕ Add New Design Project
              </button>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>Loading design showcases...</p>
            ) : (
              <div className="admin-projects-grid">
                {portfolioList.map((p) => {
                  const imgUrl =
                    p.images && p.images[0]
                      ? p.images[0].replace(/^:\s*/, '').trim()
                      : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80';

                  return (
                    <div key={p._id} className="admin-project-card">
                      <img
                        src={imgUrl}
                        alt={p.title}
                        className="admin-project-thumb"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="admin-project-body">
                        <div className="admin-project-tags">
                          <span className="admin-tag">{p.category}</span>
                          <span className="admin-tag">{p.style}</span>
                        </div>
                        <h4>{p.title}</h4>
                        <div className="admin-project-meta">
                          <div>Budget: <strong>{p.budgetRange || 'Bespoke Quote'}</strong></div>
                          <div>Designer: {p.designerName || 'Lead Architect'}</div>
                        </div>

                        <div className="admin-project-actions">
                          <button
                            className="btn-action-small delete"
                            style={{ width: '100%' }}
                            onClick={() => handleDeleteProject(p._id)}
                          >
                            🗑️ Delete Project
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ITEMS & FURNISHINGS CATALOG */}
        {activeTab === 'items' && (
          <div className="admin-card-section">
            <div className="section-controls-row">
              <div>
                <h2>Physical Furnishings, Lighting & Wallpaper Catalog</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
                  Manage physical products (lamps, chairs, wallpapers, tables, rugs) available for client order and project supply.
                </p>
              </div>
              <button
                className="btn-add-primary"
                onClick={() => setShowAddItemModal(true)}
              >
                ➕ Add New Furnishing Item
              </button>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>Loading furnishings catalog...</p>
            ) : itemsList.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>No items in catalog yet. Click "Add New Furnishing Item" to publish products.</p>
            ) : (
              <div className="admin-projects-grid">
                {itemsList.map((item) => {
                  const imgUrl =
                    item.images && item.images[0]
                      ? item.images[0].replace(/^:\s*/, '').trim()
                      : 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80';

                  return (
                    <div key={item._id} className="admin-project-card">
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="admin-project-thumb"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="admin-project-body">
                        <div className="admin-project-tags">
                          <span className="admin-tag">{item.category}</span>
                          <span className="admin-tag" style={{ color: '#27ae60' }}>In Stock</span>
                        </div>
                        <h4>{item.name}</h4>
                        <div className="admin-project-meta">
                          <div>Price: <strong style={{ color: '#141414', fontSize: '15px' }}>₹{item.price?.toLocaleString()}</strong></div>
                          {item.dimensions && <div>Dims: {item.dimensions}</div>}
                          {item.material && <div>Material: {item.material}</div>}
                        </div>

                        <div className="admin-project-actions">
                          <button
                            className="btn-action-small delete"
                            style={{ width: '100%' }}
                            onClick={() => handleDeleteStoreItem(item._id)}
                          >
                            🗑️ Delete Item
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FINANCIAL LEDGER & PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="admin-card-section">
            <div className="section-controls-row">
              <div>
                <h2>Master Milestone Payment Ledger</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
                  Audited record of all 50% milestone advances, token fees, and handover payments.
                </p>
              </div>
              <button className="btn-add-primary" onClick={() => window.print()}>
                🖨️ Export Audit Report
              </button>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>Loading financial ledger...</p>
            ) : paymentsList.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>No payment records found.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Receipt No.</th>
                      <th>Transaction ID</th>
                      <th>Client Name</th>
                      <th>Client Email</th>
                      <th>Milestone Description</th>
                      <th>Method</th>
                      <th>Amount Paid</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.map((p) => (
                      <tr key={p._id}>
                        <td><strong>{p.receiptNumber}</strong></td>
                        <td style={{ fontSize: '11px', color: '#666' }}>{p.transactionId}</td>
                        <td><strong>{p.clientName}</strong></td>
                        <td>{p.clientEmail}</td>
                        <td>{p.milestoneTitle}</td>
                        <td>{p.paymentMethod}</td>
                        <td><strong style={{ color: '#27ae60' }}>₹{p.amountPaid?.toLocaleString()}</strong></td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className="status-pill completed">{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="admin-card-section">
            <div className="section-controls-row">
              <div>
                <h2>Registered Users & Clients</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
                  Total accounts registered in the Interior Studio portal.
                </p>
              </div>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>Loading user directory...</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Phone Number</th>
                      <th>Role</th>
                      <th>Member Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>
                          <span
                            style={{
                              background: u.role === 'admin' ? '#c59d5f' : '#f0ede8',
                              color: u.role === 'admin' ? '#1a1a1a' : '#555',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'uppercase'
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ITEM PURCHASE ORDERS & FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="admin-card-section">
            <div className="section-controls-row">
              <div>
                <h2>Physical Furnishing Purchase Orders & Tax Invoices</h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#777' }}>
                  Manage standalone product deliveries, tax invoices, and courier fulfillment statuses.
                </p>
              </div>
              <button className="btn-add-primary" onClick={() => window.print()}>
                🖨️ Export Orders Ledger
              </button>
            </div>

            {loading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>Loading client item orders...</p>
            ) : ordersList.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>No item purchase orders recorded yet.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Tax Invoice No.</th>
                      <th>Order Ref</th>
                      <th>Client Name</th>
                      <th>Contact Info</th>
                      <th>Items Ordered</th>
                      <th>Delivery Destination</th>
                      <th>Amount Paid</th>
                      <th>Payment Method</th>
                      <th>Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((ord) => {
                      const firstItem = ord.items && ord.items[0];
                      const totalQty = ord.items ? ord.items.reduce((s, it) => s + it.quantity, 0) : 1;

                      return (
                        <tr key={ord._id}>
                          <td><strong>{ord.receiptNumber}</strong></td>
                          <td style={{ fontSize: '11px', color: '#666' }}>{ord.orderNumber}</td>
                          <td><strong>{ord.clientName}</strong></td>
                          <td>
                            <div>{ord.clientEmail}</div>
                            <div style={{ fontSize: '11px', color: '#777' }}>{ord.clientPhone}</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {firstItem?.image && (
                                <img
                                  src={firstItem.image}
                                  alt={firstItem.name}
                                  style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80';
                                  }}
                                />
                              )}
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '13px' }}>
                                  {firstItem?.name} {ord.items?.length > 1 ? `(+${ord.items.length - 1} more)` : ''}
                                </div>
                                <div style={{ fontSize: '11px', color: '#777' }}>Qty: {totalQty} unit{totalQty > 1 ? 's' : ''}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{ord.shippingAddress?.street}</div>
                            <div style={{ fontSize: '11px', color: '#777' }}>
                              {ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#27ae60', fontSize: '14px' }}>
                              ₹{ord.totalAmount?.toLocaleString()}
                            </strong>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', background: '#f5f2ec', padding: '2px 6px', borderRadius: '4px' }}>
                              {ord.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <select
                              className="table-status-select"
                              value={ord.orderStatus || 'Processing'}
                              onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD NEW PORTFOLIO PROJECT */}
        {showAddProjectModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <button
                className="modal-close-btn"
                onClick={() => setShowAddProjectModal(false)}
              >
                ✕
              </button>
              <h3>Publish New Design Project</h3>
              <p>Add a new architectural or interior transformation to the public portfolio showcase.</p>

              <form onSubmit={handleCreateProject}>
                <div className="modal-field-group">
                  <label>Project Title *</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Contemporary Luxury Villa Living"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Space / Category</label>
                    <select
                      className="modal-select"
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    >
                      <option value="Living Room">Living Room</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Full Home">Full Home</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Bathroom">Bathroom</option>
                    </select>
                  </div>

                  <div className="modal-field-group">
                    <label>Aesthetic Style</label>
                    <select
                      className="modal-select"
                      value={newProject.style}
                      onChange={(e) => setNewProject({ ...newProject, style: e.target.value })}
                    >
                      <option value="Modern">Modern</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Scandinavian">Scandinavian</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Traditional">Traditional</option>
                      <option value="Luxury / Contemporary">Luxury / Contemporary</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Estimated Budget Bracket</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. ₹5L - ₹8L"
                      value={newProject.budgetRange}
                      onChange={(e) => setNewProject({ ...newProject, budgetRange: e.target.value })}
                    />
                  </div>

                  <div className="modal-field-group">
                    <label>Carpet Area</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. 1400 sq.ft."
                      value={newProject.areaSize}
                      onChange={(e) => setNewProject({ ...newProject, areaSize: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Lead Architect</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={newProject.designerName}
                      onChange={(e) => setNewProject({ ...newProject, designerName: e.target.value })}
                    />
                  </div>

                  <div className="modal-field-group">
                    <label>Execution Duration</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={newProject.duration}
                      onChange={(e) => setNewProject({ ...newProject, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <label>Image URLs (comma-separated Unsplash / Web links)</label>
                  <textarea
                    className="modal-textarea"
                    placeholder="https://images.unsplash.com/..., https://images.unsplash.com/..."
                    value={newProject.images}
                    onChange={(e) => setNewProject({ ...newProject, images: e.target.value })}
                  ></textarea>
                </div>

                <div className="modal-field-group">
                  <label>Design Narrative & Description</label>
                  <textarea
                    className="modal-textarea"
                    placeholder="Describe materials, lighting fixtures, acoustic treatments, and spatial flow..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-modal-submit">
                  Publish to Portfolio →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INQUIRY DETAILS & ADMIN NOTES */}
        {selectedInquiry && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <button
                className="modal-close-btn"
                onClick={() => setSelectedInquiry(null)}
              >
                ✕
              </button>
              <h3>Consultation Details & Internal Remarks</h3>
              <p>Review full client requirements and record internal studio coordination notes.</p>

              <div style={{ background: '#faf9f6', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                <div><strong>Client:</strong> {selectedInquiry.clientName} ({selectedInquiry.clientEmail})</div>
                <div><strong>Phone:</strong> {selectedInquiry.clientPhone}</div>
                <div><strong>Scope:</strong> {selectedInquiry.roomType} ({selectedInquiry.propertyType})</div>
                <div><strong>Style & Budget:</strong> {selectedInquiry.preferredStyle} • {selectedInquiry.budgetRange}</div>
                {selectedInquiry.notes && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eae6e0' }}>
                    <strong>Client Vision / Floor Plan:</strong> {selectedInquiry.notes}
                  </div>
                )}
              </div>

              <div className="modal-field-group">
                <label>Internal Studio Remarks / Assigned Architect Notes</label>
                <textarea
                  className="modal-textarea"
                  placeholder="Record site visit outcome, architect allocation, or revised budget quotes..."
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                ></textarea>
              </div>

              <button className="btn-modal-submit" onClick={handleSaveNotes}>
                Save Admin Notes
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ARRANGE / CONFIRM CLIENT MEETING */}
        {showArrangeMeetingModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card" style={{ maxWidth: '640px' }}>
              <button
                className="modal-close-btn"
                onClick={() => setShowArrangeMeetingModal(false)}
              >
                ✕
              </button>
              <h3>Arrange & Confirm Client Meeting</h3>
              <p>Set a confirmed schedule and send meeting notice to <strong>{meetingForm.clientName}</strong> ({meetingForm.clientEmail}).</p>

              {/* Quick 1-Click Accept Requested Time */}
              <div className="quick-accept-banner">
                <div>
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Client's Requested Slot:</span>
                  <div style={{ fontWeight: '700', color: '#141414', fontSize: '14px' }}>
                    📅 {meetingForm.requestedDate} • {meetingForm.requestedTimeSlot}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-quick-accept"
                  onClick={handleAcceptRequestedSchedule}
                >
                  ✓ Accept Requested Schedule
                </button>
              </div>

              <form onSubmit={handleSaveMeeting}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Confirmed Meeting Date *</label>
                    <input
                      type="date"
                      className="modal-input"
                      value={meetingForm.meetingDate}
                      onChange={(e) => {
                        setMeetingForm({
                          ...meetingForm,
                          meetingDate: e.target.value,
                          isRescheduledByAdmin: true,
                          adminMessage: `Your requested time had a prior site commitment. We have arranged our design meeting on ${new Date(e.target.value).toLocaleDateString()} at ${meetingForm.meetingTimeSlot}. Please let us know if this works for you.`
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="modal-field-group">
                    <label>Confirmed Time Slot *</label>
                    <select
                      className="modal-select"
                      value={meetingForm.meetingTimeSlot}
                      onChange={(e) => {
                        setMeetingForm({
                          ...meetingForm,
                          meetingTimeSlot: e.target.value,
                          isRescheduledByAdmin: true,
                          adminMessage: `Meeting arranged for ${meetingForm.requestedDate} at ${e.target.value}. Looking forward to discussing your floor plans.`
                        });
                      }}
                    >
                      <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                      <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                      <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                      <option value="11:00 AM - 12:30 PM (Priority Slot)">11:00 AM - 12:30 PM (Priority Slot)</option>
                      <option value="3:00 PM - 4:30 PM (Priority Slot)">3:00 PM - 4:30 PM (Priority Slot)</option>
                      <option value="6:00 PM - 7:30 PM (Evening Special)">6:00 PM - 7:30 PM (Evening Special)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Consultation Mode</label>
                    <select
                      className="modal-select"
                      value={meetingForm.meetingMode}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetingMode: e.target.value })}
                    >
                      <option value="Design Studio Walk-in">Design Studio Walk-in</option>
                      <option value="In-Person Site Visit">In-Person Site Visit</option>
                      <option value="Online 3D Virtual Session">Online 3D Virtual Session</option>
                    </select>
                  </div>

                  <div className="modal-field-group">
                    <label>Studio Location / Site Address</label>
                    <input
                      type="text"
                      className="modal-input"
                      value={meetingForm.meetingLocation}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetingLocation: e.target.value })}
                      placeholder="Studio 402, Design Avenue, Metro District"
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <label>Video Call Link (Google Meet / Zoom)</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={meetingForm.meetingLink}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="rescheduled-toggle-row">
                  <input
                    type="checkbox"
                    id="isRescheduled"
                    checked={meetingForm.isRescheduledByAdmin}
                    onChange={(e) => setMeetingForm({ ...meetingForm, isRescheduledByAdmin: e.target.checked })}
                  />
                  <label htmlFor="isRescheduled" style={{ cursor: 'pointer', margin: 0, textTransform: 'none', fontWeight: '500' }}>
                    Flag as adjusted time slot (Highlights to client that the studio revised timing)
                  </label>
                </div>

                <div className="modal-field-group">
                  <label>Client Notification Message *</label>
                  <textarea
                    className="modal-textarea"
                    value={meetingForm.adminMessage}
                    onChange={(e) => setMeetingForm({ ...meetingForm, adminMessage: e.target.value })}
                    placeholder="e.g. Meeting arranged! We will meet on Tuesday at 11:00 AM at our design studio..."
                    required
                    style={{ minHeight: '85px' }}
                  ></textarea>
                </div>

                <button type="submit" className="btn-modal-submit" style={{ background: '#15803d' }}>
                  🚀 Save & Arrange Meeting
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW FURNISHING ITEM */}
        {showAddItemModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card" style={{ maxWidth: '640px' }}>
              <button
                className="modal-close-btn"
                onClick={() => setShowAddItemModal(false)}
              >
                ✕
              </button>
              <h3>Publish Physical Furnishing & Decor Item</h3>
              <p>Add a lamp, chair, wallpaper roll, table, rug, or decor piece to the public catalog.</p>

              <form onSubmit={handleCreateStoreItem}>
                <div className="modal-field-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Nordic Bouclé Ergonomic Accent Lounge Chair"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Category *</label>
                    <select
                      className="modal-select"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    >
                      <option value="Lighting & Lamps">Lighting & Lamps</option>
                      <option value="Seating & Chairs">Seating & Chairs</option>
                      <option value="Wallpapers & Wall Decor">Wallpapers & Wall Decor</option>
                      <option value="Tables & Consoles">Tables & Consoles</option>
                      <option value="Rugs & Textiles">Rugs & Textiles</option>
                      <option value="Decor & Accents">Decor & Accents</option>
                    </select>
                  </div>

                  <div className="modal-field-group">
                    <label>Price (INR) *</label>
                    <input
                      type="number"
                      className="modal-input"
                      placeholder="e.g. 14999"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Original / MRP Price (Optional)</label>
                    <input
                      type="number"
                      className="modal-input"
                      placeholder="e.g. 19999"
                      value={newItem.originalPrice}
                      onChange={(e) => setNewItem({ ...newItem, originalPrice: e.target.value })}
                    />
                  </div>

                  <div className="modal-field-group">
                    <label>Handover / Dispatch Lead Time</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. 3-5 Business Days"
                      value={newItem.leadTime}
                      onChange={(e) => setNewItem({ ...newItem, leadTime: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="modal-field-group">
                    <label>Dimensions / Sizing</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder={'e.g. 32" W x 34" D x 31" H'}
                      value={newItem.dimensions}
                      onChange={(e) => setNewItem({ ...newItem, dimensions: e.target.value })}
                    />
                  </div>

                  <div className="modal-field-group">
                    <label>Material & Craftsmanship</label>
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="e.g. Solid Oak & Textured Wool Bouclé"
                      value={newItem.material}
                      onChange={(e) => setNewItem({ ...newItem, material: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-field-group">
                  <label>Image URLs (comma-separated Unsplash / Web links)</label>
                  <textarea
                    className="modal-textarea"
                    placeholder="https://images.unsplash.com/photo-1580481077195-c3a824552965?auto=format&fit=crop&w=800&q=80"
                    value={newItem.images}
                    onChange={(e) => setNewItem({ ...newItem, images: e.target.value })}
                  ></textarea>
                </div>

                <div className="modal-field-group">
                  <label>Product Description & Architectural Applications *</label>
                  <textarea
                    className="modal-textarea"
                    placeholder="Describe material tactile feel, acoustic properties, and styling ideas..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-modal-submit">
                  Publish to Items Catalog →
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
