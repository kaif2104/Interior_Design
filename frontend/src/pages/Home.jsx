import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolioItems } from '../api/portfolio';
import './Home.css';

function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback curated projects if backend portfolio is empty
  const defaultProjects = [
    {
      _id: 'default-1',
      title: 'Modern Living Room Makeover',
      category: 'Living Room',
      style: 'Modern',
      budgetRange: '₹3L - ₹5L',
      areaSize: '450 sq.ft.',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
    },
    {
      _id: 'default-2',
      title: 'Minimalist Bedroom Design',
      category: 'Bedroom',
      style: 'Minimalist',
      budgetRange: '₹2.5L - ₹4L',
      areaSize: '320 sq.ft.',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80'
    },
    {
      _id: 'default-3',
      title: 'Traditional Kitchen Renovation',
      category: 'Kitchen',
      style: 'Traditional',
      budgetRange: '₹4L - ₹7L',
      areaSize: '250 sq.ft.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    }
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getPortfolioItems();
        if (res.data && res.data.length > 0) {
          setFeaturedProjects(res.data.slice(0, 3));
        } else {
          setFeaturedProjects(defaultProjects);
        }
      } catch (err) {
        console.log('Using default featured projects:', err);
        setFeaturedProjects(defaultProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const services = [
    {
      title: 'Living & Dining Rooms',
      category: 'Living Room',
      description: 'Sophisticated open-concept layouts, bespoke wall paneling, acoustic lighting, and plush seating.',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Modular Kitchens',
      category: 'Kitchen',
      description: 'German-engineered hardware, anti-scratch quartz countertops, and ergonomic storage systems.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Master Suites & Bedrooms',
      category: 'Bedroom',
      description: 'Serene sanctuaries featuring custom walk-in closets, ambient cove lighting, and acoustic comfort.',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Workspaces & Commercial',
      category: 'Office',
      description: 'Ergonomic executive desks, sound-dampened meeting pods, and collaborative studio spaces.',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const testimonials = [
    {
      name: 'Priya & Vikram Malhotra',
      role: '3 BHK Penthouse, Mumbai',
      stars: '★★★★★',
      quote: 'Interior Studio transformed our raw apartment into an exquisite luxury haven. The 3D visualizations matched the real execution down to the exact millimeter and wood grain.'
    },
    {
      name: 'Rohan Sharma',
      role: 'Villa Renovation, Bangalore',
      stars: '★★★★★',
      quote: 'The 45-day handover promise was kept with impeccable craftsmanship. Their modular kitchen and lighting architecture blew our guests away!'
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Home Studio & Living Space, Pune',
      stars: '★★★★★',
      quote: 'From space planning to furniture fabrication, their team handled everything end-to-end. Truly stress-free turnkey interior design.'
    }
  ];

  return (
    <div className="home-container">
      {/* 1. HERO BANNER */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-pill">Bespoke Architectural Interiors</span>
          <h1 className="hero-title">
            Crafting Timeless Spaces with <span>Luxury & Precision</span>
          </h1>
          <p className="hero-description">
            We merge intelligent space planning, artisanal craftsmanship, and modern aesthetics to transform residences and commercial properties into inspiring environments.
          </p>
          <div className="hero-actions">
            <Link to="/book-consultation" className="btn-hero-primary">
              Book a Free Consultation →
            </Link>
            <Link to="/portfolio" className="btn-hero-secondary">
              Explore Our Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">250+</span>
          <span className="stat-label">Homes Crafted</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">15+</span>
          <span className="stat-label">Years of Mastery</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">45-Day</span>
          <span className="stat-label">Move-In Guarantee</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">10-Yr</span>
          <span className="stat-label">Material Warranty</span>
        </div>
      </div>

      {/* 3. OUR SPECIALTIES / SERVICES */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">What We Do</span>
          <h2>Tailored Design Solutions</h2>
          <p>
            Every space has its own narrative. We provide specialized architectural and interior expertise tailored to your distinct lifestyle.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <img src={service.image} alt={service.title} className="service-image" />
              <div className="service-body">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/portfolio" className="service-link">
                  View {service.category} Projects →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PROJECTS SHOWCASE */}
      <section className="section" style={{ background: '#ffffff', borderRadius: '16px', padding: '60px 30px', margin: '30px auto', border: '1px solid #f0ede8' }}>
        <div className="section-header">
          <span className="section-tag">Portfolio Highlights</span>
          <h2>Recent Architectural Masterpieces</h2>
          <p>
            Take a glance at some of our recently completed residential and commercial interior transformations.
          </p>
        </div>

        <div className="projects-grid">
          {featuredProjects.map((project) => {
            const projectImg =
              project.images && project.images.length > 0
                ? project.images[0]
                : project.image || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80';

            const projectUrl = project._id.startsWith('default-')
              ? '/portfolio'
              : `/portfolio/${project._id}`;

            return (
              <Link key={project._id} to={projectUrl} className="featured-project-card">
                <div className="project-img-wrapper">
                  <img src={projectImg} alt={project.title} />
                  <span className="project-category-badge">{project.category}</span>
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <div className="project-tags">{project.style} Aesthetics</div>
                  <div className="project-meta">
                    <span>Budget: <strong>{project.budgetRange || 'Bespoke'}</strong></span>
                    <span>Area: <strong>{project.areaSize || 'Custom'}</strong></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/portfolio" className="btn-hero-primary" style={{ background: '#1a1a1a', color: '#fff', display: 'inline-block' }}>
            View Full Portfolio Gallery ({featuredProjects.length}+ Projects) →
          </Link>
        </div>
      </section>

      {/* 4.5 PHYSICAL FURNISHINGS & DECOR SUPPLY SHOWCASE */}
      <section className="section" style={{ background: '#faf8f5', borderRadius: '16px', padding: '60px 30px', margin: '30px auto', border: '1px solid #eae5dc' }}>
        <div className="section-header">
          <span className="section-tag">Direct Material & Item Supply</span>
          <h2>Physical Furnishings, Lamps, Chairs & Wallpapers</h2>
          <p>
            In today's world, great design goes far beyond 3D software. We supply authentic physical pieces—designer lighting, bespoke armchairs, textured wallpapers, and luxury tables—delivered straight to your project site.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '22px',
          marginTop: '30px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6e0', padding: '18px', textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
              alt="Designer Lamps"
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#c59d5f', textTransform: 'uppercase', display: 'block', marginTop: '12px' }}>
              Lighting & Lamps
            </span>
            <h4 style={{ fontSize: '16px', color: '#141414', margin: '6px 0 4px' }}>Aura Brushed Brass Lamp</h4>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px' }}>Fluted ceramic base with warm 2700K ambient LED dimmer.</p>
            <strong style={{ color: '#141414', fontSize: '15px' }}>₹4,499</strong>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6e0', padding: '18px', textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1580481077195-c3a824552965?auto=format&fit=crop&w=600&q=80"
              alt="Accent Chairs"
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#c59d5f', textTransform: 'uppercase', display: 'block', marginTop: '12px' }}>
              Seating & Chairs
            </span>
            <h4 style={{ fontSize: '16px', color: '#141414', margin: '6px 0 4px' }}>Scandi Bouclé Lounge Chair</h4>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px' }}>Textured wool bouclé with solid kiln-dried ashwood frame.</p>
            <strong style={{ color: '#141414', fontSize: '15px' }}>₹14,999</strong>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6e0', padding: '18px', textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80"
              alt="Wallpapers"
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#c59d5f', textTransform: 'uppercase', display: 'block', marginTop: '12px' }}>
              Wallpapers & Murals
            </span>
            <h4 style={{ fontSize: '16px', color: '#141414', margin: '6px 0 4px' }}>Botanical Textured Silk Roll</h4>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px' }}>Heavyweight non-woven washable wallpaper with gold foil highlights.</p>
            <strong style={{ color: '#141414', fontSize: '15px' }}>₹3,200</strong>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eae6e0', padding: '18px', textAlign: 'center' }}>
            <img
              src="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80"
              alt="Tables & Consoles"
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#c59d5f', textTransform: 'uppercase', display: 'block', marginTop: '12px' }}>
              Tables & Consoles
            </span>
            <h4 style={{ fontSize: '16px', color: '#141414', margin: '6px 0 4px' }}>Capri Fluted Solid Oak Table</h4>
            <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px' }}>Tambour fluted pedestal base with bullnose rounded top.</p>
            <strong style={{ color: '#141414', fontSize: '15px' }}>₹16,500</strong>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '35px' }}>
          <Link to="/items" className="btn-hero-primary" style={{ background: '#c59d5f', color: '#1a1a1a', fontWeight: '700', display: 'inline-block' }}>
            Explore All Furnishings & Decor Items →
          </Link>
        </div>
      </section>

      {/* 5. 4-STEP DESIGN PROCESS */}
      <section className="process-bg">
        <div className="section-header">
          <span className="section-tag">Seamless Journey</span>
          <h2>How We Bring Your Vision to Life</h2>
          <p>
            Our structured 4-step interior design framework ensures zero surprises, transparent pricing, and punctual execution.
          </p>
        </div>

        <div className="process-grid">
          <div className="process-card">
            <span className="step-number">01</span>
            <h3>Discovery & Concept</h3>
            <p>
              We sit down with you to understand your lifestyle, aesthetic inclinations, functional needs, and budget boundaries.
            </p>
          </div>

          <div className="process-card">
            <span className="step-number">02</span>
            <h3>3D Renders & Materials</h3>
            <p>
              Experience photorealistic 3D walk-throughs and curate tangible samples of veneers, marbles, tiles, and fabrics.
            </p>
          </div>

          <div className="process-card">
            <span className="step-number">03</span>
            <h3>Precision Craftsmanship</h3>
            <p>
              Our master carpenters, electricians, and civil crews manufacture and install modular fittings with strict quality audits.
            </p>
          </div>

          <div className="process-card">
            <span className="step-number">04</span>
            <h3>Styling & Handover</h3>
            <p>
              Deep cleaning, mood lighting installation, soft furnishing styling, and white-glove handover with warranty cards.
            </p>
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="section">
        <div className="section-header">
          <span className="section-tag">The Studio Advantage</span>
          <h2>Why Homeowners Trust Us</h2>
          <p>
            We take pride in setting the industry benchmark for execution reliability and luxury finishes.
          </p>
        </div>

        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">💎</div>
            <h3>100% Customized Designs</h3>
            <p>No cookie-cutter templates. Every wardrobe, kitchen niche, and false ceiling is tailored for your floor plan.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">🏷️</div>
            <h3>No Hidden Charges</h3>
            <p>Detailed BOQ (Bill of Quantities) with transparent material specifications and zero cost escalations midway.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">⏱️</div>
            <h3>On-Time Handover</h3>
            <p>Strict project management timelines backed by our 45-day guaranteed completion commitment.</p>
          </div>

          <div className="value-card">
            <div className="value-icon">🛡️</div>
            <h3>10-Year Warranty</h3>
            <p>High-density moisture-resistant boards, branded hardware, and comprehensive post-handover support.</p>
          </div>
        </div>
      </section>

      {/* 7. CLIENT TESTIMONIALS */}
      <section className="section" style={{ background: '#f5f1eb', borderRadius: '16px', padding: '60px 30px', margin: '30px auto' }}>
        <div className="section-header">
          <span className="section-tag">Client Reviews</span>
          <h2>Loved by Homeowners</h2>
          <p>Read what our happy clients have to say about their design transformation journey.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((item, idx) => (
            <div key={idx} className="testimonial-card">
              <div>
                <div className="stars">{item.stars}</div>
                <p className="testimonial-quote">"{item.quote}"</p>
              </div>
              <div className="client-info">
                <div className="client-avatar">
                  {item.name.charAt(0)}
                </div>
                <div className="client-details">
                  <h4>{item.name}</h4>
                  <span>{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM CTA BANNER */}
      <section className="cta-banner-section">
        <div className="cta-banner-content">
          <h2>Ready to Design Your Dream Space?</h2>
          <p>
            Schedule a one-on-one consultation with our lead interior architects and receive a customized 3D design concept and budget estimate.
          </p>
          <Link to="/book-consultation" className="btn-banner-cta">
            Book Your Design Consultation Now →
          </Link>
        </div>
      </section>

      {/* 9. STUDIO FOOTER */}
      <footer className="studio-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>INTERIOR STUDIO</h3>
            <p>
              Premier architectural & interior design firm delivering bespoke luxury homes, modular kitchens, and commercial interiors.
            </p>
            <p style={{ color: '#c59d5f', fontSize: '13px' }}>
              📍 Studio 402, Design Avenue, Metro District
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/portfolio">Portfolio Gallery</Link></li>
              <li><Link to="/book-consultation">Book Consultation</Link></li>
              <li><Link to="/login">Client Portal</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Spaces We Craft</h4>
            <ul>
              <li><Link to="/portfolio">Living & Dining</Link></li>
              <li><Link to="/portfolio">Modular Kitchens</Link></li>
              <li><Link to="/portfolio">Master Bedrooms</Link></li>
              <li><Link to="/portfolio">Home Offices</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Studio</h4>
            <ul>
              <li>📞 +91 (800) 456-7890</li>
              <li>✉️ design@interiorstudio.com</li>
              <li>⏰ Mon - Sat: 9:30 AM - 7:30 PM</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Interior Studio Architecture & Design. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
