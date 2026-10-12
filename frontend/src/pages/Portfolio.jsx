import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPortfolioItems } from '../api/portfolio';
import './Portfolio.css';

function Portfolio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialStyle = searchParams.get('style') || '';

  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [style, setStyle] = useState(initialStyle);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { label: 'All Spaces', value: '' },
    { label: 'Living Room', value: 'Living Room' },
    { label: 'Bedroom', value: 'Bedroom' },
    { label: 'Kitchen', value: 'Kitchen' },
    { label: 'Office', value: 'Office' }
  ];

  const styles = [
    { label: 'All Styles', value: '' },
    { label: 'Modern', value: 'Modern' },
    { label: 'Minimalist', value: 'Minimalist' },
    { label: 'Traditional', value: 'Traditional' },
    { label: 'Industrial', value: 'Industrial' },
    { label: 'Scandinavian', value: 'Scandinavian' }
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (category) filters.category = category;
      if (style) filters.style = style;
      if (search.trim()) filters.search = search.trim();

      const res = await getPortfolioItems(filters);
      setItems(res.data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, style, search]);

  const handleResetFilters = () => {
    setCategory('');
    setStyle('');
    setSearch('');
    setSearchParams({});
  };

  const getCleanImageUrl = (item) => {
    if (item.images && item.images.length > 0 && typeof item.images[0] === 'string') {
      const cleaned = item.images[0].replace(/^:\s*/, '').trim();
      if (cleaned.startsWith('http')) return cleaned;
    }
    return 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-container">
        {/* Header */}
        <div className="portfolio-header">
          <span className="portfolio-badge">Architectural Showcase</span>
          <h1>Our Signature Portfolio</h1>
          <p className="portfolio-subtitle">
            Immerse yourself in our curated gallery of bespoke residential sanctuaries, modular kitchens, and executive workspaces.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="portfolio-controls">
          <div className="controls-top-row">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search projects, styles, designers (e.g. 'Living', 'Scandinavian', 'Modern')..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="style-select"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              {styles.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Chips */}
          <div className="category-chips">
            <span className="chip-label">Spaces:</span>
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`category-chip ${category === cat.value ? 'active' : ''}`}
                onClick={() => setCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active Filter summary */}
          {(category || style || search) && (
            <div className="active-filter-bar">
              <span>
                Showing results for{' '}
                <strong>
                  {[category, style, search ? `"${search}"` : ''].filter(Boolean).join(' • ')}
                </strong>{' '}
                ({items.length} {items.length === 1 ? 'project' : 'projects'})
              </span>
              <button className="clear-btn" onClick={handleResetFilters}>
                Clear All Filters ✕
              </button>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="loading-state">
            <p>Loading curated architectural projects...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏛️</div>
            <h3>No matching design projects found</h3>
            <p>Try adjusting your search terms, style preferences, or space categories.</p>
            <button className="btn-reset-filters" onClick={handleResetFilters}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="gallery-grid">
            {items.map((item) => (
              <Link
                key={item._id}
                to={`/portfolio/${item._id}`}
                className="portfolio-card"
              >
                <div className="card-image-wrapper">
                  <img
                    src={getCleanImageUrl(item)}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="card-badge">{item.category}</span>
                  <span className="card-style-badge">{item.style}</span>
                </div>

                <div className="card-body">
                  <h3>{item.title}</h3>
                  <p className="card-description">{item.description}</p>

                  <div className="card-meta-row">
                    <div className="card-meta-item">
                      <span>Budget</span>
                      <strong>{item.budgetRange || 'Bespoke'}</strong>
                    </div>
                    <div className="card-meta-item">
                      <span>Carpet Area</span>
                      <strong>{item.areaSize || 'Custom'}</strong>
                    </div>
                    <div className="card-meta-item">
                      <span>Timeline</span>
                      <strong>{item.duration || '4-6 wks'}</strong>
                    </div>
                  </div>

                  {item.designerName && (
                    <div className="card-designer">
                      <span>Lead: {item.designerName}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Portfolio;