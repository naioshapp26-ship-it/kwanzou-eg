/** Default store data — seeded into PostgreSQL on first run */
const { categories, products, CATALOG_VERSION } = require('./catalog-defaults');

module.exports = {
  catalogVersion: CATALOG_VERSION,
  settings: {
    brandName: 'Kwanzou EG',
    logo: 'assets/logo-brand.svg',
    heroEyebrowCityAr: 'الإسكندرية',
    heroEyebrowCityEn: 'Alexandria',
    heroEyebrowNoteAr: 'توصيل لجميع أنحاء مصر',
    heroEyebrowNoteEn: 'Delivery across all of Egypt',
    tagline: 'Kwanzou EG — Made to complete your elegance',
    taglineAr: 'Kwanzou EG — إكسسوارات ودهب على ذوقك',
    taglineEn: 'Kwanzou EG — Made to complete your elegance',
    subtitle: 'Discover exquisite jewelry, luxury handbags, and signature accessories.',
    subtitleAr: 'شوف أحلى دهب، شنط، وإكسسوارات من Kwanzou EG.',
    subtitleEn: 'Discover exquisite jewelry, luxury handbags, and signature accessories from Kwanzou EG.',
    announcement: 'Free shipping across Egypt on orders over 1,500 EGP',
    announcementAr: 'توصيل مجاني لكل مصر على الطلبات فوق 1,500 ج.م',
    announcementEn: 'Free shipping across Egypt on orders over 1,500 EGP',
    heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=85',
    heroAccent1: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=650&q=80',
    heroAccent2: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=650&q=80',
    promoImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=85',
    authVisualImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80',
    instaHandle: '@kwanzou.eg',
    instaUrl: 'https://instagram.com/kwanzou.eg',
    currency: 'EGP',
    currencySymbol: 'ج.م',
    freeShippingThreshold: 1500,
    heroTypography: {
      eyebrow: { font: 'cairo', size: 0.82, weight: 600 },
      brand: { font: 'cormorant', size: 3.25, weight: 600 },
      tagline: { font: 'cairo', size: 1.05, weight: 500 },
      subtitle: { font: 'cairo', size: 0.95, weight: 400 }
    }
  },
  categories,
  products,
  collections: [
    { id: 'col-1', label: 'Collection 01', labelAr: 'سلاسل', labelEn: 'Necklaces', title: 'Gold\nNecklaces', titleAr: 'سلاسل\nدهب', titleEn: 'Gold\nNecklaces', slug: 'necklaces', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80' },
    { id: 'col-2', label: 'Collection 02', labelAr: 'أساور', labelEn: 'Bracelets', title: 'Stacked\nBracelets', titleAr: 'أساور\nترند', titleEn: 'Stacked\nBracelets', slug: 'bracelets', image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=1200&q=80' },
    { id: 'col-3', label: 'Collection 03', labelAr: 'حلقان', labelEn: 'Earrings', title: 'Everyday\nEarrings', titleAr: 'حلقان\nيومية', titleEn: 'Everyday\nEarrings', slug: 'accessories', image: 'https://images.unsplash.com/photo-1617038220319-496d8d1736f4?w=1200&q=80' },
    { id: 'col-4', label: 'Collection 04', labelAr: 'برفانات', labelEn: 'Perfumes', title: 'Signature\nScents', titleAr: 'برفانات\nمميزة', titleEn: 'Signature\nScents', slug: 'perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200&q=80' }
  ],
  instagramGallery: [
    { id: 'ig-1', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
    { id: 'ig-2', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80' },
    { id: 'ig-3', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80' },
    { id: 'ig-4', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80' },
    { id: 'ig-5', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c42?w=600&q=80' },
    { id: 'ig-6', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80' }
  ],
  testimonials: [
    { id: 't1', name: 'Nour Hassan', location: 'Cairo, Egypt', text: 'The gold accessories are amazing quality.', textAr: 'إكسسوارات الدهب عندهم جامدة جداً وما بتصديش.', textEn: 'The gold accessories are amazing quality.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', featured: false },
    { id: 't2', name: 'Mariam Ali', location: 'Alexandria, Egypt', text: 'Best bags and perfumes in one shop.', textAr: 'أحلى شنط وبرفانات في مكان واحد.', textEn: 'Best bags and perfumes in one shop.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', featured: true },
    { id: 't3', name: 'Yasmin Farid', location: 'Giza, Egypt', text: 'Fast delivery and great selection.', textAr: 'التوصيل سريع والحلقان والاساور حلوين أوي.', textEn: 'Fast delivery and great selection.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', featured: false }
  ],
  users: [
    { id: 'u-admin', name: 'Super Admin', email: 'admin@lumiere.com', password: 'admin123', role: 'superadmin', phone: '+20 100 000 0000', createdAt: '2024-01-01' },
    { id: 'u-demo', name: 'Sarah Mitchell', email: 'customer@lumiere.com', password: 'demo123', role: 'customer', phone: '+20 100 000 0001', createdAt: '2025-03-15', wishlist: ['p-e2', 'p-b2'], orders: [] }
  ],
  orders: [],
  newsletter: [],
  cart: {}
};
