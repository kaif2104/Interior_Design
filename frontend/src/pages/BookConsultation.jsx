import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createConsultation, getConsultations } from '../api/consultation';
import { getPortfolioItems } from '../api/portfolio';
import './BookConsultation.css';

const defaultInspirations = [
  {
    _id: 'sample-1',
    title: 'Modern Living Room Makeover',
    category: 'Living Room',
    style: 'Modern',
    budgetRange: '₹3.5L - ₹5L',
    designerName: 'Priya Sharma (Lead Architect)',
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'sample-2',
    title: 'Minimalist Master Suite',
    category: 'Bedroom',
    style: 'Minimalist',
    budgetRange: '₹2.8L - ₹4.5L',
    designerName: 'Rahul Mehta',
    images: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'sample-3',
    title: 'Gourmet Modular Kitchen & Island',
    category: 'Kitchen',
    style: 'Modern',
    budgetRange: '₹4.5L - ₹7.5L',
    designerName: 'Ananya Deshmukh',
    images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80']
  },
  {
    _id: 'sample-4',
    title: 'Scandinavian Luxury Penthouse Living',
    category: 'Living Room',
    style: 'Scandinavian',
    budgetRange: '₹8L - ₹14L',
    designerName: 'Priya Sharma (Lead Architect)',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80']
  }
];

