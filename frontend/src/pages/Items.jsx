import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getItems } from '../api/items';
import { createOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import QRCodePayment from '../components/QRCodePayment';
import './Items.css';

const fallbackItems = [
  {
    _id: 'sample-item-cupboard-1',
    name: 'Aura 4-Door Fluted Glass Wardrobe with Sensor LED Illumination',
    category: 'Cupboards & Wardrobes',
    price: 38500,
    originalPrice: 48000,
    dimensions: '78" H x 64" W x 22" D | 4 Shutters',
    material: 'Heavy-Duty Moisture Resistant (HDMR) Core, Fluted Glass & Gold Trim',
    color: 'Matte Charcoal & Champagne Gold',
    leadTime: '5-7 Days Custom Modular Assembly',
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 39,
    images: [
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558882224-dda166733046?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Architectural masterpiece wardrobe featuring tempered fluted glass doors that softly reveal wardrobe contents with integrated motion-sensor warm 3000K LED ambient illumination. Engineered with German Blum soft-close hinges and dual-tier hanging rails.',
    features: [
      'German Blum hydraulic soft-close hinges tested for 100,000 cycles',
      'Integrated motion-sensor vertical LED light bars inside each compartment',
      'Dedicated velvet-lined accessory organizer drawers with numeric lock',
      'Anti-fungal and termite-proof HDMR calibrated board structure'
    ]
  },
  {
    _id: 'sample-item-cupboard-2',
    name: 'Nordic Modular Walk-In Master Cupboard & Dressing Unit',
    category: 'Cupboards & Wardrobes',
    price: 52000,
    originalPrice: 65000,
    dimensions: '84" H x 96" W x 24" D (Modular Expandable)',
    material: 'European Natural Oak Veneer & Solid Ashwood Framework',
    color: 'Natural Scandinavian Oak',
    leadTime: '7-10 Days Studio Handcrafting',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 47,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An expansive open-concept master dressing wardrobe system with customizable shelving, telescopic trouser racks, dedicated shoe gallery shelves with angled display, and integrated vanity mirror module.',
    features: [
      'Modular reconfigurable shelf heights with precision brass pins',
      'Full-extension smooth soft-close drawer runners',
      'Telescopic pull-out tie, belt, and trouser hanger tracks',
      'Integrated full-height vanity mirror panel'
    ]
  },
  {
    _id: 'sample-item-cupboard-3',
    name: 'Milano 3-Door Sliding Tinted Mirror Wardrobe',
    category: 'Cupboards & Wardrobes',
    price: 42500,
    originalPrice: 54000,
    dimensions: '80" H x 72" W x 24" D | 3 Sliding Panels',
    material: 'Marine Grade BWP Plywood & Grey Tinted Toughened Mirror Glass',
    color: 'Smoked Grey Mirror / Matte Slate',
    leadTime: '5-8 Days Custom Fit',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 33,
    images: [
      'https://images.unsplash.com/photo-1595514535415-dae80a08e036?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Ultra-modern space-saving sliding wardrobe with acoustic brush-sealed tracks for whisper-quiet glide. Smoked tinted mirrors visually double room depth while providing expansive full-length reflection.',
    features: [
      'Heavy-duty floor-bearing sliding track with dual soft-dampers',
      'Acoustic dust-preventing brush seals on all door overlaps',
      'Internal digital safe locker compartment for security',
      'Spacious overhead loft storage for travel luggage'
    ]
  },
  {
    _id: 'sample-item-cabinet-1',
    name: 'Artisanal Tambour Fluted Solid Teak Bar Cabinet & Credenza',
    category: 'Cabinets & Storage',
    price: 24500,
    originalPrice: 32000,
    dimensions: '48" H x 36" W x 18" D',
    material: 'Seasoned Solid Burmese Teak & Brushed Brass Inlay',
    color: 'Warm Caramel Teak',
    leadTime: '4-6 Days Ready to Dispatch',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Statement entertaining cabinet featuring seamless curved tambour fluted roll-up wooden doors. Includes hanging brass stemware racks, 12-bottle geometric wine grid, and mirrored cocktail preparation countertop.',
    features: [
      'Curved tambour rolling doors that glide smoothly around sides',
      'Mirror-backed prep shelf with spill-resistant organic lacquer',
      'Hanging stemware rack holds up to 16 wine/cocktail glasses',
      'Solid brass knurled handles and tapered stiletto legs'
    ]
  },
  {
    _id: 'sample-item-cabinet-2',
    name: 'Floating Italian Carrara Marble TV Media Credenza',
    category: 'Cabinets & Storage',
    price: 19800,
    originalPrice: 26000,
    dimensions: '18" H x 72" W x 16" D (Wall-Mounted)',
    material: 'Natural Italian Carrara Marble Slab & Fluted Walnut Wood',
    color: 'White Carrara / Smoked Walnut',
    leadTime: '3-5 Days',
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615873968403-89e068629265?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Minimalist wall-hung entertainment console topped with a 20mm genuine Carrara marble slab. Concealed push-to-open fluted drop-down doors keep cables, gaming consoles, and soundbars neatly organized.',
    features: [
      'Concealed brush-grommet cable management pathway',
      'Push-to-open hydraulic drop-down acoustic fabric shutters',
      'Heavy-duty French cleat wall mounting hardware supports up to 90 kg'
    ]
  },
  {
    _id: 'sample-item-1',
    name: 'Aura Brushed Brass & Ceramic Table Lamp',
    category: 'Lighting & Lamps',
    price: 4499,
    originalPrice: 5999,
    dimensions: 'Height: 48 cm | Base: 20 cm | Shade Dia: 32 cm',
    material: 'Fluted Ceramic Base & Solid Brushed Brass Hardware',
    color: 'Cream Oatmeal / Matte Gold',
    leadTime: 'Ready to Ship (2-4 Days)',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 28,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A sculptural statement luminaire marrying artisanal fluted ceramic with brushed warm brass. Casts a soft ambient glow perfect for living room consoles, bedside tables, or study credenzas.',
    features: [
      '3-level touch dimmer built into brass switch',
      'Handcrafted fluted terracotta ceramic base',
      'Energy efficient warm 2700K LED bulb included'
    ]
  },
  {
    _id: 'sample-item-3',
    name: 'Scandi Bouclé Ergonomic Accent Lounge Chair',
    category: 'Seating & Chairs',
    price: 14999,
    originalPrice: 19999,
    dimensions: '32" W x 34" D x 31" H | Seat Height: 17.5"',
    material: 'Imported Textured Bouclé Wool & Solid Natural Ashwood',
    color: 'Ivory Bouclé / Natural Oak',
    leadTime: 'Ready to Ship (3-5 Days)',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1580481077195-c3a824552965?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Generously curved silhouette upholstered in plush, high-rub count bouclé fabric. Ergonomically contoured lumbar support ensures luxurious comfort for conversation areas and bedroom lounges.',
    features: [
      'High-resilience foam cushion core with feather-blend topper',
      'Kiln-dried solid ashwood inner frame with 10-year durability guarantee',
      'Stain-resistant nano-treated bouclé yarn'
    ]
  },
  {
    _id: 'sample-item-5',
    name: 'Botanical Oasis Textured Silk Wallpaper Roll',
    category: 'Wallpapers & Wall Decor',
    price: 3200,
    originalPrice: 4200,
    dimensions: 'Standard Roll: 10 m Length x 53 cm Width (57 sq.ft. coverage)',
    material: 'Heavyweight Non-Woven Substrate with Embossed Silk Weave',
    color: 'Sage Mist & Gold Foil Accents',
    leadTime: 'Ready to Dispatch (1-3 Days)',
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 36,
    images: [
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Transform accent walls into serene biophilic retreats. Features delicately embossed botanical motifs with subtle micro-foil highlights that catch ambient light.',
    features: [
      'Paste-the-wall technology for bubble-free seamless DIY installation',
      'Washable and scrub-resistant vinyl topcoat'
    ]
  }
];

const categories = [
  'All Items',
  'Cupboards & Wardrobes',
  'Cabinets & Storage',
  'Lighting & Lamps',
  'Seating & Chairs',
  'Wallpapers & Wall Decor',
  'Tables & Consoles',
  'Rugs & Textiles',
  'Decor & Accents'
];

function Items() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, openCart } = useCart();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [inquireSuccess, setInquireSuccess] = useState('');

  // Standalone Single Item Purchase State
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [checkoutForm, setCheckoutForm] = useState({
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientPhone: user?.phone || '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    paymentMethod: 'UPI / QR Code',
    notes: ''
  });
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [confirmedOrderReceipt, setConfirmedOrderReceipt] = useState(null);

  useEffect(() => {
    if (user) {
      setCheckoutForm((prev) => ({
        ...prev,
        clientName: prev.clientName || user.name || '',
        clientEmail: prev.clientEmail || user.email || '',
        clientPhone: prev.clientPhone || user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadItems();
  }, [selectedCategory, sortOption]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All Items') {
        params.category = selectedCategory;
      }
      if (sortOption !== 'default') {
        params.sort = sortOption;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await getItems(params);
      if (res.data && res.data.length > 0) {
        setItems(res.data);
      } else {
        if (selectedCategory === 'All Items') {
          setItems(fallbackItems);
        } else {
          setItems(fallbackItems.filter((i) => i.category === selectedCategory));
        }
      }
    } catch (err) {
      console.log('Error loading items, using fallback:', err);
      if (selectedCategory === 'All Items') {
        setItems(fallbackItems);
      } else {
        setItems(fallbackItems.filter((i) => i.category === selectedCategory));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadItems();
  };

  const handleInquireOrOrder = (item) => {
    setInquireSuccess(`✓ Added "${item.name}" to your interior design item request list! Our architect will include this in your project quotation.`);
    setTimeout(() => {
      setInquireSuccess('');
    }, 4000);
  };

  const handleAddToConsultation = (item) => {
    navigate(`/book-consultation?title=${encodeURIComponent('Furnishing Provision: ' + item.name)}&category=${encodeURIComponent(item.category.includes('Chair') || item.category.includes('Seating') ? 'Living Room' : item.category.includes('Wallpaper') ? 'Living Room' : 'Living Room')}&budget=₹${item.price.toLocaleString()}`);
  };

  // Open Buy Now Modal for single item
  const handleOpenBuyNow = (item) => {
    setCheckoutItem(item);
    setQuantity(1);
    setOrderError('');
    setSelectedItemModal(null);
  };

  // Handle Quantity adjustment
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(20, prev + delta)));
  };

  // Process Standalone Item Purchase
  const handleConfirmPurchase = async (e, utrRef) => {
    if (e) e.preventDefault();
    setOrderError('');

    if (!checkoutForm.clientName || !checkoutForm.clientEmail || !checkoutForm.clientPhone) {
      setOrderError('Name, email address, and phone number are required.');
      return;
    }

    if (!checkoutForm.street || !checkoutForm.city || !checkoutForm.pincode) {
      setOrderError('Please provide a complete delivery street address and PIN code.');
      return;
    }

    setProcessingOrder(true);

    try {
      const itemImg = checkoutItem.images && checkoutItem.images[0]
        ? checkoutItem.images[0]
        : 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80';

      const payload = {
        clientName: checkoutForm.clientName,
        clientEmail: checkoutForm.clientEmail,
        clientPhone: checkoutForm.clientPhone,
        items: [
          {
            itemId: checkoutItem._id?.length === 24 ? checkoutItem._id : undefined,
            name: checkoutItem.name,
            price: checkoutItem.price,
            quantity: quantity,
            image: itemImg,
            category: checkoutItem.category,
            material: checkoutItem.material,
            dimensions: checkoutItem.dimensions
          }
        ],
        totalAmount: checkoutItem.price * quantity,
        shippingAddress: {
          street: checkoutForm.street,
          city: checkoutForm.city,
          state: checkoutForm.state,
          pincode: checkoutForm.pincode
        },
        paymentMethod: checkoutForm.paymentMethod,
        notes: utrRef ? `Paid via UPI (Ref: ${utrRef}). ${checkoutForm.notes || ''}` : checkoutForm.notes,
        userId: user?.id || user?._id || undefined
      };

      const res = await createOrder(payload);
      setConfirmedOrderReceipt(res.data.order);
      setCheckoutItem(null);
    } catch (err) {
      console.error('Error placing standalone order:', err);
      setOrderError(err.response?.data?.message || 'Failed to place item order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // Filter in memory for instantaneous search if needed
  const displayItems = items.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.material && item.material.toLowerCase().includes(q)) ||
      (item.color && item.color.toLowerCase().includes(q))
    );
  });

  return (
    <div className="items-page">
      <div className="items-container">
        {/* Header */}
        <div className="items-header">
          <span className="items-badge">Physical Decor & Furnishings Provision</span>
          <h1>Lamps, Chairs, Wallpapers & Curated Decor</h1>
          <p className="items-subtitle">
            Beyond 3D space planning, we source and deliver verified physical items directly to your residence. Discover artisan lighting, bespoke seating, designer textured wallpapers, and heirloom furniture.
          </p>
        </div>

        {inquireSuccess && (
          <div style={{
            background: '#e6f7ed',
            color: '#27ae60',
            padding: '14px 20px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontWeight: '600',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(39,174,96,0.15)'
          }}>
            {inquireSuccess}
          </div>
        )}

        {/* Filter & Controls Bar */}
        <div className="items-controls-bar">
          <div className="category-tabs-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <form className="search-sort-row" onSubmit={handleSearchSubmit}>
            <div className="item-search-wrapper">
              <span className="search-icon-fixed">🔍</span>
              <input
                type="text"
                className="item-search-input"
                placeholder="Search lamps, chairs, wallpapers, oak tables, materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">Sort by: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </form>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#777' }}>
            <p>Loading curated interior furnishings catalog...</p>
          </div>
        ) : displayItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #eae6e0' }}>
            <h3>No furnishing items found matching "{searchTerm}"</h3>
            <p style={{ color: '#777', marginTop: '6px' }}>Try switching category tabs or clearing your search query.</p>
            <button
              onClick={() => { setSelectedCategory('All Items'); setSearchTerm(''); }}
              style={{
                background: '#1a1a1a',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                marginTop: '14px',
                cursor: 'pointer'
              }}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {displayItems.map((item) => {
              const imgUrl = item.images && item.images[0]
                ? item.images[0]
                : 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80';

              return (
                <div key={item._id} className="item-card">
                  <div className="item-img-box" onClick={() => setSelectedItemModal(item)} style={{ cursor: 'pointer' }}>
                    <img src={imgUrl} alt={item.name} />
                    <span className="item-category-tag">{item.category}</span>
                    <span className="item-stock-tag">✓ In Stock</span>
                  </div>

                  <div className="item-body">
                    <h3 className="item-title" onClick={() => setSelectedItemModal(item)} style={{ cursor: 'pointer' }}>
                      {item.name}
                    </h3>
                    <div className="item-material">{item.material || 'Artisanal Spec'}</div>

                    <div className="item-specs-mini">
                      {item.dimensions && <div>📏 <strong>Dimensions:</strong> {item.dimensions}</div>}
                      {item.leadTime && <div>🚚 <strong>Delivery:</strong> {item.leadTime}</div>}
                    </div>

                    <div className="item-price-row">
                      <span className="item-price-current">₹{item.price?.toLocaleString()}</span>
                      {item.originalPrice && (
                        <span className="item-price-old">₹{item.originalPrice?.toLocaleString()}</span>
                      )}
                      {item.originalPrice && (
                        <span className="item-discount-badge">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    <div className="item-card-actions">
                      <button
                        className="btn-item-cart"
                        onClick={() => addToCart(item, 1)}
                        title="Add to Studio Cart"
                      >
                        🛒 Add to Cart
                      </button>
                      <button
                        className="btn-item-buy"
                        onClick={() => handleOpenBuyNow(item)}
                      >
                        ⚡ Buy Now
                      </button>
                      <button
                        className="btn-item-view"
                        onClick={() => setSelectedItemModal(item)}
                      >
                        Specs 🔍
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL QUICK VIEW */}
        {selectedItemModal && (
          <div className="item-modal-overlay" onClick={() => setSelectedItemModal(null)}>
            <div className="item-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-icon"
                onClick={() => setSelectedItemModal(null)}
              >
                ✕
              </button>

              <div className="modal-img-col">
                <img
                  src={selectedItemModal.images?.[0] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'}
                  alt={selectedItemModal.name}
                  className="modal-main-img"
                />
                <div style={{ marginTop: '14px', fontSize: '12px', color: '#888' }}>
                  ⭐ {selectedItemModal.rating || 4.9} ({selectedItemModal.reviewCount || 24} Verified Studio Reviews)
                </div>
              </div>

              <div className="modal-details-col">
                <span className="modal-category-chip">{selectedItemModal.category}</span>
                <h2 className="modal-item-title">{selectedItemModal.name}</h2>

                <div className="modal-price-box">
                  <span style={{ fontSize: '24px', fontWeight: '700', color: '#141414' }}>
                    ₹{selectedItemModal.price?.toLocaleString()}
                  </span>
                  {selectedItemModal.originalPrice && (
                    <span style={{ fontSize: '15px', color: '#999', textDecoration: 'line-through' }}>
                      ₹{selectedItemModal.originalPrice?.toLocaleString()}
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: '#27ae60', background: '#e6f7ed', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Verified Material Supply
                  </span>
                </div>

                <p className="modal-desc">{selectedItemModal.description}</p>

                <div className="modal-specs-table">
                  {selectedItemModal.material && (
                    <div className="modal-specs-row">
                      <span className="modal-specs-label">Material & Build:</span>
                      <span className="modal-specs-val">{selectedItemModal.material}</span>
                    </div>
                  )}
                  {selectedItemModal.dimensions && (
                    <div className="modal-specs-row">
                      <span className="modal-specs-label">Exact Dimensions:</span>
                      <span className="modal-specs-val">{selectedItemModal.dimensions}</span>
                    </div>
                  )}
                  {selectedItemModal.color && (
                    <div className="modal-specs-row">
                      <span className="modal-specs-label">Color / Finish:</span>
                      <span className="modal-specs-val">{selectedItemModal.color}</span>
                    </div>
                  )}
                  {selectedItemModal.leadTime && (
                    <div className="modal-specs-row">
                      <span className="modal-specs-label">Handover Timeline:</span>
                      <span className="modal-specs-val">{selectedItemModal.leadTime}</span>
                    </div>
                  )}
                </div>

                {selectedItemModal.features && selectedItemModal.features.length > 0 && (
                  <div>
                    <strong style={{ fontSize: '13px', color: '#333' }}>Architectural Features:</strong>
                    <ul className="modal-features-list">
                      {selectedItemModal.features.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-actions-box">
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn-item-cart"
                      style={{ flex: 1, padding: '13px', fontSize: '14px' }}
                      onClick={() => {
                        addToCart(selectedItemModal, 1);
                        setSelectedItemModal(null);
                      }}
                    >
                      🛒 Add to Cart
                    </button>
                    <button
                      className="btn-item-buy"
                      style={{ flex: 1, padding: '13px', fontSize: '14px' }}
                      onClick={() => {
                        const it = selectedItemModal;
                        setSelectedItemModal(null);
                        handleOpenBuyNow(it);
                      }}
                    >
                      ⚡ Buy Now
                    </button>
                  </div>

                  <button
                    className="btn-order-project"
                    onClick={() => {
                      const it = selectedItemModal;
                      setSelectedItemModal(null);
                      handleAddToConsultation(it);
                    }}
                  >
                    Include in Custom Interior Design Project →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: INSTANT ITEM CHECKOUT & SEPARATE BILLING */}
        {checkoutItem && (
          <div className="item-modal-overlay" onClick={() => setCheckoutItem(null)}>
            <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-icon"
                onClick={() => setCheckoutItem(null)}
              >
                ✕
              </button>

              <div className="checkout-header">
                <span className="modal-category-chip">Standalone Item Purchasing</span>
                <h3>Direct Furnishing Checkout & Tax Invoice</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                  Purchase physical decor items individually with separate billing and direct delivery.
                </p>
              </div>

              {orderError && (
                <div style={{ background: '#fde8e8', color: '#e53e3e', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                  {orderError}
                </div>
              )}

              {/* Product Summary Strip */}
              <div className="checkout-product-strip">
                <img
                  src={checkoutItem.images?.[0] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'}
                  alt={checkoutItem.name}
                  className="checkout-thumb"
                />
                <div className="checkout-product-info">
                  <div className="checkout-product-cat">{checkoutItem.category}</div>
                  <div className="checkout-product-title">{checkoutItem.name}</div>
                  <div style={{ fontSize: '13px', color: '#141414', fontWeight: '700' }}>
                    ₹{checkoutItem.price?.toLocaleString()} each
                  </div>
                </div>

                <div className="qty-stepper">
                  <button type="button" className="qty-btn" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    -
                  </button>
                  <span className="qty-val">{quantity}</span>
                  <button type="button" className="qty-btn" onClick={() => handleQuantityChange(1)} disabled={quantity >= 20}>
                    +
                  </button>
                </div>
              </div>

              <form onSubmit={handleConfirmPurchase}>
                <h4 style={{ fontSize: '14px', margin: '0 0 10px', color: '#141414' }}>
                  1. Delivery & Billing Address
                </h4>

                <div className="checkout-form-grid">
                  <div className="checkout-field">
                    <label>Recipient Name *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      value={checkoutForm.clientName}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, clientName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      className="checkout-input"
                      placeholder="+91 98765 43210"
                      value={checkoutForm.clientPhone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, clientPhone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="checkout-field full-span">
                    <label>Email Address (For Tax Invoice Slip) *</label>
                    <input
                      type="email"
                      className="checkout-input"
                      value={checkoutForm.clientEmail}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, clientEmail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="checkout-field full-span">
                    <label>Street Address / Flat / Building *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="e.g. Flat 402, Building A, Linking Road"
                      value={checkoutForm.street}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, street: e.target.value })}
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>City *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      value={checkoutForm.city}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="e.g. 400050"
                      value={checkoutForm.pincode}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', margin: '14px 0 10px', color: '#141414' }}>
                  2. Choose Payment Method
                </h4>

                <div className="checkout-payment-grid">
                  <div
                    className={`checkout-payment-card ${checkoutForm.paymentMethod === 'UPI / QR Code' ? 'selected' : ''}`}
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'UPI / QR Code' })}
                  >
                    <div>📱 UPI / QR Code</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>GPay, PhonePe, Paytm</div>
                  </div>

                  <div
                    className={`checkout-payment-card ${checkoutForm.paymentMethod === 'Credit / Debit Card' ? 'selected' : ''}`}
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'Credit / Debit Card' })}
                  >
                    <div>💳 Cards</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Visa, Mastercard, RuPay</div>
                  </div>

                  <div
                    className={`checkout-payment-card ${checkoutForm.paymentMethod === 'Net Banking' ? 'selected' : ''}`}
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'Net Banking' })}
                  >
                    <div>🏦 Net Banking</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>All Major Banks</div>
                  </div>

                  <div
                    className={`checkout-payment-card ${checkoutForm.paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}
                    onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: 'Cash on Delivery' })}
                  >
                    <div>💵 Cash on Delivery</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Pay upon delivery</div>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="checkout-calc-box">
                  <div className="calc-row">
                    <span>Item Subtotal ({quantity} x ₹{checkoutItem.price?.toLocaleString()}):</span>
                    <span>₹{(checkoutItem.price * quantity).toLocaleString()}</span>
                  </div>
                  <div className="calc-row">
                    <span>White-Glove Insured Delivery:</span>
                    <span style={{ color: '#27ae60', fontWeight: 'bold' }}>FREE (Studio Covered)</span>
                  </div>
                  <div className="calc-row">
                    <span>Applicable GST (18% inclusive):</span>
                    <span>Included in MRP</span>
                  </div>
                  <div className="calc-row total">
                    <span>Total Amount Payable:</span>
                    <span>₹{(checkoutItem.price * quantity).toLocaleString()}</span>
                  </div>
                </div>

                {/* DYNAMIC QR CODE DISPLAY WHEN UPI IS SELECTED */}
                {checkoutForm.paymentMethod === 'UPI / QR Code' && (
                  <QRCodePayment
                    amount={checkoutItem.price * quantity}
                    orderRef={`ITEM-${Date.now().toString().slice(-6)}`}
                    clientName={checkoutForm.clientName}
                    onPaymentConfirmed={(utr) => handleConfirmPurchase(null, utr)}
                  />
                )}

                {checkoutForm.paymentMethod !== 'UPI / QR Code' && (
                  <button
                    type="submit"
                    className="btn-confirm-order"
                    disabled={processingOrder}
                  >
                    {processingOrder ? 'Processing Purchase & Generating Bill...' : `Confirm Purchase & Pay ₹${(checkoutItem.price * quantity).toLocaleString()} →`}
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ORDER CONFIRMATION & SEPARATE TAX INVOICE SLIP */}
        {confirmedOrderReceipt && (
          <div className="item-modal-overlay" onClick={() => setConfirmedOrderReceipt(null)}>
            <div className="checkout-modal-card" style={{ maxWidth: '580px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
              <h2 style={{ fontSize: '24px', margin: '0 0 6px', color: '#141414' }}>
                Item Order Placed Successfully!
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px' }}>
                Your order has been recorded with a separate tax invoice.
              </p>

              <div style={{
                background: '#faf8f5',
                border: '1px solid #eae6e0',
                borderRadius: '10px',
                padding: '18px',
                textAlign: 'left',
                marginBottom: '20px',
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ color: '#777' }}>Order Reference:</span>
                  <strong>{confirmedOrderReceipt.orderNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ color: '#777' }}>Tax Invoice No:</span>
                  <strong>{confirmedOrderReceipt.receiptNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ color: '#777' }}>Customer:</span>
                  <span>{confirmedOrderReceipt.clientName} ({confirmedOrderReceipt.clientEmail})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ color: '#777' }}>Delivery Address:</span>
                  <span>{confirmedOrderReceipt.shippingAddress?.street}, {confirmedOrderReceipt.shippingAddress?.city} - {confirmedOrderReceipt.shippingAddress?.pincode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                  <span style={{ color: '#777' }}>Payment Method:</span>
                  <span>{confirmedOrderReceipt.paymentMethod}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: '#141414', paddingTop: '4px' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: '#27ae60' }}>₹{confirmedOrderReceipt.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn-confirm-order"
                  onClick={() => {
                    setConfirmedOrderReceipt(null);
                    navigate('/billing?tab=items');
                  }}
                >
                  📄 View in Decor & Furnishings Billing Portal →
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    style={{
                      flex: 1,
                      background: '#f0ede8',
                      border: '1px solid #dcd6ce',
                      padding: '10px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.print()}
                  >
                    🖨️ Print Invoice Receipt
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: '#f0ede8',
                      border: '1px solid #dcd6ce',
                      padding: '10px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    onClick={() => setConfirmedOrderReceipt(null)}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Items;
