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
    announcementLines: [
      { en: 'Free shipping across Egypt on orders over 1,500 EGP', ar: 'توصيل مجاني لكل مصر على الطلبات فوق 1,500 ج.م' },
      { en: '316L stainless steel & gold accessories — made to last, made to shine', ar: 'إكسسوارات استالس 316L ودهب — جودة بتدوم وما بتصديش' }
    ],
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
    theme: {
      primary: '#1A1208',
      accent: '#FF6B00',
      accentLight: '#FF9333',
      accentDark: '#E85D00',
      background: '#FFFFFF',
      cream: '#FFF5EF',
      textSecondary: '#6B5348'
    },
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
    { id: 't1', name: 'نور حسن', location: 'القاهرة', text: 'الاستالس عندهم جامد وما بيصدّيش.', textAr: 'الاستالس عندهم جامد وما بيصدّيش — لابساه كل يوم.', textEn: 'Their stainless pieces are solid and never rust.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', featured: false },
    { id: 't2', name: 'مريم علي', location: 'الإسكندرية', text: 'السلسلة وصلت زي الصور والتغليف فخم.', textAr: 'السلسلة وصلت زي الصور والتغليف فخم أوي.', textEn: 'The necklace matched the photos and packaging was lovely.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', featured: true },
    { id: 't3', name: 'ياسمين فريد', location: 'الجيزة', text: 'التوصيل سريع والساعة تحفة.', textAr: 'التوصيل سريع والساعة تحفة — هطلب تاني أكيد.', textEn: 'Fast delivery and the watch is gorgeous.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', featured: false },
    { id: 't4', name: 'سلمى أحمد', location: 'المنصورة', text: 'الخاتم شكله شيك والجودة عالية.', textAr: 'الخاتم شكله شيك والجودة عالية — موقع ثقة.', textEn: 'The ring looks chic and the quality is high.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', featured: false }
  ],
  reviewScreenshots: [
    { id: 'rs-1', image: 'assets/reviews/shot-1.svg' },
    { id: 'rs-2', image: 'assets/reviews/shot-2.svg' },
    { id: 'rs-3', image: 'assets/reviews/shot-3.svg' },
    { id: 'rs-4', image: 'assets/reviews/shot-4.svg' }
  ],
  users: [],
  orders: [],
  newsletter: [],
  staffAdmins: [],
  cart: {}
};
