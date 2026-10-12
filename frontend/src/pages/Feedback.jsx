import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFeedback, getFeedback } from '../api/feedback';
import './Feedback.css';

function Feedback() {
  const { user } = useAuth();

  const [clientName, setClientName] = useState(user?.name || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [projectName, setProjectName] = useState('3 BHK Luxury Living & Modular Kitchen');
  const [designerName, setDesignerName] = useState('Priya Sharma (Lead Designer)');
  const [projectStage, setProjectStage] = useState('3D Concept Renders & Material Selection');

  useEffect(() => {
    if (user) {
      setClientName(user.name || '');
      setClientEmail(user.email || '');
    }
  }, [user]);

  // Star ratings
  const [overallRating, setOverallRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [timelinessRating, setTimelinessRating] = useState(5);

  const [comments, setComments] = useState('');
  const [recommend, setRecommend] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Feed & Stats State
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgOverall: '4.9',
    avgCommunication: '5.0',
    avgQuality: '4.8',
    avgTimeliness: '4.9',
    recommendPercent: 98
  });
  const [filterStage, setFilterStage] = useState('');
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Fallback initial sample reviews if database is fresh
  const sampleFeedbacks = [
    {
      _id: 'sample-1',
      clientName: 'Sanjay & Meera Kapoor',
      projectName: '4 BHK Duplex Penthouse',
      designerName: 'Priya Sharma (Lead Designer)',
      projectStage: '3D Concept Renders & Material Selection',
      overallRating: 5,
      comments: 'We just finalized our 50% milestone payment after reviewing the 3D renders with Priya. The lighting visualization and custom veneer textures are breathtaking! Excited for on-site carpentry.',
      recommend: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      _id: 'sample-2',
      clientName: 'Dr. Vivek Nair',
      projectName: 'Gourmet Modular Kitchen Renovation',
      designerName: 'Ananya Deshmukh',
      projectStage: 'On-site Carpentry & Execution',
      overallRating: 5,
      comments: 'Ananya has been exceptionally punctual. The anti-scratch quartz countertops and soft-close tandem drawers were installed with zero hassle. Daily photo updates on WhatsApp are super helpful.',
      recommend: true,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      _id: 'sample-3',
      clientName: 'Kavita Sundaram',
      projectName: 'Scandinavian Master Bedroom Suite',
      designerName: 'Rahul Mehta',
      projectStage: 'Initial Consultation & Space Planning',
      overallRating: 4,
      comments: 'Great first session exploring layout options for our compact bedroom. Rahul presented 3 clever storage hacks and guided us on budget allocation before starting 3D designs.',
      recommend: true,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
    }
  ];

  const fetchFeed = async () => {
    try {
      setLoadingFeed(true);
      const filters = {};
      if (filterStage) filters.projectStage = filterStage;

      const res = await getFeedback(filters);
      if (res.data.feedbacks && res.data.feedbacks.length > 0) {
        setFeedbacks(res.data.feedbacks);
        setStats(res.data.stats);
      } else {
        setFeedbacks(sampleFeedbacks);
      }
    } catch (err) {
      console.log('Using sample reviews:', err);
      setFeedbacks(sampleFeedbacks);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [filterStage]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        clientName,
        clientEmail,
        projectName,
        designerName,
        projectStage,
        overallRating,
        communicationRating,
        qualityRating,
        timelinessRating,
        comments,
        recommend,
        userId: user?.id || user?._id || undefined
      };

      const res = await createFeedback(payload);
      setMessage(res.data.message || 'Review submitted successfully!');
      setComments('');
      fetchFeed();
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarsSelector = (rating, setRating) => (
    <div className="star-buttons">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= rating ? 'active' : ''}`}
          onClick={() => setRating(star)}
        >
          ★
        </button>
      ))}
    </div>
  );

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        {/* Header */}
        <div className="feedback-header">
          <span className="feedback-badge">Client Voice & Continuous Review</span>
          <h1>Ongoing Project Reviews & Feedback</h1>
          <p className="feedback-subtitle">
            Your real-time experience matters. Share your thoughts on design consultations, 3D renders, material quality, and execution progress.
          </p>
        </div>

        {/* Studio Satisfaction Metrics Banner */}
        <div className="metrics-banner">
          <div className="metric-item">
            <div className="metric-score">
              {stats.avgOverall} <span>★</span>
            </div>
            <span className="metric-label">Overall Rating</span>
          </div>

          <div className="metric-item">
            <div className="metric-score">
              {stats.avgCommunication} <span>★</span>
            </div>
            <span className="metric-label">Architect Communication</span>
          </div>

          <div className="metric-item">
            <div className="metric-score">
              {stats.avgQuality} <span>★</span>
            </div>
            <span className="metric-label">Material & 3D Quality</span>
          </div>

          <div className="metric-item">
            <div className="metric-score">
              {stats.avgTimeliness} <span>★</span>
            </div>
            <span className="metric-label">Milestone Timeliness</span>
          </div>

          <div className="metric-item">
            <div className="metric-score">
              {stats.recommendPercent}%
            </div>
            <span className="metric-label">Would Recommend</span>
          </div>
        </div>

        {/* Main Feedback Layout */}
        <div className="feedback-layout">
          {/* Left: Review Submission Form */}
          <div className="feedback-card">
            <h2>Share Your Project Experience</h2>
            <p className="form-desc">
              Rate your lead architect, 3D drawings, or on-site craftsmanship at any stage of your interior journey.
            </p>

            {message && (
              <div style={{ background: '#e6f7ed', color: '#27ae60', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                ✓ {message}
              </div>
            )}

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitReview}>
              <div className="fb-group">
                <label>Your Full Name *</label>
                <input
                  type="text"
                  className="fb-input"
                  placeholder="e.g. Rahul Verma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div className="fb-group">
                <label>Your Email Address *</label>
                <input
                  type="email"
                  className="fb-input"
                  placeholder="e.g. rahul@example.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  required
                />
              </div>

              <div className="fb-group">
                <label>Project Scope / Space</label>
                <input
                  type="text"
                  className="fb-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. 3 BHK Luxury Living & Modular Kitchen"
                />
              </div>

              <div className="fb-group">
                <label>Assigned Lead Designer</label>
                <select
                  className="fb-select"
                  value={designerName}
                  onChange={(e) => setDesignerName(e.target.value)}
                >
                  <option value="Priya Sharma (Lead Designer)">Priya Sharma (Lead Designer)</option>
                  <option value="Rahul Mehta">Rahul Mehta</option>
                  <option value="Ananya Deshmukh">Ananya Deshmukh</option>
                  <option value="Vikram Sengupta">Vikram Sengupta</option>
                </select>
              </div>

              <div className="fb-group">
                <label>Current Project Stage *</label>
                <select
                  className="fb-select"
                  value={projectStage}
                  onChange={(e) => setProjectStage(e.target.value)}
                  required
                >
                  <option value="Initial Consultation & Space Planning">
                    1. Initial Consultation & Space Planning
                  </option>
                  <option value="3D Concept Renders & Material Selection">
                    2. 3D Concept Renders & Material Selection (Post 50% Advance)
                  </option>
                  <option value="On-site Carpentry & Execution">
                    3. On-site Carpentry & Execution
                  </option>
                  <option value="Final Handover & Completed Project">
                    4. Final Handover & Completed Project
                  </option>
                </select>
              </div>

              {/* Star Rating Grid */}
              <div className="rating-selectors-grid">
                <div className="rating-box">
                  <span>Overall Rating:</span>
                  {renderStarsSelector(overallRating, setOverallRating)}
                </div>

                <div className="rating-box">
                  <span>Communication:</span>
                  {renderStarsSelector(communicationRating, setCommunicationRating)}
                </div>

                <div className="rating-box">
                  <span>Design & Materials:</span>
                  {renderStarsSelector(qualityRating, setQualityRating)}
                </div>

                <div className="rating-box">
                  <span>Punctuality:</span>
                  {renderStarsSelector(timelinessRating, setTimelinessRating)}
                </div>
              </div>

              <div className="fb-group">
                <label>Detailed Comments & Feedback *</label>
                <textarea
                  className="fb-textarea"
                  placeholder="Share details about your designer discussion, 3D renderings, material finish, or on-site craftsmanship..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="recommendCheck"
                  checked={recommend}
                  onChange={(e) => setRecommend(e.target.checked)}
                />
                <label htmlFor="recommendCheck">
                  I would recommend Interior Studio to friends & family
                </label>
              </div>

              <button type="submit" className="btn-submit-feedback" disabled={submitting}>
                {submitting ? 'Publishing Review...' : 'Publish Ongoing Review →'}
              </button>
            </form>
          </div>

          {/* Right: Live Review Feed */}
          <div className="feedback-card">
            <div className="reviews-feed-header">
              <h2>Live Client Reviews ({feedbacks.length})</h2>

              <select
                className="feed-filter-select"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
              >
                <option value="">All Project Stages</option>
                <option value="Initial Consultation & Space Planning">Consultation</option>
                <option value="3D Concept Renders & Material Selection">3D Design & Materials</option>
                <option value="On-site Carpentry & Execution">On-site Execution</option>
                <option value="Final Handover & Completed Project">Completed Handover</option>
              </select>
            </div>

            {loadingFeed ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#777' }}>
                Loading reviews feed...
              </p>
            ) : (
              <div className="reviews-list">
                {feedbacks.map((item, idx) => (
                  <div key={item._id || idx} className="review-item-card">
                    <div className="review-top-row">
                      <div className="reviewer-meta">
                        <div className="reviewer-avatar">
                          {item.clientName?.charAt(0) || 'C'}
                        </div>
                        <div className="reviewer-details">
                          <h4>{item.clientName}</h4>
                          <span>{item.projectName}</span>
                        </div>
                      </div>

                      <span className="stage-pill">{item.projectStage}</span>
                    </div>

                    <div className="review-stars">
                      {'★'.repeat(item.overallRating || 5)}
                      {'☆'.repeat(5 - (item.overallRating || 5))}
                    </div>

                    <p className="review-comment-text">"{item.comments}"</p>

                    <div className="review-footer-tags">
                      <span className="designer-tag">Designer: {item.designerName}</span>
                      {item.recommend && (
                        <span className="recommend-tag">✓ Recommended</span>
                      )}
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
