import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPortfolioItemById, getPortfolioItems } from '../api/portfolio';
import './PortfolioDetail.css';

const fallbackImages = {
  'Modern Living Room Makeover': [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80'
  ],
  'Minimalist Master Suite': [
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=80'
  ],
  'Gourmet Modular Kitchen & Island': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
  ],
  'Industrial Executive Studio & Office': [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
  ]
};

const defaultImage = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80';

function PortfolioDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      window.scrollTo(0, 0);

      try {
        const res = await getPortfolioItemById(id);
        setItem(res.data);
        setActiveImage(0);

        if (res.data?.category) {
          const relatedRes = await getPortfolioItems({
            category: res.data.category
          });
          setRelated(relatedRes.data.filter((p) => p._id !== id));
        }
      } catch (err) {
        console.error('Error loading portfolio item:', err);
        setError('Could not load this project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page-wrapper">
        <div className="detail-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p>Loading project portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="detail-page-wrapper">
        <div className="detail-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <p style={{ color: '#c53030', marginBottom: '20px' }}>{error || 'Project not found'}</p>
          <Link to="/portfolio" className="back-link">
            ← Return to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  // Sanitize and resolve image array
  const sanitizeUrl = (url) => {
    if (!url || typeof url !== 'string') return defaultImage;
    const cleaned = url.replace(/^:\s*/, '').trim();
    return cleaned.startsWith('http') ? cleaned : defaultImage;
  };

  const projectImages =
    item.images && item.images.length > 0
      ? item.images.map(sanitizeUrl)
      : fallbackImages[item.title] || [defaultImage];

  return (
    <div className="detail-page-wrapper">
      <div className="detail-container">
        {/* Back Link */}
        <Link to="/portfolio" className="back-link">
          ← Back to Portfolio Gallery
        </Link>

        {/* Header */}
        <div className="detail-header">
          <h1>{item.title}</h1>
          <div className="detail-tags">
            <span className="detail-category-tag">{item.category}</span>
            <span className="detail-style-tag">{item.style} Design</span>
          </div>
        </div>

        {/* Main Stage Image */}
        <div className="main-image-wrapper">
          <img
            src={projectImages[activeImage] || defaultImage}
            alt={item.title}
            className="main-image"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </div>

        {/* Thumbnail Row */}
        {projectImages.length > 1 && (
          <div className="thumbnail-row">
            {projectImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${item.title} angle ${idx + 1}`}
                className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                onClick={() => setActiveImage(idx)}
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
            ))}
          </div>
        )}

        {/* Layout: Narrative & Specifications */}
        <div className="detail-content-layout">
          <div className="detail-narrative">
            <h2>About This Architectural Concept</h2>
            <p>{item.description}</p>
          </div>

          <div className="specs-card">
            <h3>Project Overview</h3>
            <div className="spec-row">
              <span>Space / Scope</span>
              <strong>{item.category}</strong>
            </div>
            <div className="spec-row">
              <span>Design Aesthetics</span>
              <strong>{item.style}</strong>
            </div>
            <div className="spec-row">
              <span>Estimated Budget</span>
              <strong>{item.budgetRange || 'Bespoke Quote'}</strong>
            </div>
            <div className="spec-row">
              <span>Carpet Area</span>
              <strong>{item.areaSize || 'Custom Layout'}</strong>
            </div>
            <div className="spec-row">
              <span>Execution Timeline</span>
              <strong>{item.duration || '4-6 Weeks'}</strong>
            </div>
            {item.designerName && (
              <div className="spec-row">
                <span>Lead Interior Architect</span>
                <strong style={{ color: '#c59d5f' }}>{item.designerName}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Consultation Callout Banner */}
        <div className="project-cta-banner">
          <div className="cta-banner-text">
            <h3>Love this design concept?</h3>
            <p>
              Our lead architects can customize this <strong>{item.style}</strong> aesthetic to your floor plan, dimensions, and budget.
            </p>
          </div>
          <Link
            to={`/book-consultation?project=${item._id}&title=${encodeURIComponent(item.title)}&category=${encodeURIComponent(item.category)}&style=${encodeURIComponent(item.style)}&image=${encodeURIComponent(projectImages[0] || defaultImage)}&budget=${encodeURIComponent(item.budgetRange || '')}&designer=${encodeURIComponent(item.designerName || '')}&area=${encodeURIComponent(item.areaSize || '')}`}
            className="cta-button"
          >
            ✨ Request a Similar Design →
          </Link>
        </div>

        {/* Related Projects */}
        {related.length > 0 && (
          <div className="related-section">
            <h2>More {item.category} Transformations</h2>
            <div className="related-grid">
              {related.map((r) => {
                const rImg =
                  r.images && r.images.length > 0
                    ? sanitizeUrl(r.images[0])
                    : fallbackImages[r.title]?.[0] || defaultImage;

                return (
                  <Link key={r._id} to={`/portfolio/${r._id}`} className="related-card">
                    <img
                      src={rImg}
                      alt={r.title}
                      onError={(e) => {
                        e.target.src = defaultImage;
                      }}
                    />
                    <div className="related-card-info">
                      <strong>{r.title}</strong>
                      <p>{r.style} • {r.budgetRange || 'Bespoke'}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioDetail;