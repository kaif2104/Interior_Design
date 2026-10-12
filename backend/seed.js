const mongoose = require('mongoose');
require('dotenv').config();
const Portfolio = require('./models/Portfolio');

const portfolioData = [
  {
    title: 'Modern Living Room Makeover',
    category: 'Living Room',
    style: 'Modern',
    description: 'A complete transformation of a contemporary urban apartment featuring bespoke oak wall paneling, acoustic ambient LED lighting, ergonomic plush velvet sectional, and seamless indoor-outdoor balcony integration.',
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹3.5L - ₹5L',
    areaSize: '450 sq.ft.',
    duration: '5 weeks',
    designerName: 'Priya Sharma'
  },
  {
    title: 'Minimalist Master Suite',
    category: 'Bedroom',
    style: 'Minimalist',
    description: 'A serene, clutter-free sanctuary built on Japandi and Scandinavian minimalism. Features concealed walk-in wardrobes, neutral linen textures, low-profile platform bed, and circadian warm pendant illumination.',
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹2.8L - ₹4.5L',
    areaSize: '350 sq.ft.',
    duration: '4 weeks',
    designerName: 'Rahul Mehta'
  },
  {
    title: 'Gourmet Modular Kitchen & Island',
    category: 'Kitchen',
    style: 'Modern',
    description: 'State-of-the-art chef-inspired modular kitchen outfitted with anti-scratch matte acrylic cabinetry, Calacatta quartz countertops, tandem soft-close pantry pullouts, and integrated smart appliances.',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹4.5L - ₹7.5L',
    areaSize: '220 sq.ft.',
    duration: '4 weeks',
    designerName: 'Ananya Deshmukh'
  },
  {
    title: 'Industrial Executive Studio & Office',
    category: 'Office',
    style: 'Industrial',
    description: 'A striking workspace blending exposed brickwork, matte black structural steel frames, solid reclaimed teak executive desk, soundproofing acoustic felt wall, and ergonomic designer task seating.',
    images: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹2.2L - ₹3.8L',
    areaSize: '280 sq.ft.',
    duration: '3 weeks',
    designerName: 'Vikram Sengupta'
  },
  {
    title: 'Scandinavian Luxury Penthouse Living',
    category: 'Living Room',
    style: 'Scandinavian',
    description: 'Expansive double-height living room adorned with natural oak herringbone flooring, floor-to-ceiling panoramic glass drapery, custom Italian boucle sofas, and an architectural marble fireplace mantle.',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹8L - ₹14L',
    areaSize: '850 sq.ft.',
    duration: '8 weeks',
    designerName: 'Priya Sharma'
  },
  {
    title: 'Heritage Traditional Kitchen with Teak Accents',
    category: 'Kitchen',
    style: 'Traditional',
    description: 'Rich Indian heritage-inspired kitchen combining handcrafted solid teakwood cabinetry, hand-painted ceramic backsplash tiles, brass hardware, and modern chimney ventilation.',
    images: [
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹5L - ₹8.5L',
    areaSize: '260 sq.ft.',
    duration: '6 weeks',
    designerName: 'Rahul Mehta'
  },
  {
    title: 'Contemporary Luxury Bedroom with Cove Lighting',
    category: 'Bedroom',
    style: 'Modern',
    description: 'A cozy contemporary master suite featuring an upholstered suede headboard wall, integrated fluted acoustic panels, floating bedside consoles with wireless charging, and dimmable cove illumination.',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹3.8L - ₹6L',
    areaSize: '400 sq.ft.',
    duration: '5 weeks',
    designerName: 'Ananya Deshmukh'
  },
  {
    title: 'Creative Boutique Studio & Lounge',
    category: 'Office',
    style: 'Modern',
    description: 'Dynamic studio workspace crafted with open collaborative brainstorming lounges, acoustic ceiling baffles, custom biophilic planter partitions, and ergonomic modular benching.',
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    budgetRange: '₹4L - ₹6.5L',
    areaSize: '500 sq.ft.',
    duration: '4 weeks',
    designerName: 'Vikram Sengupta'
  }
];

const Item = require('./models/Item');

const itemsData = [
  {
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
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A sculptural statement luminaire marrying artisanal fluted ceramic with brushed warm brass. Casts a soft ambient glow perfect for living room consoles, bedside tables, or study credenzas.',
    features: [
      '3-level touch dimmer built into brass switch',
      'Handcrafted fluted terracotta ceramic base',
      'Energy efficient warm 2700K LED bulb included',
      'Braided neutral fabric power cord with inline switch'
    ]
  },
  {
    name: 'Nordic Minimalist Arc Floor Lamp with Marble Base',
    category: 'Lighting & Lamps',
    price: 7999,
    originalPrice: 10500,
    dimensions: 'Height: 185 cm | Reach: 95 cm | Base Dia: 35 cm',
    material: 'Carbon Steel Arm & Heavy Italian Carrara Marble Base',
    color: 'Matte Charcoal / White Marble',
    leadTime: '3-5 Business Days',
    inStock: true,
    featured: true,
    rating: 4.8,
    reviewCount: 19,
    images: [
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An architectural cantilevered arc lamp that effortlessly hovers illumination over sofas and reading nooks. Weighted with heavy natural marble for absolute stability.',
    features: [
      'Adjustable telescoping arm reach',
      'Foot-step pedal power button',
      'Weighted 18kg genuine marble anti-tilt base'
    ]
  },
  {
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
      'https://images.unsplash.com/photo-1580481077195-c3a824552965?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Generously curved silhouette upholstered in plush, high-rub count bouclé fabric. Ergonomically contoured lumbar support ensures luxurious comfort for conversation areas and bedroom lounges.',
    features: [
      'High-resilience foam cushion core with feather-blend topper',
      'Kiln-dried solid ashwood inner frame with 10-year durability guarantee',
      'Stain-resistant nano-treated bouclé yarn'
    ]
  },
  {
    name: 'Vienna Mid-Century Velvet Dining Armchairs (Pair)',
    category: 'Seating & Chairs',
    price: 18500,
    originalPrice: 24000,
    dimensions: '22" W x 23" D x 33" H each',
    material: 'Rich Olive Velvet & Tapered Brushed Brass Legs',
    color: 'Forest Olive / Brushed Brass',
    leadTime: '4-7 Days Custom Upholstery',
    inStock: true,
    featured: false,
    rating: 4.7,
    reviewCount: 15,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A sophisticated pair of dining armchairs that combine mid-century proportions with deep jewel-toned velvet and tapered brass capped legs.',
    features: [
      'Set includes 2 matching armchairs',
      'Commercial grade 50,000 Martindale rub count velvet',
      'Non-marking protective nylon floor glides'
    ]
  },
  {
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
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Transform accent walls into serene biophilic retreats. Features delicately embossed botanical motifs with subtle micro-foil highlights that catch ambient light.',
    features: [
      'Paste-the-wall technology for bubble-free seamless DIY installation',
      'Washable and scrub-resistant vinyl topcoat',
      'Eco-friendly water-based non-toxic inks with zero VOC emissions'
    ]
  },
  {
    name: 'Japanese Wabi-Sabi Fluted 3D Wall Panel Kit',
    category: 'Wallpapers & Wall Decor',
    price: 5800,
    originalPrice: 7500,
    dimensions: 'Kit contains 4 panels (Total: 8 ft H x 4 ft W coverage)',
    material: 'High-Density Acoustic Wood-Plastic Composite (WPC)',
    color: 'Natural Smoked Oak',
    leadTime: '3-5 Business Days',
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 22,
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Vertical fluted architectural wall slat system that delivers stunning 3D texture and acoustic sound dampening for TV background walls, headboards, and foyer niches.',
    features: [
      'Interlocking tongue-and-groove system',
      'Termite-proof and 100% moisture-resistant core',
      'Built-in acoustic sound absorbing black felt backing'
    ]
  },
  {
    name: 'Capri Fluted Solid Oak Coffee Table',
    category: 'Tables & Consoles',
    price: 16500,
    originalPrice: 21999,
    dimensions: 'Dia: 85 cm | Height: 42 cm',
    material: 'Kiln-Dried Solid White Oak with Matte PU Polyurethane Seal',
    color: 'Natural Warm Oak',
    leadTime: '5-7 Days Handcrafted',
    inStock: true,
    featured: true,
    rating: 4.9,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sculptural circular coffee table showcasing vertical tambour fluted pedestal base and a bevelled bullnose solid wood tabletop.',
    features: [
      'Heat and water stain resistant organic matte wax finish',
      'Seamless rounded corners safe for child-friendly living spaces',
      'Supports up to 120 kg evenly distributed weight'
    ]
  },
  {
    name: 'Nomadic Berber Hand-Knotted Wool Area Rug (5x8 ft)',
    category: 'Rugs & Textiles',
    price: 11999,
    originalPrice: 16500,
    dimensions: '5 ft x 8 ft (152 cm x 244 cm) | 25mm Pile Height',
    material: '100% Hand-Spun New Zealand Wool & Organic Cotton Warp',
    color: 'Oatmeal Base with Charcoal Moroccan Lattice',
    leadTime: 'Ready to Dispatch (2-4 Days)',
    inStock: true,
    featured: true,
    rating: 5.0,
    reviewCount: 17,
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Hand-knotted by master artisans using premium un-dyed natural wool. Exceptionally plush underfoot texture that infuses organic warmth and acoustic dampening into any room.',
    features: [
      'High-density 80,000 knots per sq. meter',
      'Naturally stain-resistant lanolin-rich wool fibers',
      'Includes premium anti-slip felt rug pad'
    ]
  },
  {
    name: 'Sculptural Wavy Terracotta Centerpiece Vase',
    category: 'Decor & Accents',
    price: 2400,
    originalPrice: 3200,
    dimensions: 'Height: 30 cm | Width: 22 cm | Opening: 8 cm',
    material: 'Hand-Thrown Ceramic Stoneware with Matte Rough Finish',
    color: 'Warm Terracotta Sand',
    leadTime: 'Ready to Dispatch (1-2 Days)',
    inStock: true,
    featured: false,
    rating: 4.8,
    reviewCount: 24,
    images: [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An undulating abstract ceramic vase that doubles as a stand-alone sculptural art piece or a vessel for dried pampas grass, eucalyptus, and fresh floral stems.',
    features: [
      '100% waterproof glazed interior lining',
      'Felt-padded bottom to prevent furniture scratches'
    ]
  },
  {
    name: 'Aura 4-Door Fluted Glass Wardrobe with Sensor LED Illumination',
    category: 'Cupboards & Wardrobes',
    price: 38500,
    originalPrice: 48000,
    dimensions: '78" H x 64" W x 22" D | 4 Shutters',
    material: 'Heavy-Duty Moisture Resistant (HDMR) Core, Fluted Tinted Glass & Champagne Gold Aluminum Frame',
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
    name: 'Floating Italian Carrara Marble TV Media Credenza & Display Cabinet',
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
    name: "Modular Chef's Tall Kitchen Pantry & Crockery Cupboard",
    category: 'Cupboards & Wardrobes',
    price: 29500,
    originalPrice: 38000,
    dimensions: '82" H x 36" W x 22" D',
    material: 'Marine Ply Core with Anti-Fingerprint Matte Acrylic Laminate',
    color: 'Sage Olive Matte & Brushed Brass',
    leadTime: '5-7 Days Custom Kitchen Assembly',
    inStock: true,
    featured: false,
    rating: 4.9,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-capacity tall kitchen cupboard equipped with tandem pantry pull-out wire baskets that bring all stored groceries and fine crockery into full view upon opening the main door.',
    features: [
      'Multi-tier stainless steel 304 tandem pull-out wire organizers',
      'Heat, moisture, and boiling-water proof (BWP) marine ply construction',
      'Integrated spice carousel and appliance garage compartment'
    ]
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/awdprj';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear old portfolio entries with typos/bad URLs
    await Portfolio.deleteMany({});
    console.log('Cleared previous portfolio records.');

    // Insert clean portfolio data
    const insertedPort = await Portfolio.insertMany(portfolioData);
    console.log(`Successfully seeded ${insertedPort.length} high-resolution portfolio projects!`);

    // Clear and seed physical furnishing items
    await Item.deleteMany({});
    console.log('Cleared previous items records.');
    const insertedItems = await Item.insertMany(itemsData);
    console.log(`Successfully seeded ${insertedItems.length} physical furnishings and decor items!`);

    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();