function BookConsultation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const queryProjectId = searchParams.get('project');
  const queryTitle = searchParams.get('title');
  const queryCategory = searchParams.get('category');
  const queryStyle = searchParams.get('style');
  const queryImage = searchParams.get('image');
  const queryBudget = searchParams.get('budget');
  const queryDesigner = searchParams.get('designer');
  const queryArea = searchParams.get('area');

  const [activeTab, setActiveTab] = useState('schedule');
  const [userAppointments, setUserAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const [portfolioList, setPortfolioList] = useState([]);
  const [selectedInspiration, setSelectedInspiration] = useState({
    id: queryProjectId || 'sample-1',
    title: queryTitle || 'Modern Living Room Makeover',
    category: queryCategory || 'Living Room',
    style: queryStyle || 'Modern',
    image: queryImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    budget: queryBudget || '₹3.5L - ₹5L',
    designer: queryDesigner || 'Priya Sharma (Lead Architect)'
  });

  const [consultationMode, setConsultationMode] = useState('In-Person Site Visit');
  const [preferredArchitect, setPreferredArchitect] = useState(queryDesigner || 'Priya Sharma (Lead Architect)');

  const [formData, setFormData] = useState({
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientPhone: user?.phone || '',
    propertyType: '2 BHK',
    roomType: queryCategory || 'Living Room',
    preferredStyle: queryStyle || 'Modern',
    budgetRange: queryBudget || '₹3L - ₹6L',
    areaSize: queryArea || '',
    preferredDate: '',
    preferredTimeSlot: 'Morning (10:00 AM - 1:00 PM)',
    floorPlanUrl: '',
    notes: queryTitle ? `Inspired by "${queryTitle}". ` : ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedBooking, setSubmittedBooking] = useState(null);

  const fetchUserAppointments = async () => {
    if (!user?.email) return;
    setLoadingAppointments(true);
    try {
      const res = await getConsultations({ clientEmail: user.email });
      setUserAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserAppointments();
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const loadProjects = async () => {
      try {
        const res = await getPortfolioItems();
        if (res.data && res.data.length > 0) {
          setPortfolioList(res.data);
          // If query params were not provided, pick first project as active
          if (!queryTitle && res.data[0]) {
            const first = res.data[0];
            setSelectedInspiration({
              id: first._id,
              title: first.title,
              category: first.category,
              style: first.style,
              image: first.images && first.images[0] ? first.images[0].replace(/^:\s*/, '').trim() : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
              budget: first.budgetRange || '₹3.5L - ₹5L',
              designer: first.designerName || 'Priya Sharma (Lead Architect)'
            });
            setFormData((prev) => ({
              ...prev,
              roomType: first.category,
              preferredStyle: first.style,
              budgetRange: first.budgetRange || '₹3L - ₹6L'
            }));
          }
        } else {
          setPortfolioList(defaultInspirations);
        }
      } catch (err) {
        setPortfolioList(defaultInspirations);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        clientName: prev.clientName || user.name || '',
        clientEmail: prev.clientEmail || user.email || '',
        clientPhone: prev.clientPhone || user.phone || ''
      }));
    }
  }, [user]);

  const handleSelectInspiration = (item) => {
    const cleanImg =
      item.images && item.images[0]
        ? item.images[0].replace(/^:\s*/, '').trim()
        : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80';

    setSelectedInspiration({
      id: item._id,
      title: item.title,
      category: item.category,
      style: item.style,
      image: cleanImg,
      budget: item.budgetRange || '₹3.5L - ₹5L',
      designer: item.designerName || 'Priya Sharma (Lead Architect)'
    });

    setPreferredArchitect(item.designerName || 'Priya Sharma (Lead Architect)');

    setFormData((prev) => ({
      ...prev,
      roomType: item.category,
      preferredStyle: item.style,
      budgetRange: item.budgetRange || prev.budgetRange,
      notes: `Inspired by portfolio project "${item.title}". `
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullNotes = [
        formData.notes,
        `Consultation Mode: ${consultationMode}`,
        `Preferred Architect: ${preferredArchitect}`,
        formData.floorPlanUrl ? `Floor Plan / Moodboard: ${formData.floorPlanUrl}` : ''
      ].filter(Boolean).join(' | ');

      const payload = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        propertyType: formData.propertyType,
        roomType: formData.roomType,
        preferredStyle: formData.preferredStyle,
        budgetRange: formData.budgetRange,
        areaSize: formData.areaSize,
        preferredDate: formData.preferredDate || undefined,
        preferredTimeSlot: formData.preferredTimeSlot,
        notes: fullNotes,
        referenceProject: selectedInspiration.id?.length === 24 ? selectedInspiration.id : undefined,
        referenceProjectTitle: selectedInspiration.title || undefined,
        userId: user?.id || user?._id || undefined
      };

      const res = await createConsultation(payload);
      setSubmittedBooking({
        ...res.data.consultation,
        consultationMode,
        preferredArchitect,
        inspirationImage: selectedInspiration.image
      });
      fetchUserAppointments();
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to submit consultation request. Please verify your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="consultation-page">
      <div className="consultation-container">
        {/* Header */}
        <div className="consultation-header">
          <span className="consultation-badge">Bespoke Architectural Planning</span>
          <h1>Design Consultation & Project Booking</h1>
          <p className="consultation-subtitle">
            Connect with our senior interior architects. We'll examine your floor plan, refine 3D layouts, curate material palettes, and formulate your project quotation.
          </p>
        </div>

        {/* TOP TAB SWITCHER */}
        <div className="consultation-nav-tabs">
          <button
            className={`consultation-tab-pill ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => { setActiveTab('schedule'); setSubmittedBooking(null); }}
          >
            📅 Schedule New Consultation
          </button>
          <button
            className={`consultation-tab-pill ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tracker'); setSubmittedBooking(null); }}
          >
            📋 My Appointments & Meeting Tracker
            {userAppointments.length > 0 && (
              <span className="tab-badge-num">{userAppointments.length}</span>
            )}
          </button>
        </div>

        {/* TAB 2: MY APPOINTMENTS & MEETING TRACKER */}
        {activeTab === 'tracker' && (
          <div className="appointments-tracker-container">
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h2>Your Scheduled Consultations & Meeting Status</h2>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Track whether your appointment is pending studio confirmation or arranged with confirmed architect timing and video/studio links.
              </p>
            </div>

            {loadingAppointments ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
                <p>Loading your appointments...</p>
              </div>
            ) : !user ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #eae6e0' }}>
                <h3>Please Sign In to View Your Private Appointments</h3>
                <p style={{ color: '#777', margin: '8px 0 20px' }}>Your appointments and meeting schedules are tied to your registered account.</p>
                <Link to="/login" className="btn-proceed-billing" style={{ display: 'inline-block' }}>
                  Sign In Now →
                </Link>
              </div>
            ) : userAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #eae6e0' }}>
                <h3>No Appointments Booked Yet</h3>
                <p style={{ color: '#777', margin: '8px 0 20px' }}>You haven't requested any design consultations under {user.email} yet.</p>
                <button
                  className="btn-proceed-billing"
                  onClick={() => setActiveTab('schedule')}
                >
                  📅 Book a Free Design Consultation Now →
                </button>
              </div>
            ) : (
              <div>
                {userAppointments.map((apt) => {
                  const isArranged = apt.status === 'Meeting Arranged' || apt.status === 'Confirmed' || apt.status === 'Site Visit Scheduled';
                  const isPending = apt.status === 'Pending' || apt.status === 'Contacted';

                  return (
                    <div key={apt._id} className="appointment-tracker-card">
                      <div className="tracker-card-header">
                        <div>
                          <h3 className="tracker-title">
                            {apt.roomType} ({apt.propertyType})
                          </h3>
                          <span className="tracker-ref-code">
                            Booking Ref: #{apt._id?.slice(-6).toUpperCase()} • Booked on {new Date(apt.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          {isPending && (
                            <span className="status-badge-pending">
                              ⏳ Pending Studio Confirmation
                            </span>
                          )}
                          {isArranged && (
                            <span className="status-badge-arranged">
                              ✅ Meeting Arranged & Confirmed
                            </span>
                          )}
                          {apt.status === 'Completed' && (
                            <span className="status-badge-arranged">
                              🎉 Consultation Completed
                            </span>
                          )}
                          {apt.status === 'Cancelled' && (
                            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                              ✕ Cancelled
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="tracker-meta-grid">
                        <div>
                          <span className="tracker-meta-label">Aesthetic Style</span>
                          <span className="tracker-meta-val">{apt.preferredStyle}</span>
                        </div>
                        <div>
                          <span className="tracker-meta-label">Budget Estimate</span>
                          <span className="tracker-meta-val">{apt.budgetRange}</span>
                        </div>
                        <div>
                          <span className="tracker-meta-label">Your Requested Date</span>
                          <span className="tracker-meta-val">
                            {apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : 'Flexible'} ({apt.preferredTimeSlot})
                          </span>
                        </div>
                        <div>
                          <span className="tracker-meta-label">Assigned Designer</span>
                          <span className="tracker-meta-val" style={{ color: '#c59d5f' }}>
                            {apt.preferredArchitect || 'Senior Interior Architect'}
                          </span>
                        </div>
                      </div>

                      {/* PENDING NOTICE */}
                      {isPending && (
                        <div className="pending-review-box">
                          <strong>⏳ Under Active Studio Review:</strong> Your requested slot is being coordinated with our lead architects. We will confirm or arrange the meeting timing shortly.
                        </div>
                      )}

                      {/* MEETING ARRANGED NOTIFICATION BOX */}
                      {isArranged && (
                        <div className="meeting-arranged-box">
                          <div className="meeting-arranged-header">
                            <span>✅ Confirmed Meeting Arrangement</span>
                          </div>

                          {apt.isRescheduledByAdmin && (
                            <div className="rescheduled-banner-tag">
                              ⚠️ Note: Meeting schedule adjusted to fit architect availability
                            </div>
                          )}

                          <div className="meeting-details-row">
                            <div className="meeting-detail-item">
                              <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>Meeting Date:</span>
                              <strong>
                                {apt.meetingDate ? new Date(apt.meetingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) : (apt.preferredDate ? new Date(apt.preferredDate).toLocaleDateString() : 'Confirmed Schedule')}
                              </strong>
                            </div>

                            <div className="meeting-detail-item">
                              <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>Time Slot:</span>
                              <strong>{apt.meetingTimeSlot || apt.preferredTimeSlot}</strong>
                            </div>

                            <div className="meeting-detail-item">
                              <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>Consultation Mode:</span>
                              <strong>{apt.meetingMode || 'In-Person Site Visit'}</strong>
                            </div>

                            {apt.meetingLocation && (
                              <div className="meeting-detail-item">
                                <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>Studio Location:</span>
                                <strong>{apt.meetingLocation}</strong>
                              </div>
                            )}

                            {apt.meetingLink && (
                              <div className="meeting-detail-item">
                                <span style={{ color: '#666', fontSize: '12px', display: 'block' }}>Video Call Link:</span>
                                <a href={apt.meetingLink.startsWith('http') ? apt.meetingLink : `https://${apt.meetingLink}`} target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', fontWeight: 'bold' }}>
                                  Join Video Meeting ↗
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="admin-studio-message-box">
                            <strong>💬 Message from Studio:</strong>{' '}
                            {apt.adminMessage || `Meeting arranged! We look forward to meeting with you on ${apt.meetingDate ? new Date(apt.meetingDate).toLocaleDateString() : 'the scheduled date'} at ${apt.meetingTimeSlot || apt.preferredTimeSlot}.`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: SCHEDULE CONSULTATION */}
        {activeTab === 'schedule' && (
          <>
            {/* SUCCESS CONFIRMATION STATE */}
            {submittedBooking ? (
              <div className="success-card">
                <div className="success-header-center">
                  <div className="success-icon-wrapper">✓</div>
                  <h2>Consultation Request Submitted!</h2>
                  <div style={{ margin: '10px auto 14px' }}>
                    <span className="status-badge-pending">
                      ⏳ Status: Pending Studio Confirmation
                    </span>
                  </div>
                  <p className="success-message">
                    Thank you, <strong>{submittedBooking.clientName}</strong>! Your consultation request has been received. Our lead architect team will review your requested time slot and confirm or coordinate meeting timing with you.
                  </p>
                </div>

                {/* Booking Summary Slip */}
                <div className="booking-summary-box">
                  <div className="summary-header-badge">
                    <span style={{ color: '#888' }}>Official Booking Reference</span>
                    <strong style={{ color: '#c59d5f' }}>#{submittedBooking._id?.slice(-6).toUpperCase() || 'BK7890'}</strong>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Consultation Mode:</span>
                    <span className="summary-value">{submittedBooking.consultationMode}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Space & Scope:</span>
                    <span className="summary-value">{submittedBooking.roomType} ({submittedBooking.propertyType})</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Aesthetic Style:</span>
                    <span className="summary-value">{submittedBooking.preferredStyle}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Assigned Architect:</span>
                    <span className="summary-value" style={{ color: '#c59d5f' }}>{submittedBooking.preferredArchitect}</span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Requested Date:</span>
                    <span className="summary-value">
                      {submittedBooking.preferredDate
                        ? new Date(submittedBooking.preferredDate).toLocaleDateString()
                        : 'To be confirmed'} ({submittedBooking.preferredTimeSlot})
                    </span>
                  </div>

                  <div className="summary-row">
                    <span className="summary-label">Approval Status:</span>
                    <span className="summary-value" style={{ color: '#d97706' }}>
                      ⏳ Pending Studio Verification
                    </span>
                  </div>
                </div>

                {/* SEAMLESS ACTIONS */}
                <div className="next-step-billing-box">
                  <div className="next-step-text">
                    <h4>Track Live Confirmation & Milestone Billing</h4>
                    <p>
                      Check meeting status updates in your tracker or proceed to view your customized project quotation ledger.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      className="btn-proceed-billing"
                      onClick={() => { setActiveTab('tracker'); setSubmittedBooking(null); }}
                    >
                      📋 View in Meeting Tracker →
                    </button>
                    <Link to="/billing" className="btn-proceed-billing" style={{ background: '#f0ede8', color: '#1a1a1a' }}>
                      💳 Go to Billing
                    </Link>
                  </div>
                </div>

                <div className="success-actions">
                  <button className="btn-secondary" onClick={() => window.print()}>
                    🖨️ Print Consultation Ticket
                  </button>
                  <button className="btn-secondary" onClick={() => setSubmittedBooking(null)}>
                    + Schedule Another Space
                  </button>
                </div>
              </div>
            ) : (
              /* 2-COLUMN SPLIT BOOKING LAYOUT */
          <div className="consultation-split-layout">
            {/* Left: Interactive Multi-Step Form */}
            <form className="consultation-form-card" onSubmit={handleSubmit}>
              {error && <div className="error-banner">{error}</div>}

              {/* Section 1: Consultation Mode */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-number">1</span>
                  Choose Consultation Experience
                </h3>

                <div className="mode-selector-grid">
                  <div
                    className={`mode-card ${consultationMode === 'In-Person Site Visit' ? 'selected' : ''}`}
                    onClick={() => setConsultationMode('In-Person Site Visit')}
                  >
                    <div className="mode-icon">🏠</div>
                    <div className="mode-title">In-Person Site Visit</div>
                    <div className="mode-desc">Architect visits your property with laser measurement meters.</div>
                  </div>

                  <div
                    className={`mode-card ${consultationMode === 'Design Studio Walk-in' ? 'selected' : ''}`}
                    onClick={() => setConsultationMode('Design Studio Walk-in')}
                  >
                    <div className="mode-icon">🏢</div>
                    <div className="mode-title">Studio Walk-in</div>
                    <div className="mode-desc">Visit our experience center to inspect physical mockups.</div>
                  </div>

                  <div
                    className={`mode-card ${consultationMode === 'Online 3D Virtual Session' ? 'selected' : ''}`}
                    onClick={() => setConsultationMode('Online 3D Virtual Session')}
                  >
                    <div className="mode-icon">💻</div>
                    <div className="mode-title">Online 3D Video</div>
                    <div className="mode-desc">Interactive screen-sharing session via Google Meet / Zoom.</div>
                  </div>
                </div>
              </div>

              {/* Section 2: Design Inspiration Picker */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-number">2</span>
                  Select Design Inspiration
                </h3>
                <p style={{ fontSize: '13px', color: '#777', margin: '0 0 12px' }}>
                  Pick a signature aesthetic from our portfolio to base your 3D design concept on:
                </p>

                <div className="inspiration-picker-grid">
                  {portfolioList.slice(0, 6).map((item) => {
                    const isSelected = selectedInspiration.title === item.title;
                    const itemImg =
                      item.images && item.images[0]
                        ? item.images[0].replace(/^:\s*/, '').trim()
                        : 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80';

                    return (
                      <div
                        key={item._id}
                        className={`inspiration-picker-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectInspiration(item)}
                      >
                        <img src={itemImg} alt={item.title} />
                        <div className="picker-card-label">{item.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Contact Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-number">3</span>
                  Contact & Account Details
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="clientName">
                      Full Name <span className="required-star">*</span>
                    </label>
                    <input
                      id="clientName"
                      type="text"
                      name="clientName"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clientEmail">
                      Email Address <span className="required-star">*</span>
                    </label>
                    <input
                      id="clientEmail"
                      type="email"
                      name="clientEmail"
                      className="form-input"
                      placeholder="e.g. john@example.com"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clientPhone">
                      Phone Number <span className="required-star">*</span>
                    </label>
                    <input
                      id="clientPhone"
                      type="tel"
                      name="clientPhone"
                      className="form-input"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="preferredArchitect">Assigned Lead Architect</label>
                    <select
                      id="preferredArchitect"
                      className="form-select"
                      value={preferredArchitect}
                      onChange={(e) => setPreferredArchitect(e.target.value)}
                    >
                      <option value="Priya Sharma (Lead Architect)">Priya Sharma (Living & Luxury Spaces)</option>
                      <option value="Rahul Mehta">Rahul Mehta (Bedrooms & Scandinavian)</option>
                      <option value="Ananya Deshmukh">Ananya Deshmukh (Modular Kitchens)</option>
                      <option value="Vikram Sengupta">Vikram Sengupta (Offices & Industrial)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Space Scope & Style */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-number">4</span>
                  Space Specifications & Style
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="propertyType">Property Type</label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      className="form-select"
                      value={formData.propertyType}
                      onChange={handleChange}
                    >
                      <option value="1 BHK">1 BHK Apartment</option>
                      <option value="2 BHK">2 BHK Apartment</option>
                      <option value="3 BHK">3 BHK Apartment</option>
                      <option value="4+ BHK / Duplex Penthouse">4+ BHK / Duplex Penthouse</option>
                      <option value="Villa / Bungalow">Villa / Bungalow</option>
                      <option value="Studio / 1 RK">Studio / 1 RK</option>
                      <option value="Commercial Office">Commercial Office</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="roomType">
                      Space / Scope <span className="required-star">*</span>
                    </label>
                    <select
                      id="roomType"
                      name="roomType"
                      className="form-select"
                      value={formData.roomType}
                      onChange={handleChange}
                      required
                    >
                      <option value="Full Home Renovation">Full Home Renovation</option>
                      <option value="Living Room">Living Room</option>
                      <option value="Modular Kitchen">Modular Kitchen</option>
                      <option value="Master Bedroom">Master Bedroom</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Home Office">Home Office</option>
                      <option value="Commercial Space">Commercial Space</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="preferredStyle">Preferred Aesthetics</label>
                    <select
                      id="preferredStyle"
                      name="preferredStyle"
                      className="form-select"
                      value={formData.preferredStyle}
                      onChange={handleChange}
                    >
                      <option value="Modern">Modern</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Traditional">Traditional / Classic</option>
                      <option value="Scandinavian">Scandinavian</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Luxury / Contemporary">Luxury / Contemporary</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="areaSize">Approximate Carpet Size</label>
                    <input
                      id="areaSize"
                      type="text"
                      name="areaSize"
                      className="form-input"
                      placeholder="e.g. 1200 sq.ft. or 450 sq.ft."
                      value={formData.areaSize}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Budget & Schedule */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-number">5</span>
                  Budget & Schedule
                </h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="budgetRange">Estimated Budget Bracket</label>
                    <select
                      id="budgetRange"
                      name="budgetRange"
                      className="form-select"
                      value={formData.budgetRange}
                      onChange={handleChange}
                    >
                      <option value="Under ₹3 Lakhs">Under ₹3 Lakhs</option>
                      <option value="₹3L - ₹6L">₹3L - ₹6L</option>
                      <option value="₹6L - ₹10L">₹6L - ₹10L</option>
                      <option value="₹10L - ₹20L">₹10L - ₹20L</option>
                      <option value="₹20L+">₹20L+</option>
                      <option value="Flexible / Need Estimate">Flexible / Need Estimate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="preferredDate">Preferred Date</label>
                    <input
                      id="preferredDate"
                      type="date"
                      name="preferredDate"
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="preferredTimeSlot">Convenient Time Slot</label>
                    <select
                      id="preferredTimeSlot"
                      name="preferredTimeSlot"
                      className="form-select"
                      value={formData.preferredTimeSlot}
                      onChange={handleChange}
                    >
                      <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                      <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                      <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                      <option value="Anytime">Anytime during working hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 6: Floor Plan & Vision */}
              <div className="form-section">
                <h3 className="section-title">
                  <span className="section-number">6</span>
                  Floor Plan & Vision (Optional)
                </h3>

                <div className="form-group full-width" style={{ marginBottom: '16px' }}>
                  <label htmlFor="floorPlanUrl">Floor Plan Drive Link / Pinterest Board</label>
                  <input
                    id="floorPlanUrl"
                    type="url"
                    name="floorPlanUrl"
                    className="form-input"
                    placeholder="Paste Google Drive / Dropbox link to your floor plan PDF or Pinterest moodboard"
                    value={formData.floorPlanUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="notes">Special Requirements & Storage Needs</label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="form-textarea"
                    placeholder="Tell us about storage needs, preferred materials (quartz, solid wood, acoustic panels), lighting ideas, or room challenges..."
                    value={formData.notes}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting Consultation Request...' : 'Schedule Design Consultation →'}
              </button>
            </form>

            {/* Right: Sticky Live Preview Sidebar */}
            <div className="consultation-sidebar">
              <div className="live-preview-card">
                <div className="preview-image-wrapper">
                  <img
                    src={selectedInspiration.image}
                    alt={selectedInspiration.title}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="preview-badge-floating">{formData.roomType || selectedInspiration.category}</span>
                  <span className="preview-style-badge">{formData.preferredStyle || selectedInspiration.style}</span>
                </div>

                <div className="preview-body">
                  <h3>{selectedInspiration.title}</h3>

                  <div className="preview-meta-list">
                    <div className="preview-meta-item">
                      <span>Experience Mode</span>
                      <strong>{consultationMode}</strong>
                    </div>
                    <div className="preview-meta-item">
                      <span>Property Scope</span>
                      <strong>{formData.propertyType}</strong>
                    </div>
                    <div className="preview-meta-item">
                      <span>Budget Benchmark</span>
                      <strong>{formData.budgetRange || selectedInspiration.budget}</strong>
                    </div>
                    {formData.preferredDate && (
                      <div className="preview-meta-item">
                        <span>Preferred Date</span>
                        <strong>{new Date(formData.preferredDate).toLocaleDateString()}</strong>
                      </div>
                    )}
                  </div>

                  <div className="architect-badge-box">
                    <div className="architect-icon">📐</div>
                    <div className="architect-text">
                      <h5>{preferredArchitect}</h5>
                      <p>Lead Architectural Designer Assigned</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Studio Trust Card */}
              <div className="studio-trust-card">
                <div className="trust-item">
                  <span>✓</span> 100% Customized 3D Layout Guarantee
                </div>
                <div className="trust-item">
                  <span>✓</span> Transparent BOQ Itemized Pricing
                </div>
                <div className="trust-item">
                  <span>✓</span> 45-Day Guaranteed Handover Timeline
                </div>
                <div className="trust-item">
                  <span>✓</span> 10-Year Comprehensive Material Warranty
                </div>
              </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
}

export default BookConsultation;
